import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import bcrypt from 'bcryptjs';
import { DeviceToken } from '../../entities/device-token.entity';
import { NguoiDung } from '../../entities/nguoi-dung.entity';
import { CreateDeviceTokenDto } from './dto/create-device-token.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepo: Repository<DeviceToken>,
    @InjectRepository(NguoiDung)
    private readonly usersRepo: Repository<NguoiDung>,
  ) {}

  /**
   * Lưu FCM token của thiết bị người dùng
   * Đảm bảo không lưu trùng lặp (unique constraint trên [maNguoiDung, token])
   */
  async addDeviceToken(
    maNguoiDung: string,
    dto: CreateDeviceTokenDto,
  ): Promise<DeviceToken> {
    // Kiểm tra user có tồn tại không
    const user = await this.usersRepo.findOne({
      where: { maNguoiDung },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Tìm xem token này đã tồn tại cho user này chưa
    const existingToken = await this.deviceTokenRepo.findOne({
      where: {
        maNguoiDung,
        token: dto.token,
      },
    });

    if (existingToken) {
      // Nếu đã tồn tại, cập nhật last_used_at và isActive
      existingToken.lastUsedAt = new Date();
      existingToken.isActive = true;
      if (dto.platform) existingToken.platform = dto.platform;
      if (dto.deviceName) existingToken.deviceName = dto.deviceName;
      return this.deviceTokenRepo.save(existingToken);
    }

    // Tạo mới device token
    const deviceToken = this.deviceTokenRepo.create({
      maNguoiDung,
      token: dto.token,
      platform: dto.platform,
      deviceName: dto.deviceName,
      isActive: true,
      lastUsedAt: new Date(),
    });

    return this.deviceTokenRepo.save(deviceToken);
  }

  /**
   * Xóa một device token cụ thể
   */
  async removeDeviceToken(maNguoiDung: string, tokenId: string): Promise<void> {
    const deviceToken = await this.deviceTokenRepo.findOne({
      where: {
        id: tokenId,
        maNguoiDung,
      },
    });

    if (!deviceToken) {
      throw new BadRequestException('Device token not found or unauthorized');
    }

    await this.deviceTokenRepo.remove(deviceToken);
  }

  /**
   * Xóa tất cả device tokens của một user
   */
  async removeAllDeviceTokens(maNguoiDung: string): Promise<void> {
    await this.deviceTokenRepo.delete({
      maNguoiDung,
    });
  }

  /**
   * Lấy tất cả device tokens của một user
   */
  async getDeviceTokens(maNguoiDung: string): Promise<DeviceToken[]> {
    return this.deviceTokenRepo.find({
      where: {
        maNguoiDung,
        isActive: true,
      },
      order: {
        lastUsedAt: 'DESC',
      },
    });
  }

  /**
   * Cập nhật lastUsedAt của một device token
   */
  async updateLastUsedAt(tokenId: string): Promise<void> {
    await this.deviceTokenRepo.update(
      { id: tokenId },
      { lastUsedAt: new Date() },
    );
  }

  /**
   * Update user profile (PUT /api/users/me)
   * User CAN change: hoTen, soDienThoai, email, matKhau, avatar
   * User CANNOT change: maNguoiDung, ma, vaiTro, trangThai (system fields)
   */
  async updateProfile(
    maNguoiDung: string,
    dto: UpdateUserProfileDto,
  ): Promise<any> {
    // 1. Find user
    const user = await this.usersRepo.findOne({
      where: { maNguoiDung },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // 2. Check for duplicate email/phone (exclude current user)
    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.usersRepo.findOne({
        where: {
          email: dto.email,
          maNguoiDung: Not(maNguoiDung),
        },
      });
      if (existingEmail) {
        throw new BadRequestException(
          'Email này đã được sử dụng bởi tài khoản khác.',
        );
      }
    }

    if (dto.soDienThoai && dto.soDienThoai !== user.soDienThoai) {
      const existingPhone = await this.usersRepo.findOne({
        where: {
          soDienThoai: dto.soDienThoai,
          maNguoiDung: Not(maNguoiDung),
        },
      });
      if (existingPhone) {
        throw new BadRequestException(
          'Số điện thoại này đã được sử dụng bởi tài khoản khác.',
        );
      }
    }

    // 3. Prepare update data
    const updateData: any = {};

    if (dto.hoTen) updateData.hoTen = dto.hoTen;
    if (dto.soDienThoai) updateData.soDienThoai = dto.soDienThoai;
    if (dto.email) updateData.email = dto.email;
    if (dto.avatar) updateData.avatar = dto.avatar;

    // 4. Hash password if provided
    if (dto.matKhau) {
      updateData.matKhau = await bcrypt.hash(dto.matKhau, 10);
    }

    // 5. Update user using repo.update() to avoid Phantom Update
    await this.usersRepo.update({ maNguoiDung }, updateData);

    // 6. Fetch updated user
    const updatedUser = await this.usersRepo.findOne({
      where: { maNguoiDung },
    });

    if (!updatedUser) {
      throw new BadRequestException('Failed to update user');
    }

    // 7. Return user without password
    return {
      maNguoiDung: updatedUser.maNguoiDung,
      hoTen: updatedUser.hoTen,
      soDienThoai: updatedUser.soDienThoai,
      email: updatedUser.email ?? null,
      vaiTro: updatedUser.vaiTro,
      trangThai: updatedUser.trangThai,
      avatar: updatedUser.avatar ?? null,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      ngayTao: updatedUser.ngayTao,
    };
  }
}
