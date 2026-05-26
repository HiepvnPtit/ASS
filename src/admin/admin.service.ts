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

  // ========== QUẢN LÝ NGƯỜI DÙNG (NguoiDung) ==========

  /**
   * Cập nhật thông tin cơ bản người dùng (Họ tên, SĐT)
   */
  async updateUser(userId: string, updateDto: UpdateUserDto) {
    const user = await this.nguoiDungRepo.findOne({
      where: { maNguoiDung: userId },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    if (updateDto.hoTen) user.hoTen = updateDto.hoTen;
    if (updateDto.soDienThoai) user.soDienThoai = updateDto.soDienThoai;

    const updated = await this.nguoiDungRepo.save(user);

    return {
      id: updated.maNguoiDung,
      hoTen: updated.hoTen,
      email: updated.email,
      soDienThoai: updated.soDienThoai,
      vaiTro: updated.vaiTro,
      trangThai: updated.trangThai,
    };
  }

  /**
   * Khóa/Mở khóa tài khoản (Soft Delete via status toggle)
   */
  async toggleUserStatus(userId: string, toggleDto: ToggleUserStatusDto) {
    const user = await this.nguoiDungRepo.findOne({
      where: { maNguoiDung: userId },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const oldStatus = user.trangThai;
    user.trangThai = toggleDto.trangThai;

    const updated = await this.nguoiDungRepo.save(user);

    return {
      id: updated.maNguoiDung,
      hoTen: updated.hoTen,
      email: updated.email,
      trangThai: updated.trangThai,
      previousStatus: oldStatus,
      lyDo: toggleDto.lyDo || null,
      updatedAt: new Date(),
    };
  }

  // ========== QUẢN LÝ TÀI XẾ (TaiXe) ==========

  /**
   * Lấy danh sách tài xế (join với NguoiDung)
   */
  async getAllDrivers(query: GetPaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [drivers, total] = await this.taiXeRepo.findAndCount({
      relations: ['nguoiDung'],
      skip,
      take: limit,
      order: {
        maTaiXe: 'ASC',
      },
    });

    return {
      data: drivers.map((driver) => ({
        id: driver.maTaiXe,
        hoTen: driver.nguoiDung?.hoTen,
        email: driver.nguoiDung?.email,
        soDienThoai: driver.nguoiDung?.soDienThoai,
        soGiayPhepLaiXe: driver.soGiayPhepLaiXe,
        canCuocCongDan: driver.canCuocCongDan,
        hanGiayPhepLaiXe: driver.hanGiayPhepLaiXe,
        diemDanhGia: driver.diemDanhGia,
        trangThaiXacThuc: driver.trangThaiXacThuc,
        trangThaiHoatDong: driver.trangThaiHoatDong,
        trangThaiNguoiDung: driver.nguoiDung?.trangThai,
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
   * Admin cập nhật thông tin tài xế (bằng lái, CCCD, hạng sao, etc)
   */
  async updateDriver(driverId: string, updateDto: UpdateDriverDto) {
    const driver = await this.taiXeRepo.findOne({
      where: { maTaiXe: driverId },
      relations: ['nguoiDung'],
    });

    if (!driver) {
      throw new NotFoundException('Tài xế không tồn tại');
    }

    if (updateDto.soGiayPhepLaiXe)
      driver.soGiayPhepLaiXe = updateDto.soGiayPhepLaiXe;
    if (updateDto.canCuocCongDan)
      driver.canCuocCongDan = updateDto.canCuocCongDan;
    if (updateDto.diemDanhGia !== undefined) {
      driver.diemDanhGia = updateDto.diemDanhGia.toString();
    }
    if (updateDto.hanGiayPhepLaiXe)
      driver.hanGiayPhepLaiXe = new Date(updateDto.hanGiayPhepLaiXe);

    const updated = await this.taiXeRepo.save(driver);

    return {
      id: updated.maTaiXe,
      hoTen: updated.nguoiDung?.hoTen,
      email: updated.nguoiDung?.email,
      soGiayPhepLaiXe: updated.soGiayPhepLaiXe,
      canCuocCongDan: updated.canCuocCongDan,
      hanGiayPhepLaiXe: updated.hanGiayPhepLaiXe,
      diemDanhGia: updated.diemDanhGia,
      ghiChu: updateDto.ghiChu || null,
      updatedAt: new Date(),
    };
  }

  // ========== QUẢN LÝ KHÁCH HÀNG (KhachHang) ==========

  /**
   * Lấy danh sách khách hàng
   */
  async getAllCustomers(query: GetPaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [customers, total] = await this.khachHangRepo.findAndCount({
      relations: ['nguoiDung', 'xe'],
      skip,
      take: limit,
      order: {
        maKhachHang: 'ASC',
      },
    });

    return {
      data: customers.map((customer) => ({
        id: customer.maKhachHang,
        hoTen: customer.nguoiDung?.hoTen,
        email: customer.nguoiDung?.email,
        soDienThoai: customer.nguoiDung?.soDienThoai,
        trangThai: customer.nguoiDung?.trangThai,
        diaChiMacDinh: customer.diaChiMacDinh,
        soXe: customer.xe?.length || 0,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ========== QUẢN LÝ XE CỘ (Xe) ==========

  /**
   * Lấy danh sách toàn bộ xe trong hệ thống
   */
  async getAllVehicles(query: GetPaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [vehicles, total] = await this.xeRepo.findAndCount({
      relations: ['khachHang', 'khachHang.nguoiDung', 'loaiXe'],
      skip,
      take: limit,
      order: {
        maXe: 'ASC',
      },
    });

    return {
      data: vehicles.map((vehicle) => ({
        id: vehicle.maXe,
        bienSo: vehicle.bienSo,
        hangXe: vehicle.hangXe,
        dongXe: vehicle.dongXe,
        mauXe: vehicle.mauXe,
        maLoaiXe: vehicle.loaiXe?.maLoaiXe,
        phanKhuc: vehicle.loaiXe?.phanKhuc,
        khachHang: {
          id: vehicle.khachHang?.maKhachHang,
          hoTen: vehicle.khachHang?.nguoiDung?.hoTen,
          email: vehicle.khachHang?.nguoiDung?.email,
          soDienThoai: vehicle.khachHang?.nguoiDung?.soDienThoai,
        },
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
   * Admin xóa xe (cứng) - Xóa xe vi phạm hoặc khai báo sai
   */
  async deleteVehicle(vehicleId: string, reason?: string) {
    const vehicle = await this.xeRepo.findOne({
      where: { maXe: vehicleId },
      relations: ['khachHang'],
    });

    if (!vehicle) {
      throw new NotFoundException('Xe không tồn tại');
    }

    // Kiểm tra xe có liên quan đến chuyến đi nào không
    const hasActiveTrips = await this.chuyenDiRepo.count({
      where: {
        xe: { maXe: vehicleId },
      },
    });

    if (hasActiveTrips > 0) {
      throw new BadRequestException(
        'Không thể xóa xe đang có các chuyến đi liên quan',
      );
    }

    const customerInfo = vehicle.khachHang?.maKhachHang;

    await this.xeRepo.remove(vehicle);

    return {
      message: 'Xóa xe thành công',
      vehicleId: vehicle.maXe,
      bienSo: vehicle.bienSo,
      khachHangId: customerInfo,
      lyDo: reason || 'Không có lý do',
    };
  }

  /**
   * Dashboard Metrics - Thống kê nhanh
   */
  async getDashboardMetrics() {
    // Số cuốc xe hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tripsToday = await this.chuyenDiRepo.count({
      where: {
        thoiGianDat: MoreThanOrEqual(today),
      },
    });

    // Tổng số tài xế đang ONLINE
    const driversOnline = await this.taiXeRepo.count({
      where: {
        trangThaiHoatDong: 'ONLINE',
      },
    });

    // Tổng số tài xế đã xác minh
    const driversVerified = await this.taiXeRepo.count({
      where: {
        trangThaiXacThuc: 'VERIFIED',
      },
    });

    // Tổng số tài xế chờ duyệt
    const driversPending = await this.taiXeRepo.count({
      where: {
        trangThaiXacThuc: 'PENDING',
      },
    });

    // Tổng số khiếu nại
    const totalComplaints = await this.khieuNaiRepo.count();

    // Tổng số khiếu nại chưa xử lý
    const pendingComplaints = await this.khieuNaiRepo.count({
      where: {
        trangThai: 'PENDING',
      },
    });

    return {
      timestamp: new Date(),
      trips: {
        today: tripsToday,
      },
      drivers: {
        online: driversOnline,
        verified: driversVerified,
        pending: driversPending,
      },
      complaints: {
        total: totalComplaints,
        pending: pendingComplaints,
      },
    };
  }
}
