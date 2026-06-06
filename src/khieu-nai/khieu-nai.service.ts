import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsOrder } from 'typeorm';
import { BaseService } from '../common/base/base.service';
import { KhieuNai } from '../entities/khieu-nai.entity';
import { CreateKhieuNaiDto } from './dto/create-khieu-nai.dto';
import { UpdateKhieuNaiStatusDto } from './dto/update-khieu-nai-status.dto';

/**
 * KhieuNai Service - Quản lý khiếu nại
 *
 * Kế thừa BaseService để thực hiện các thao tác CRUD cơ bản.
 * Logic tùy chỉnh:
 * - Tạo khiếu nại mới với xác thực
 * - Lấy danh sách khiếu nại của người dùng
 * - Lấy danh sách khiếu nại cho admin
 * - Xử lý/giải quyết khiếu nại
 */
@Injectable()
export class KhieuNaiService extends BaseService<KhieuNai> {
  constructor(
    @InjectRepository(KhieuNai)
    private readonly khieuNaiRepo: Repository<KhieuNai>,
  ) {
    super(khieuNaiRepo);
  }

  /**
   * Create a new complaint
   * @param userId User ID (will be stored as the person filing the complaint)
   * @param dto Create complaint DTO
   * @returns Created complaint entity
   */
  async createComplaint(
    userId: string,
    dto: CreateKhieuNaiDto,
  ): Promise<KhieuNai> {
    if (!dto.maChuyenDi) {
      throw new BadRequestException('maChuyenDi is required');
    }

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const complaint = this.khieuNaiRepo.create({
      ...dto,
      maNguoiGui: userId,
      trangThai: 'PENDING',
    });

    return this.khieuNaiRepo.save(complaint);
  }

  /**
   * Find complaints filed by a specific user
   * @param userId User ID to filter by maNguoiGui
   * @returns Array of complaints for that user
   */
  async findMyComplaints(
    userId: string,
    options?: {
      skip?: number;
      take?: number;
    },
  ): Promise<KhieuNai[]> {
    return this.khieuNaiRepo.find({
      where: { maNguoiGui: userId },
      relations: ['chuyenDi', 'nguoiGui', 'nguoiXuLy'],
      skip: options?.skip || 0,
      take: options?.take || 20,
      order: { thoiGianTao: 'DESC' } as FindOptionsOrder<KhieuNai>,
    });
  }

  /**
   * Find all complaints for admin (with pagination and filtering)
   * @param filters Optional filters (status, type, etc.)
   * @returns Paginated complaints
   */
  async findAllForAdmin(filters?: {
    trangThai?: string;
    loaiNguoiGui?: string;
    skip?: number;
    take?: number;
  }): Promise<{ data: KhieuNai[]; total: number }> {
    const where: any = {};

    if (filters?.trangThai) {
      where.trangThai = filters.trangThai;
    }

    if (filters?.loaiNguoiGui) {
      where.loaiNguoiGui = filters.loaiNguoiGui;
    }

    const [data, total] = await this.khieuNaiRepo.findAndCount({
      where,
      relations: ['chuyenDi', 'nguoiGui', 'nguoiXuLy'],
      skip: filters?.skip || 0,
      take: filters?.take || 20,
      order: { thoiGianTao: 'DESC' } as FindOptionsOrder<KhieuNai>,
    });

    return { data, total };
  }

  /**
   * Resolve a complaint (Admin only)
   * @param id Complaint ID
   * @param dto Update status DTO
   * @param adminId ID of admin handling the complaint
   * @returns Updated complaint
   */
  async resolve(
    id: string,
    dto: UpdateKhieuNaiStatusDto,
    adminId?: string,
  ): Promise<KhieuNai> {
    const complaint = await this.khieuNaiRepo.findOne({
      where: { maKhieuNai: id },
      relations: ['chuyenDi', 'nguoiGui', 'nguoiXuLy'],
    });

    if (!complaint) {
      throw new NotFoundException(`Complaint with ID ${id} not found`);
    }

    // Prepare update data
    const updateData: any = {
      trangThai: dto.trangThai,
      maNguoiXuLy: adminId,
    };

    if (dto.ketQuaXuLy) {
      updateData.ketQuaXuLy = dto.ketQuaXuLy;
    }

    // Set resolution time if status is final (RESOLVED or REJECTED)
    if (['RESOLVED', 'REJECTED'].includes(dto.trangThai)) {
      updateData.thoiGianXuLy = new Date();
    }

    // Update using repo.update() for efficiency
    await this.khieuNaiRepo.update({ maKhieuNai: id }, updateData);

    // Return updated entity
    return this.khieuNaiRepo.findOne({
      where: { maKhieuNai: id },
      relations: ['chuyenDi', 'nguoiGui', 'nguoiXuLy'],
    }) as Promise<KhieuNai>;
  }

  /**
   * Get complaint statistics
   * @returns Statistics object
   */
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    processing: number;
    resolved: number;
    rejected: number;
  }> {
    const total = await this.khieuNaiRepo.count();
    const pending = await this.khieuNaiRepo.count({
      where: { trangThai: 'PENDING' },
    });
    const processing = await this.khieuNaiRepo.count({
      where: { trangThai: 'PROCESSING' },
    });
    const resolved = await this.khieuNaiRepo.count({
      where: { trangThai: 'RESOLVED' },
    });
    const rejected = await this.khieuNaiRepo.count({
      where: { trangThai: 'REJECTED' },
    });

    return { total, pending, processing, resolved, rejected };
  }
}
