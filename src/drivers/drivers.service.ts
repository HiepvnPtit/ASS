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
import { KiNangTaiXe } from '../entities/ki-nang-tai-xe.entity';
import { LoaiXe } from '../entities/loai-xe.entity';
import { UpdateDriverStatusDto } from './dto/update-driver-status.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { CreateSkillDto } from './dto/create-skill.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(TaiXe)
    private readonly taiXeRepo: Repository<TaiXe>,
    @InjectRepository(ViTri)
    private readonly viTriRepo: Repository<ViTri>,
    @InjectRepository(ChuyenDi)
    private readonly chuyenDiRepo: Repository<ChuyenDi>,
    @InjectRepository(KiNangTaiXe)
    private readonly kiNangRepo: Repository<KiNangTaiXe>,
    @InjectRepository(LoaiXe)
    private readonly loaiXeRepo: Repository<LoaiXe>,
  ) {}

  private async findDriver(id: string): Promise<TaiXe | null> {
    let driver = await this.taiXeRepo.findOne({
      where: { maTaiXe: id },
      relations: ['nguoiDung'],
    });
    if (!driver) {
      driver = await this.taiXeRepo.findOne({
        where: { nguoiDung: { maNguoiDung: id } as any },
        relations: ['nguoiDung'],
      });
    }
    return driver;
  }

  async getProfile(maTaiXeOrUserId: string) {
    const driver = await this.findDriver(maTaiXeOrUserId);
    if (!driver) {
      throw new NotFoundException('Tai xe khong ton tai');
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

  async updateStatus(
    maTaiXeOrUserId: string,
    updateStatusDto: UpdateDriverStatusDto,
  ) {
    const driver = await this.findDriver(maTaiXeOrUserId);
    if (!driver) {
      throw new NotFoundException('Tai xe khong ton tai');
    }
    driver.trangThaiHoatDong = updateStatusDto.trangThaiHoatDong;
    const updated = await this.taiXeRepo.save(driver);
    return {
      message: 'Cap nhat trang thai thanh cong',
      trangThaiHoatDong: updated.trangThaiHoatDong,
    };
  }

  async updateLocation(
    maNguoiDung: string,
    createLocationDto: CreateLocationDto,
  ) {
    const driver = await this.taiXeRepo.findOne({
      where: { nguoiDung: { maNguoiDung } as any },
      relations: { nguoiDung: true } as any,
    });
    if (!driver) {
      throw new NotFoundException('Tai xe khong ton tai');
    }
    driver.viDoHienTai = createLocationDto.viDo;
    driver.kinhDoHienTai = createLocationDto.kinhDo;
    const updatedDriver = await this.taiXeRepo.save(driver);

    const activeTrip = await this.chuyenDiRepo.findOne({
      where: { taiXe: { maTaiXe: driver.maTaiXe }, trangThai: 'STARTED' },
      order: { thoiGianBatDau: 'DESC' },
    });

    let location: ViTri | null = null;
    if (activeTrip) {
      location = new ViTri();
      location.chuyenDi = activeTrip;
      location.loaiDoiTuong = 'DRIVER';
      location.viDo = createLocationDto.viDo;
      location.kinhDo = createLocationDto.kinhDo;
      await this.viTriRepo.save(location);
    }

    return {
      message: 'Cap nhat vi tri thanh cong',
      viDo: updatedDriver.viDoHienTai,
      kinhDo: updatedDriver.kinhDoHienTai,
      tripActive: !!activeTrip,
      maChuyenDi: activeTrip?.maChuyenDi || null,
    };
  }

  async getWallet(maTaiXeOrUserId: string) {
    const driver = await this.findDriver(maTaiXeOrUserId);
    if (!driver) {
      throw new NotFoundException('Tai xe khong ton tai');
    }
    return {
      maTaiXe: driver.maTaiXe,
      soVi: driver.soVi || '0',
      currencyUnit: 'VND',
    };
  }

  async getEarnings(
    maTaiXeOrUserId: string,
    timeframe = 'today',
    commissionRate = 0.2,
  ) {
    const driver = await this.findDriver(maTaiXeOrUserId);
    if (!driver) {
      throw new NotFoundException('Tai xe khong ton tai');
    }

    const validTimeframes = ['today', 'week', 'month'];
    if (!validTimeframes.includes(timeframe)) {
      throw new BadRequestException(
        'Timeframe must be one of: ' + validTimeframes.join(', '),
      );
    }

    const now = new Date();
    let startDate;
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

    const trips = await this.chuyenDiRepo.find({
      where: {
        taiXe: { maTaiXe: driver.maTaiXe },
        trangThai: 'COMPLETED',
        thoiGianKetThuc: Between(startDate, now),
      },
    });

    let totalEarnings = 0;
    trips.forEach((trip) => {
      totalEarnings += parseFloat(trip.giaThucTe || trip.giaUocTinh || '0');
    });

    const commission = totalEarnings * commissionRate;
    const netEarnings = totalEarnings - commission;

    return {
      timeframe,
      totalTrips: trips.length,
      grossEarnings: totalEarnings.toFixed(2),
      systemCommission: commission.toFixed(2),
      netEarnings: netEarnings.toFixed(2),
      commissionRate: (commissionRate * 100).toFixed(0) + '%',
    };
  }

  async getSkills(maTaiXeOrUserId: string) {
    const driver = await this.findDriver(maTaiXeOrUserId);
    if (!driver) {
      throw new NotFoundException('Tai xe khong ton tai');
    }
    return this.kiNangRepo.find({
      where: { taiXe: { maTaiXe: driver.maTaiXe } },
      relations: ['loaiXe'],
    });
  }

  async addSkill(maTaiXeOrUserId: string, dto: CreateSkillDto) {
    const driver = await this.findDriver(maTaiXeOrUserId);
    if (!driver) {
      throw new NotFoundException('Tai xe khong ton tai');
    }

    const loaiXe = await this.loaiXeRepo.findOne({
      where: { maLoaiXe: dto.maLoaiXe },
    });
    if (!loaiXe) {
      throw new BadRequestException('Loai xe khong ton tai');
    }

    const existing = await this.kiNangRepo.findOne({
      where: {
        taiXe: { maTaiXe: driver.maTaiXe },
        loaiXe: { maLoaiXe: dto.maLoaiXe },
      },
    });
    if (existing) {
      throw new BadRequestException('Ky nang cho loai xe nay da ton tai');
    }

    const skill = this.kiNangRepo.create({
      taiXe: driver,
      loaiXe,
      soNamKinhNghiem: dto.soNamKinhNghiem ?? 0,
      loaiBangLai: dto.loaiBangLai,
      trangThai: 'ACTIVE',
    });

    return this.kiNangRepo.save(skill);
  }

  async deleteSkill(maTaiXeOrUserId: string, maKiNangTaiXe: string) {
    const driver = await this.findDriver(maTaiXeOrUserId);
    if (!driver) {
      throw new NotFoundException('Tai xe khong ton tai');
    }

    const skill = await this.kiNangRepo.findOne({
      where: { maKiNangTaiXe, taiXe: { maTaiXe: driver.maTaiXe } },
    });
    if (!skill) {
      throw new NotFoundException('Ky nang khong ton tai');
    }

    return this.kiNangRepo.remove(skill);
  }
}
