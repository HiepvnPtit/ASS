import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { BaseService } from '../common/base/base.service';
import { BangGia } from '../entities/bang-gia.entity';
import { CreateBangGiaDto } from './dto/create-bang-gia.dto';
import { UpdateBangGiaDto } from './dto/update-bang-gia.dto';

/**
 * BangGia Service - Price Table Management
 *
 * Extends BaseService for standard CRUD operations.
 * Custom logic:
 * - Price validation (giaCoBan and giaTheoKm must be > 0)
 * - Uses maBangGia as primary key (instead of id)
 * - Soft delete via deletedAt timestamp
 * - Relations with LoaiXe (vehicle type)
 */
@Injectable()
export class BangGiaService extends BaseService<BangGia> {
  constructor(
    @InjectRepository(BangGia)
    private readonly bangGiaRepo: Repository<BangGia>,
  ) {
    super(bangGiaRepo);
  }

  /**
   * Override findAll to include loaiXe relation
   */
  async findAll(): Promise<BangGia[]> {
    return this.bangGiaRepo.find({ relations: ['loaiXe'] });
  }

  /**
   * Override findOne to include loaiXe relation
   */
  async findOne(maBangGia: string): Promise<BangGia> {
    const item = await this.bangGiaRepo.findOne({
      where: { maBangGia },
      relations: ['loaiXe'],
    });
    if (!item) {
      throw new NotFoundException(`BangGia với mã ${maBangGia} không tồn tại`);
    }
    return item;
  }

  /**
   * Create BangGia with custom price validation and auto-generated mã
   * Auto-generates both maBangGia and ma if not provided
   */
  async createBangGia(dto: CreateBangGiaDto): Promise<BangGia> {
    if (dto.giaCoBan <= 0) {
      throw new BadRequestException('Giá cơ bản phải lớn hơn 0');
    }

    // Auto-generate maBangGia if not provided
    const maBangGia =
      dto.maBangGia || `BG-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Auto-generate ma if not provided - CRITICAL to avoid null constraint violation
    const ma = `BG-${Date.now()}-${uuidv4().substring(0, 8)}`;

    const entity = this.bangGiaRepo.create({
      maBangGia,
      ma,
      loaiXe: { maLoaiXe: dto.maLoaiXe } as any,
      khuVuc: dto.khuVuc,
      khungGio: dto.khungGio,
      giaCoBan: dto.giaCoBan.toString(),
      giaTheoKm: dto.giaTheoKm.toString(),
      ngayApDung: new Date(dto.ngayApDung),
      hieuLucTu: new Date(dto.hieuLucTu),
      hieuLucDen: dto.hieuLucDen ? new Date(dto.hieuLucDen) : undefined,
    });

    return this.bangGiaRepo.save(entity);
  }

  /**
   * Override update with price validation
   */
  async updateBangGia(
    maBangGia: string,
    dto: UpdateBangGiaDto,
  ): Promise<BangGia> {
    if (dto.giaCoBan !== undefined && dto.giaCoBan <= 0) {
      throw new BadRequestException('Giá cơ bản phải lớn hơn 0');
    }

    const item = await this.findOne(maBangGia);

    if (dto.giaCoBan !== undefined) item.giaCoBan = dto.giaCoBan.toString();
    if (dto.giaTheoKm !== undefined) item.giaTheoKm = dto.giaTheoKm.toString();
    if (dto.hieuLucDen !== undefined) {
      item.hieuLucDen = dto.hieuLucDen ? new Date(dto.hieuLucDen) : undefined;
    }
    if (dto.maLoaiXe !== undefined) {
      item.loaiXe = { maLoaiXe: dto.maLoaiXe } as any;
    }
    if (dto.khuVuc !== undefined) item.khuVuc = dto.khuVuc;
    if (dto.khungGio !== undefined) item.khungGio = dto.khungGio;
    if (dto.ngayApDung !== undefined)
      item.ngayApDung = new Date(dto.ngayApDung);
    if (dto.hieuLucTu !== undefined) item.hieuLucTu = new Date(dto.hieuLucTu);

    return this.bangGiaRepo.save(item);
  }
}
