import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../common/base/base.service';
import { LoaiXe } from '../entities/loai-xe.entity';
import { CreateLoaiXeDto } from './dto/create-loai-xe.dto';
import { UpdateLoaiXeDto } from './dto/update-loai-xe.dto';

/**
 * LoaiXe Service - Vehicle Type Management
 *
 * Extends BaseService for standard CRUD operations.
 * Custom logic:
 * - Validation of soCho (must be > 0)
 * - Uses maLoaiXe (instead of id) as lookup key
 * - Soft delete via deletedAt timestamp
 */
@Injectable()
export class LoaiXeService extends BaseService<LoaiXe> {
  constructor(
    @InjectRepository(LoaiXe)
    private readonly loaiXeRepo: Repository<LoaiXe>,
  ) {
    super(loaiXeRepo);
  }

  /**
   * Create a new vehicle type
   * Validates: soCho must be > 0
   */
  async create(dto: CreateLoaiXeDto): Promise<LoaiXe> {
    if (dto.soCho <= 0) {
      throw new BadRequestException('Số chỗ phải lớn hơn 0');
    }
    return super.create(dto);
  }

  /**
   * Find all vehicle types with optional relations
   */
  async findAllWithRelations(relations?: string[]): Promise<LoaiXe[]> {
    return super.findAll({
      relations,
      order: { maLoaiXe: 'ASC' } as any,
    });
  }

  /**
   * Find a single vehicle type by maLoaiXe (primary key)
   * @param maLoaiXe Vehicle type code (e.g., 'LX001')
   */
  async findOne(maLoaiXe: string, relations?: string[]): Promise<LoaiXe> {
    const item = await this.loaiXeRepo.findOne({
      where: { maLoaiXe },
      relations,
      withDeleted: false,
    });

    if (!item) {
      throw new NotFoundException(`Loại xe với mã "${maLoaiXe}" không tồn tại`);
    }

    return item;
  }

  /**
   * Update a vehicle type
   * Validates: soCho must be > 0 if provided
   */
  async update(maLoaiXe: string, dto: UpdateLoaiXeDto): Promise<LoaiXe> {
    if (dto.soCho !== undefined && dto.soCho <= 0) {
      throw new BadRequestException('Số chỗ phải lớn hơn 0');
    }

    await this.loaiXeRepo.update(maLoaiXe, dto as any);
    return this.findOne(maLoaiXe);
  }

  /**
   * Soft delete a vehicle type (set deletedAt timestamp)
   */
  async remove(maLoaiXe: string): Promise<LoaiXe> {
    const item = await this.findOne(maLoaiXe);
    return this.loaiXeRepo.softRemove(item);
  }

  /**
   * Permanently delete a vehicle type (hard delete)
   */
  async hardRemove(maLoaiXe: string): Promise<void> {
    const item = await this.findOne(maLoaiXe);
    await this.loaiXeRepo.remove(item);
  }

  /**
   * Check if vehicle type exists
   */
  async exists(maLoaiXe: string): Promise<boolean> {
    const count = await this.loaiXeRepo.count({
      where: { maLoaiXe },
      withDeleted: false,
    });
    return count > 0;
  }
}
