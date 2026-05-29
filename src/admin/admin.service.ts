import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { NguoiDung } from '../entities/nguoi-dung.entity';
import { TaiXe } from '../entities/tai-xe.entity';
import { KhachHang } from '../entities/khach-hang.entity';
import { Xe } from '../entities/xe.entity';
import { KhieuNai } from '../entities/khieu-nai.entity';
import { ChuyenDi } from '../entities/chuyen-di.entity';
import { ThanhToan } from '../entities/thanh-toan.entity';
import { DanhGia } from '../entities/danh-gia.entity';
import { ApproveDriverDto } from './dto/approve-driver.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ToggleUserStatusDto } from './dto/toggle-user-status.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { GetPaginationQueryDto } from './dto/get-pagination-query.dto';

@Injectable()
export class AdminService {
  // Whitelist các trường được phép tìm kiếm (bảo mật)
  private readonly ALLOWED_SEARCH_FIELDS: Set<string> = new Set([
    'hoTen',
    'email',
    'soDienThoai',
  ]);

  constructor(
    @InjectRepository(NguoiDung)
    private readonly nguoiDungRepo: Repository<NguoiDung>,
    @InjectRepository(TaiXe)
    private readonly taiXeRepo: Repository<TaiXe>,
    @InjectRepository(KhachHang)
    private readonly khachHangRepo: Repository<KhachHang>,
    @InjectRepository(Xe)
    private readonly xeRepo: Repository<Xe>,
    @InjectRepository(KhieuNai)
    private readonly khieuNaiRepo: Repository<KhieuNai>,
    @InjectRepository(ChuyenDi)
    private readonly chuyenDiRepo: Repository<ChuyenDi>,
    @InjectRepository(ThanhToan)
    private readonly thanhToanRepo: Repository<ThanhToan>,
    @InjectRepository(DanhGia)
    private readonly danhGiaRepo: Repository<DanhGia>,
  ) {}

  /**
   * Parse search parameter từ query string
   * Hỗ trợ: JSON string hoặc plain string
   * @param search - Search parameter
   * @returns Record<string, string> hoặc null
   */
  private parseSearchParameter(search?: string): Record<string, string> | null {
    if (!search) return null;

    try {
      // Thử parse như JSON trước
      const parsed = JSON.parse(search);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    } catch {
      // Không phải JSON, tạo object search mặc định
      // Nếu là plain string, tìm kiếm trong các trường chính
    }

    // Nếu là plain string, tìm kiếm trong tất cả các trường được phép
    // Cách này hỗ trợ backward compatibility với search cũ
    return {
      _global: search,
    };
  }

  /**
   * Validate search fields và chỉ giữ lại các trường được phép
   * @param searchObject - Raw search object
   * @returns Validated search object
   */
  private validateAndFilterSearchFields(
    searchObject: Record<string, string>,
  ): Record<string, string> {
    const validated: Record<string, string> = {};

    for (const [key, value] of Object.entries(searchObject)) {
      // Cho phép _global để tìm kiếm trên tất cả các trường
      if (key === '_global') {
        validated[key] = value;
      } else if (this.ALLOWED_SEARCH_FIELDS.has(key)) {
        validated[key] = value;
      } else {
        throw new BadRequestException(
          `Trường tìm kiếm "${key}" không được phép. ` +
            `Các trường được phép: ${Array.from(this.ALLOWED_SEARCH_FIELDS).join(', ')}`,
        );
      }
    }

    return validated;
  }

  /**
   * Lấy danh sách tất cả người dùng với filter, phân trang, tìm kiếm động
   */
  async getAllUsers(query: GetUsersQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Parse search parameter
    const rawSearch = this.parseSearchParameter(query.search);
    const searchObject = rawSearch
      ? this.validateAndFilterSearchFields(rawSearch)
      : null;

    // Khởi tạo QueryBuilder
    const queryBuilder = this.nguoiDungRepo
      .createQueryBuilder('user')
      .skip(skip)
      .take(limit)
      .orderBy('user.ngayTao', 'DESC');

    // Apply filter theo vaiTro
    if (query.vaiTro) {
      queryBuilder.andWhere('user.vaiTro = :vaiTro', {
        vaiTro: query.vaiTro,
      });
    }

    // Apply filter theo trangThai
    if (query.trangThai) {
      queryBuilder.andWhere('user.trangThai = :trangThai', {
        trangThai: query.trangThai,
      });
    }

    // Apply dynamic search
    if (searchObject && Object.keys(searchObject).length > 0) {
      // Nếu có _global, tìm kiếm trong tất cả các trường
      if (searchObject._global) {
        const searchValue = `%${searchObject._global}%`;
        const conditions = Array.from(this.ALLOWED_SEARCH_FIELDS).map(
          (field) => `user.${field} ILIKE :searchValue`,
        );
        queryBuilder.andWhere(`(${conditions.join(' OR ')})`, { searchValue });
      } else {
        // Tìm kiếm trong các trường cụ thể
        for (const [field, value] of Object.entries(searchObject)) {
          if (this.ALLOWED_SEARCH_FIELDS.has(field)) {
            const paramName = `search_${field}`;
            queryBuilder.andWhere(`user.${field} ILIKE :${paramName}`, {
              [paramName]: `%${value}%`,
            });
          }
        }
      }
    }

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users.map((u) => ({
        id: u.maNguoiDung,
        hoTen: u.hoTen,
        email: u.email,
        soDienThoai: u.soDienThoai,
        vaiTro: u.vaiTro,
        trangThai: u.trangThai,
        ngayTao: u.ngayTao,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy danh sách tài xế chờ duyệt
   */
  async getPendingDrivers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [drivers, total] = await this.taiXeRepo.findAndCount({
      where: {
        trangThaiXacThuc: 'PENDING',
      },
      relations: ['nguoiDung', 'kiNangs'],
      skip,
      take: limit,
      order: {
        maTaiXe: 'ASC',
      },
    });

    return {
      data: drivers.map((driver) => ({
        maTaiXe: driver.maTaiXe,
        soGiayPhepLaiXe: driver.soGiayPhepLaiXe,
        canCuocCongDan: driver.canCuocCongDan,
        hanGiayPhepLaiXe: driver.hanGiayPhepLaiXe,
        trangThaiXacThuc: driver.trangThaiXacThuc,
        trangThaiHoatDong: driver.trangThaiHoatDong,
        diemDanhGia: driver.diemDanhGia,
        nguoiDung: driver.nguoiDung,
        kiNangs: driver.kiNangs,
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Duyệt hồ sơ tài xế
   */
  async approveDriver(maTaiXe: string, approveDto: ApproveDriverDto) {
    const driver = await this.taiXeRepo.findOne({
      where: { maTaiXe },
    });

    if (!driver) {
      throw new NotFoundException('Tài xế không tồn tại');
    }

    if (driver.trangThaiXacThuc !== 'PENDING') {
      return {
        message: `Tài xế này đã ở trạng thái ${driver.trangThaiXacThuc}, không cần duyệt lại`,
        driver: {
          maTaiXe: driver.maTaiXe,
          trangThaiXacThuc: driver.trangThaiXacThuc,
        },
      };
    }

    driver.trangThaiXacThuc = 'VERIFIED';
    const updated = await this.taiXeRepo.save(driver);

    return {
      message: `Duyệt hồ sơ tài xế ${maTaiXe} thành công`,
      ghiChu: approveDto.ghiChu || null,
      driver: {
        maTaiXe: updated.maTaiXe,
        soGiayPhepLaiXe: updated.soGiayPhepLaiXe,
        trangThaiXacThuc: updated.trangThaiXacThuc,
      },
    };
  }

  /**
   * Lấy danh sách khiếu nại
   */
  async getComplaints(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [complaints, total] = await this.khieuNaiRepo.findAndCount({
      relations: ['chuyenDi', 'chuyenDi.khachHang', 'chuyenDi.taiXe'],
      skip,
      take: limit,
      order: {
        maKhieuNai: 'DESC',
      },
    });

    return {
      data: complaints.map((complaint) => ({
        maKhieuNai: complaint.maKhieuNai,
        noiDungKhieuNai: complaint.noiDungKhieuNai,
        loaiNguoiGui: complaint.loaiNguoiGui,
        trangThai: complaint.trangThai,
        thoiGianTao: complaint.thoiGianTao,
        khachHang: complaint.chuyenDi?.khachHang,
        taiXe: complaint.chuyenDi?.taiXe,
        chuyenDi: complaint.chuyenDi,
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy dashboard metrics
   */
  async getDashboardMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Users
    const totalUsers = await this.nguoiDungRepo.count();
    const totalCustomers = await this.khachHangRepo.count();
    const totalDrivers = await this.taiXeRepo.count();

    // Drivers status
    const driversOnline = await this.taiXeRepo.count({
      where: { trangThaiHoatDong: 'ONLINE' },
    });
    const driversVerified = await this.taiXeRepo.count({
      where: { trangThaiXacThuc: 'VERIFIED' },
    });
    const driversPending = await this.taiXeRepo.count({
      where: { trangThaiXacThuc: 'PENDING' },
    });

    // Vehicles
    const totalVehicles = await this.xeRepo.count();

    // Trips
    const totalTrips = await this.chuyenDiRepo.count();
    const tripsToday = await this.chuyenDiRepo.count({
      where: { thoiGianDat: MoreThanOrEqual(today) },
    });
    const tripsCompleted = await this.chuyenDiRepo.count({
      where: { trangThai: 'COMPLETED' },
    });
    const tripsCancelled = await this.chuyenDiRepo.count({
      where: { trangThai: 'CANCELLED' },
    });
    const tripsRequested = await this.chuyenDiRepo.count({
      where: { trangThai: 'REQUESTED' },
    });

    // Revenue
    const revenueResult = await this.thanhToanRepo
      .createQueryBuilder('pay')
      .select('COALESCE(SUM(CAST(pay.soTien AS DECIMAL)), 0)', 'totalRevenue')
      .where('pay.trang_thai_thanh_toan = :status', { status: 'COMPLETED' })
      .getRawOne();
    const totalRevenue = parseFloat(revenueResult?.totalRevenue || '0').toFixed(
      2,
    );

    // Revenue today
    const revenueTodayResult = await this.thanhToanRepo
      .createQueryBuilder('pay')
      .select('COALESCE(SUM(CAST(pay.soTien AS DECIMAL)), 0)', 'revenueToday')
      .where('pay.trang_thai_thanh_toan = :status', { status: 'COMPLETED' })
      .andWhere('pay.thoi_gian_thanh_toan >= :today', { today })
      .getRawOne();
    const revenueToday = parseFloat(
      revenueTodayResult?.revenueToday || '0',
    ).toFixed(2);

    // Average rating
    const ratingResult = await this.danhGiaRepo
      .createQueryBuilder('review')
      .select('COALESCE(AVG(review.soSao), 0)', 'avgRating')
      .getRawOne();
    const averageRating = parseFloat(ratingResult?.avgRating || '0').toFixed(2);

    // Complaints
    const totalComplaints = await this.khieuNaiRepo.count();
    const pendingComplaints = await this.khieuNaiRepo.count({
      where: { trangThai: 'PENDING' },
    });

    return {
      timestamp: new Date(),
      users: {
        total: totalUsers,
        customers: totalCustomers,
        drivers: totalDrivers,
      },
      drivers: {
        online: driversOnline,
        verified: driversVerified,
        pending: driversPending,
      },
      vehicles: {
        total: totalVehicles,
      },
      trips: {
        total: totalTrips,
        today: tripsToday,
        completed: tripsCompleted,
        cancelled: tripsCancelled,
        requested: tripsRequested,
      },
      revenue: {
        total: totalRevenue,
        today: revenueToday,
        currency: 'VND',
      },
      ratings: {
        average: averageRating,
      },
      complaints: {
        total: totalComplaints,
        pending: pendingComplaints,
      },
    };
  }

  /**
   * Lấy danh sách tất cả khách hàng
   */
  async getAllCustomers(query: GetPaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [customers, total] = await this.khachHangRepo.findAndCount({
      skip,
      take: limit,
      order: { maKhachHang: 'DESC' },
    });

    return {
      data: customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy danh sách tất cả tài xế
   */
  async getAllDrivers(query: GetPaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [drivers, total] = await this.taiXeRepo.findAndCount({
      relations: ['nguoiDung'],
      skip,
      take: limit,
      order: { maTaiXe: 'DESC' },
    });

    return {
      data: drivers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Cập nhật thông tin tài xế
   */
  async updateDriver(driverId: string, updateDto: UpdateDriverDto) {
    const driver = await this.taiXeRepo.findOne({
      where: { maTaiXe: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Tài xế không tồn tại');
    }

    Object.assign(driver, updateDto);
    const updated = await this.taiXeRepo.save(driver);

    return {
      message: 'Cập nhật tài xế thành công',
      data: updated,
    };
  }

  /**
   * Lấy danh sách tất cả xe
   */
  async getAllVehicles(query: GetPaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [vehicles, total] = await this.xeRepo.findAndCount({
      relations: ['taiXe'],
      skip,
      take: limit,
      order: { maXe: 'DESC' },
    });

    return {
      data: vehicles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Xóa xe
   */
  async deleteVehicle(vehicleId: string, reason: string) {
    const vehicle = await this.xeRepo.findOne({
      where: { maXe: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Xe không tồn tại');
    }

    await this.xeRepo.remove(vehicle);

    return {
      message: `Xóa xe ${vehicleId} thành công. Lý do: ${reason}`,
    };
  }

  /**
   * Cập nhật thông tin người dùng
   */
  async updateUser(userId: string, updateDto: UpdateUserDto) {
    const user = await this.nguoiDungRepo.findOne({
      where: { maNguoiDung: userId },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    Object.assign(user, updateDto);
    const updated = await this.nguoiDungRepo.save(user);

    return {
      message: 'Cập nhật người dùng thành công',
      data: updated,
    };
  }

  /**
   * Bật/tắt trạng thái người dùng
   */
  async toggleUserStatus(userId: string, toggleDto: ToggleUserStatusDto) {
    const user = await this.nguoiDungRepo.findOne({
      where: { maNguoiDung: userId },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    user.trangThai = toggleDto.trangThai;
    const updated = await this.nguoiDungRepo.save(user);

    return {
      message: `Thay đổi trạng thái người dùng thành ${toggleDto.trangThai} thành công`,
      data: updated,
    };
  }
}
