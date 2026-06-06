import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Not } from 'typeorm';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { NguoiDung } from '../../entities/nguoi-dung.entity';
import { KhachHang } from '../../entities/khach-hang.entity';
import { TaiXe } from '../../entities/tai-xe.entity';
import { MailService } from '../../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class SimpleAuthService {
  constructor(
    @InjectRepository(NguoiDung)
    private readonly usersRepo: Repository<NguoiDung>,
    @InjectRepository(KhachHang)
    private readonly customersRepo: Repository<KhachHang>,
    @InjectRepository(TaiXe)
    private readonly driversRepo: Repository<TaiXe>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto) {
    // Pre-validation: check for existing email/phone (read-only, no transaction needed)
    const existing = await this.usersRepo.findOne({
      where: [{ email: dto.email }, { soDienThoai: dto.soDienThoai }],
    });
    if (existing) {
      throw new BadRequestException('Email or phone already exists');
    }

    const hashed = await bcrypt.hash(dto.matKhau, 10);

    // Wrap all writes in a transaction to guarantee atomicity
    return await this.dataSource.transaction(async (manager) => {
      // === Create User ===
      const user = manager.create(NguoiDung, {
        hoTen: dto.hoTen,
        soDienThoai: dto.soDienThoai,
        email: dto.email ?? undefined,
        matKhau: hashed,
        vaiTro: dto.vaiTro,
      });
      await manager.save(user);

      const publicUser = {
        maNguoiDung: user.maNguoiDung,
        hoTen: user.hoTen,
        soDienThoai: user.soDienThoai,
        email: user.email ?? null,
        vaiTro: user.vaiTro,
        trangThai: user.trangThai,
        ngayTao: user.ngayTao,
      };

      // === Xử lý vai trò CUSTOMER ===
      if (dto.vaiTro === 'CUSTOMER') {
        const kh = manager.create(KhachHang, {
          nguoiDung: user,
        });
        await manager.save(kh);
        return {
          user: publicUser,
          khachHang: {
            maKhachHang: kh.maKhachHang,
            diaChiMacDinh: kh.diaChiMacDinh ?? null,
            ghiChu: kh.ghiChu ?? null,
          },
        };
      }

      // === Xử lý vai trò DRIVER ===
      if (dto.vaiTro === 'DRIVER') {
        const tx = manager.create(TaiXe, {
          nguoiDung: user,
          soGiayPhepLaiXe: dto.soGiayPhepLaiXe,
          canCuocCongDan: dto.canCuocCongDan,
          hanGiayPhepLaiXe:
            dto.hanGiayPhepLaiXe && !isNaN(Date.parse(dto.hanGiayPhepLaiXe))
              ? new Date(dto.hanGiayPhepLaiXe)
              : undefined,
        });
        await manager.save(tx);
        return {
          user: publicUser,
          taiXe: {
            maTaiXe: tx.maTaiXe,
            trangThaiHoatDong: tx.trangThaiHoatDong,
            trangThaiXacThuc: tx.trangThaiXacThuc,
          },
        };
      }

      return { user: publicUser };
    });
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.matKhau, user.matKhau);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      id: user.maNguoiDung,
      maNguoiDung: user.maNguoiDung,
      sessionId: user.maNguoiDung,
      vaiTro: user.vaiTro,
      role: { id: user.vaiTro, name: user.vaiTro },
    };
    const token = this.jwtService.sign(payload);
    return { token };
  }

  /**
   * Update user profile - self-service endpoint for PATCH /auth/me
   * @param maNguoiDung - User ID from JWT token
   * @param updateProfileDto - Profile update data (all fields optional)
   * @returns Updated user object without password field
   */
  async updateProfile(maNguoiDung: string, updateProfileDto: UpdateProfileDto) {
    // Find user
    const user = await this.usersRepo.findOne({
      where: { maNguoiDung },
    });
    if (!user) throw new BadRequestException('User not found');

    // Pre-validation: Check if email or phone already exists (excluding current user)
    if (updateProfileDto.email || updateProfileDto.soDienThoai) {
      // Check email if provided
      if (updateProfileDto.email) {
        const emailExists = await this.usersRepo.findOne({
          where: {
            email: updateProfileDto.email,
            maNguoiDung: Not(maNguoiDung),
          },
        });
        if (emailExists) {
          throw new BadRequestException(
            'Số điện thoại hoặc email này đã được sử dụng bởi tài khoản khác.',
          );
        }
      }

      // Check phone number if provided
      if (updateProfileDto.soDienThoai) {
        const phoneExists = await this.usersRepo.findOne({
          where: {
            soDienThoai: updateProfileDto.soDienThoai,
            maNguoiDung: Not(maNguoiDung),
          },
        });
        if (phoneExists) {
          throw new BadRequestException(
            'Số điện thoại hoặc email này đã được sử dụng bởi tài khoản khác.',
          );
        }
      }
    }

    // Hash password if provided
    if (updateProfileDto.matKhau) {
      user.matKhau = await bcrypt.hash(updateProfileDto.matKhau, 10);
    }

    // Update other fields
    if (updateProfileDto.hoTen) user.hoTen = updateProfileDto.hoTen;
    if (updateProfileDto.soDienThoai)
      user.soDienThoai = updateProfileDto.soDienThoai;
    if (updateProfileDto.email) user.email = updateProfileDto.email;
    if (updateProfileDto.avatar) user.avatar = updateProfileDto.avatar;

    // Save updated user
    await this.usersRepo.save(user);

    // Return user without password
    return {
      maNguoiDung: user.maNguoiDung,
      hoTen: user.hoTen,
      soDienThoai: user.soDienThoai,
      email: user.email ?? null,
      vaiTro: user.vaiTro,
      trangThai: user.trangThai,
      avatar: user.avatar ?? null,
      ngayTao: user.ngayTao,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Get current user profile - GET /auth/me endpoint
   * @param maNguoiDung - User ID from JWT token
   * @returns User object without password field
   */
  async getProfile(maNguoiDung: string) {
    const user = await this.usersRepo.findOne({
      where: { maNguoiDung },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Return user without password
    return {
      maNguoiDung: user.maNguoiDung,
      hoTen: user.hoTen,
      soDienThoai: user.soDienThoai,
      email: user.email ?? null,
      vaiTro: user.vaiTro,
      trangThai: user.trangThai,
      avatar: user.avatar ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      ngayTao: user.ngayTao,
    };
  }

  /**
   * Request password reset - POST /auth/forgot-password
   * @param dto - ForgotPasswordDto containing email
   * @returns Message confirming email sent
   */
  async requestForgotPassword(dto: ForgotPasswordDto) {
    // 1. Check if user exists with this email
    const user = await this.usersRepo.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new BadRequestException(
        'Email không tồn tại trong hệ thống hoặc tài khoản chưa đăng ký.',
      );
    }

    // 2. Generate 6-digit OTP (random number from 100000 to 999999)
    const otp = String(Math.floor(Math.random() * 900000) + 100000);

    // 3. Calculate token expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 4. Update user with OTP and expiration time using repo.update()
    await this.usersRepo.update(
      { maNguoiDung: user.maNguoiDung },
      {
        matKhauResetToken: otp,
        matKhauResetTokenExpires: expiresAt,
      },
    );

    // 5. Send email with OTP
    await this.mailService.forgotPassword({
      to: user.email!,
      data: {
        otp: otp,
      },
    });

    return {
      message: 'Email hướng dẫn đặt lại mật khẩu đã được gửi.',
      email: user.email,
    };
  }

  /**
   * Reset password - POST /auth/reset-password
   * @param dto - ResetPasswordDto containing OTP and new password
   * @returns Message confirming password reset
   */
  async resetPassword(dto: ResetPasswordDto) {
    // 1. Find user with matching OTP that hasn't expired
    const user = await this.usersRepo.findOne({
      where: {
        matKhauResetToken: dto.otp,
      },
    });

    if (!user) {
      throw new BadRequestException('Mã OTP không hợp lệ.');
    }

    // 2. Check if OTP has expired
    if (
      !user.matKhauResetTokenExpires ||
      user.matKhauResetTokenExpires < new Date()
    ) {
      throw new BadRequestException(
        'Mã OTP đã hết hạn. Vui lòng yêu cầu cấp mã mới.',
      );
    }

    // 3. Hash new password using bcrypt
    const hashedPassword = await bcrypt.hash(dto.matKhau, 10);

    // 4. Update password and clear reset OTP using repo.update()
    await this.usersRepo.update({ maNguoiDung: user.maNguoiDung }, {
      matKhau: hashedPassword,
      matKhauResetToken: undefined,
      matKhauResetTokenExpires: undefined,
    } as any);

    return {
      message: 'Mật khẩu đã được cập nhật thành công.',
    };
  }
}
