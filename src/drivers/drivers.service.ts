import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TaiXe } from '../entities/tai-xe.entity';
import { ViTri } from '../entities/vi-tri.entity';
import { ChuyenDi } from '../entities/chuyen-di.entity';
import { UpdateDriverStatusDto } from './dto/update-driver-status.dto';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(TaiXe)
    private readonly taiXeRepo: Repository<TaiXe>,
    @InjectRepository(ViTri)
    private readonly viTriRepo: Repository<ViTri>,
    @InjectRepository(ChuyenDi)
    private readonly chuyenDiRepo: Repository<ChuyenDi>,
  ) {}

  /**
   * Lấy thông tin hồ sơ tài xế hiện tại
   */
  async getProfile(maTaiXe: string) {
    const driver = await this.taiXeRepo.findOne({
      where: { maTaiXe },
      relations: ['nguoiDung'],
    });

    if (!driver) {
      throw new NotFoundException('Tài xế không tồn tại');
    }

    return {
      maTaiXe: driver.maTaiXe,
      soGiayPhepLaiXe: driver.soGiayPhepLaiXe,
      canCuocCongDan: driver.canCuocCongDan,
      diemDanhGia: driver.diemDanhGia,
      trangThaiHoatDong: driver.trangThaiHoatDong,
      trangThaiXacThuc: driver.trangThaiXacThuc,
      hanGiayPhepLaiXe: driver.hanGiayPhepLaiXe,
      nguoiDung: driver.nguoiDung,
    };
  }

  /**
   * Cập nhật trạng thái làm việc (ONLINE/OFFLINE)
   */
  async updateStatus(maTaiXe: string, updateStatusDto: UpdateDriverStatusDto) {
    const driver = await this.taiXeRepo.findOne({
      where: { maTaiXe },
    });

    if (!driver) {
      throw new NotFoundException('Tài xế không tồn tại');
    }

    driver.trangThaiHoatDong = updateStatusDto.trangThaiHoatDong;
    const updated = await this.taiXeRepo.save(driver);

    return {
      message: `Cập nhật trạng thái thành ${updateStatusDto.trangThaiHoatDong} thành công`,
      trangThaiHoatDong: updated.trangThaiHoatDong,
    };
  }

  /**
   * Update driver's current GPS location (real-time tracking)
   * 1. Update viDoHienTai & kinhDoHienTai in TaiXe table for nearby driver search
   * 2. If trip is active, also save location to ViTri table for trip trajectory
   *
   * @param maNguoiDung - User ID from JWT token
   * @param createLocationDto - GPS coordinates (viDo, kinhDo)
   * @returns Updated location info
   */
  async updateLocation(
    maNguoiDung: string,
    createLocationDto: CreateLocationDto,
  ) {
    // Find driver by user ID (via nguoiDung relationship)
    const driver = await this.taiXeRepo.findOne({
      where: { nguoiDung: { maNguoiDung } as any },
      relations: { nguoiDung: true } as any,
    });

    if (!driver) {
      throw new NotFoundException('Tài xế không tồn tại');
    }

    // Update current real-time location on TaiXe
    driver.viDoHienTai = createLocationDto.viDo;
    driver.kinhDoHienTai = createLocationDto.kinhDo;
    const updatedDriver = await this.taiXeRepo.save(driver);

    // If driver has active trip, also save location to ViTri for trajectory tracking
    const activeTrip = await this.chuyenDiRepo.findOne({
      where: {
        taiXe: { maTaiXe: driver.maTaiXe },
        trangThai: 'STARTED',
      },
      order: {
        thoiGianBatDau: 'DESC',
      },
    });

    let location: ViTri | null = null;
    if (activeTrip) {
      // Save location with loaiDoiTuong = 'DRIVER' for trip trajectory
      location = new ViTri();
      location.maViTri = `vt_${Date.now()}_${driver.maTaiXe}`;
      location.chuyenDi = activeTrip;
      location.loaiDoiTuong = 'DRIVER';
      location.viDo = createLocationDto.viDo;
      location.kinhDo = createLocationDto.kinhDo;

      await this.viTriRepo.save(location);
    }

    return {
      message: 'Cập nhật vị trí thành công',
      viDo: updatedDriver.viDoHienTai,
      kinhDo: updatedDriver.kinhDoHienTai,
      tripActive: !!activeTrip,
      maChuyenDi: activeTrip?.maChuyenDi || null,
    };
  }

  /**
   * Get driver's wallet balance
   */
  async getWallet(maTaiXe: string) {
    const driver = await this.taiXeRepo.findOne({
      where: { maTaiXe },
    });

    if (!driver) {
      throw new NotFoundException('Tài xế không tồn tại');
    }

    return {
      maTaiXe: driver.maTaiXe,
      soVi: driver.soVi || '0',
      currencyUnit: 'VND',
    };
  }

  /**
   * Calculate driver's earnings for specified timeframe
   * Timeframe: 'today', 'week', 'month'
   */
  async getEarnings(
    maTaiXe: string,
    timeframe: string = 'today',
    commissionRate: number = 0.2,
  ) {
    // Validate driver exists
    const driver = await this.taiXeRepo.findOne({
      where: { maTaiXe },
    });

    if (!driver) {
      throw new NotFoundException('Tài xế không tồn tại');
    }

    // Validate timeframe parameter
    const validTimeframes = ['today', 'week', 'month'];
    if (!validTimeframes.includes(timeframe)) {
      throw new BadRequestException(
        `Timeframe must be one of: ${validTimeframes.join(', ')}`,
      );
    }

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
    }

    // Query completed trips for this driver within the timeframe
    const trips = await this.chuyenDiRepo.find({
      where: {
        taiXe: { maTaiXe },
        trangThai: 'COMPLETED',
        thoiGianKetThuc: Between(startDate, now),
      },
    });

    // Calculate total earnings from completed trips
    let totalEarnings = 0;
    trips.forEach((trip) => {
      // Use actual price if available, otherwise use estimated price
      const price = parseFloat(trip.giaThucTe || trip.giaUocTinh || '0');
      totalEarnings += price;
    });

    // Calculate commission and net earnings
    const commission = totalEarnings * commissionRate;
    const netEarnings = totalEarnings - commission;

    return {
      timeframe,
      totalTrips: trips.length,
      grossEarnings: totalEarnings.toFixed(2),
      systemCommission: commission.toFixed(2),
      netEarnings: netEarnings.toFixed(2),
      commissionRate: `${(commissionRate * 100).toFixed(0)}%`,
    };
  }
}
