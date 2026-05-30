import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Optional,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../common/base/base.service';
import AppDataSource, { getDataSource } from '../database/data-source';
import { BangGia } from '../entities/bang-gia.entity';
import { TaiXe } from '../entities/tai-xe.entity';
import { KhachHang } from '../entities/khach-hang.entity';
import { KiNangTaiXe } from '../entities/ki-nang-tai-xe.entity';
import { ChuyenDi } from '../entities/chuyen-di.entity';
import { LichSuTrangThai } from '../entities/lich-su-trang-thai.entity';
import { BienBanBanGiaoXe } from '../entities/bien-ban-bangiao.entity';
import { AnhChungThuc } from '../entities/anh-chung-thuc.entity';
import { Xe } from '../entities/xe.entity';
import { DanhGia } from '../entities/danh-gia.entity';
import { ThanhToan } from '../entities/thanh-toan.entity';
import { ViTri } from '../entities/vi-tri.entity';
import { ReviewsService } from '../reviews/reviews.service';
import { TripsGateway } from './trips.gateway';

/**
 * Trips Service - Trip/Journey Management
 *
 * Extends BaseService for standard CRUD operations.
 * Custom logic:
 * - Trip creation with transaction support
 * - Available drivers lookup
 * - Price estimation based on vehicle type and distance
 * - Trip status management and history tracking
 */
@Injectable()
export class TripsService extends BaseService<ChuyenDi> {
  constructor(
    @InjectRepository(ChuyenDi)
    private readonly chuyenDiRepo: Repository<ChuyenDi>,
    @InjectRepository(BangGia)
    private readonly bangGiaRepo: Repository<BangGia>,
    @InjectRepository(TaiXe)
    private readonly taiXeRepo: Repository<TaiXe>,
    @InjectRepository(KhachHang)
    private readonly khachHangRepo: Repository<KhachHang>,
    @InjectRepository(KiNangTaiXe)
    private readonly kiNangRepo: Repository<KiNangTaiXe>,
    @InjectRepository(LichSuTrangThai)
    private readonly lichSuRepo: Repository<LichSuTrangThai>,
    @InjectRepository(BienBanBanGiaoXe)
    private readonly bienBanRepo: Repository<BienBanBanGiaoXe>,
    @InjectRepository(AnhChungThuc)
    private readonly anhRepo: Repository<AnhChungThuc>,
    @InjectRepository(Xe)
    private readonly xeRepo: Repository<Xe>,
    @InjectRepository(DanhGia)
    private readonly danhGiaRepo: Repository<DanhGia>,
    @InjectRepository(ThanhToan)
    private readonly thanhToanRepo: Repository<ThanhToan>,
    @InjectRepository(ViTri)
    private readonly viTriRepo: Repository<ViTri>,
    private readonly reviewsService: ReviewsService,
    @Optional()
    @Inject(forwardRef(() => TripsGateway))
    private readonly tripsGateway?: TripsGateway,
  ) {
    super(chuyenDiRepo);
  }

  private normalizeRole(currentUser: {
    vaiTro?: string;
    role?: { id?: string | number; name?: string };
  }) {
    return String(
      currentUser?.vaiTro ??
        currentUser?.role?.name ??
        currentUser?.role?.id ??
        '',
    ).toUpperCase();
  }

  /**
   * Estimate price based on ma_loai_xe and quang_duong_km
   */
  private buildPriceQuery(maLoaiXe: string, khuVuc?: string) {
    const query = this.bangGiaRepo
      .createQueryBuilder('bg')
      .innerJoinAndSelect('bg.loaiXe', 'loaiXe')
      .where('loaiXe.maLoaiXe = :maLoaiXe', { maLoaiXe });

    if (khuVuc) {
      query.andWhere('bg.khu_vuc = :khuVuc', { khuVuc });
    }

    return query;
  }

  private toPriceEstimate(bg: BangGia, quangDuongKm: number) {
    const giaCoBan = parseFloat(bg.giaCoBan as any);
    const giaTheoKm = parseFloat(bg.giaTheoKm as any);
    const giaUocTinh = giaCoBan + giaTheoKm * (quangDuongKm ?? 0);

    return {
      maBangGia: bg.maBangGia,
      maLoaiXe: bg.maLoaiXe ?? bg.loaiXe?.maLoaiXe,
      khuVuc: bg.khuVuc,
      khungGio: bg.khungGio,
      ngayApDung: bg.ngayApDung,
      giaUocTinh: giaUocTinh.toFixed(2),
      giaCoBan: giaCoBan.toFixed(2),
      giaTheoKm: giaTheoKm.toFixed(2),
    };
  }

  async estimatePrices(
    maLoaiXe: string,
    quangDuongKm: number,
    khuVuc?: string,
  ) {
    const bangGias = await this.buildPriceQuery(maLoaiXe, khuVuc)
      .orderBy('bg.ngay_ap_dung', 'DESC')
      .addOrderBy('bg.created_at', 'DESC')
      .addOrderBy('bg.ma_bang_gia', 'DESC')
      .getMany();

    if (!bangGias.length) {
      throw new BadRequestException('No pricing found for this vehicle type');
    }

    return bangGias.map((bg) => this.toPriceEstimate(bg, quangDuongKm));
  }

  async estimatePrice(maLoaiXe: string, quangDuongKm: number, khuVuc?: string) {
    const estimates = await this.estimatePrices(maLoaiXe, quangDuongKm, khuVuc);
    return estimates[0];
  }

  /**
   * Find drivers available for a given vehicle type
   */
  async findAvailableDrivers(maLoaiXe: string) {
    // drivers ONLINE and have skill for maLoaiXe and not in PICKING or DRIVING
    const subQueryBusy = this.chuyenDiRepo
      .createQueryBuilder('cd')
      .select('cd.ma_tai_xe')
      .where("cd.trang_thai IN ('PICKING','DRIVING')");

    const drivers = await this.taiXeRepo
      .createQueryBuilder('tx')
      .innerJoin('ki_nang_tai_xe', 'kn', 'kn.ma_tai_xe = tx.ma_tai_xe')
      .where('tx.trang_thai_hoat_dong = :online', { online: 'ONLINE' })
      .andWhere('kn.ma_loai_xe = :maLoaiXe', { maLoaiXe })
      .andWhere(() => {
        const sub = subQueryBusy.getQuery();
        return `tx.ma_tai_xe NOT IN (${sub})`;
      })
      .setParameters(subQueryBusy.getParameters())
      .getMany();

    return drivers.map((driver) => ({
      maTaiXe: driver.maTaiXe,
      trangThaiHoatDong: driver.trangThaiHoatDong,
      trangThaiXacThuc: driver.trangThaiXacThuc,
      diemDanhGia: driver.diemDanhGia,
    }));
  }

  /**
   * Find nearby online drivers within specified radius using Haversine formula
   * Drivers must be ONLINE and VERIFIED
   *
   * @param viDo - Latitude of pickup location (from diemDon)
   * @param kinhDo - Longitude of pickup location (from diemDon)
   * @param radiusKm - Search radius in kilometers (default 5km)
   * @returns Array of nearby drivers sorted by distance (nearest first)
   */
  async findNearbyDrivers(
    viDo: number,
    kinhDo: number,
    radiusKm: number = 5,
  ): Promise<(TaiXe & { distance: number })[]> {
    try {
      // Query drivers using Haversine formula
      // Formula: distance = 6371 * acos(cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) + sin(radians(lat1)) * sin(radians(lat2)))
      const query = this.taiXeRepo
        .createQueryBuilder('tx')
        .leftJoinAndSelect('tx.nguoiDung', 'nd')
        .leftJoinAndSelect('tx.kiNangs', 'kn')
        .where('tx.trangThaiHoatDong = :status', { status: 'ONLINE' })
        .andWhere('tx.trangThaiXacThuc = :verified', { verified: 'VERIFIED' })
        .andWhere('tx.deletedAt IS NULL')
        .andWhere('nd.deletedAt IS NULL')
        // Haversine formula for distance calculation
        // IMPORTANT: Adjust column names if driver location is stored elsewhere
        // If viDo/kinhDo are in TaiXe: use tx.viDo, tx.kinhDo
        // If in a separate ViTri table: join and use that table's columns
        .addSelect(
          `(
            6371 * acos(
              cos(radians(:viDo)) * 
              cos(radians(COALESCE(tx.vi_do_hien_tai, 0))) * 
              cos(radians(COALESCE(tx.kinh_do_hien_tai, 0)) - radians(:kinhDo)) + 
              sin(radians(:viDo)) * 
              sin(radians(COALESCE(tx.vi_do_hien_tai, 0)))
            )
          )`,
          'distance',
        )
        .setParameter('viDo', viDo)
        .setParameter('kinhDo', kinhDo)
        // Filter by distance
        .andWhere(
          `6371 * acos(
            cos(radians(:viDo)) * 
            cos(radians(COALESCE(tx.vi_do_hien_tai, 0))) * 
            cos(radians(COALESCE(tx.kinh_do_hien_tai, 0)) - radians(:kinhDo)) + 
            sin(radians(:viDo)) * 
            sin(radians(COALESCE(tx.vi_do_hien_tai, 0)))
          ) <= :radius`,
          { radius: radiusKm },
        )
        // Sort by distance (nearest first)
        .orderBy('distance', 'ASC')
        .addOrderBy('tx.diemDanhGia', 'DESC'); // then by rating

      const drivers = await query.getMany();

      return drivers.map((driver: any) => ({
        ...driver,
        distance: driver.distance ? parseFloat(driver.distance) : null,
      }));
    } catch (error: any) {
      console.error(
        '[findNearbyDrivers] Error querying nearby drivers:',
        error.message,
      );
      // If error (e.g., columns don't exist), return empty array
      // In production, consider adding a migration to add viDo/kinhDo to TaiXe
      return [];
    }
  }

  /**
   * Create trip and insert history in a transaction
   * Automatically generates maChuyenDi (CD-timestamp-uuid)
   * Validates that vehicle belongs to customer (security check)
   * Default status: REQUESTED (waiting for driver matching)
   * Finds nearby drivers and notifies via WebSocket
   *
   * @param data - Trip creation data (WITHOUT maChuyenDi, maKhachHang)
   * @param currentUser - Current user from JWT token
   * @returns Created trip with generated ID
   */
  async createTrip(
    data: Partial<ChuyenDi> & {
      maXe?: string;
      maLoaiXe?: string;
      maBangGia?: string;
      quangDuongKm?: number;
      maTaiXe?: string; // optional when creating
    },
    currentUser: {
      id: string;
      vaiTro?: string;
      role?: { id?: string | number; name?: string };
    },
  ) {
    const ds = await getDataSource();
    return ds.transaction(async (manager) => {
      // Only CUSTOMER can create trips
      if (this.normalizeRole(currentUser) !== 'CUSTOMER') {
        throw new ForbiddenException('Only CUSTOMER can create trips');
      }

      // Find customer by userId (maNguoiDung from JWT)
      const customer = await manager.findOne(KhachHang, {
        where: { nguoiDung: { maNguoiDung: currentUser.id } as any },
        relations: { nguoiDung: true } as any,
      });
      if (!customer) {
        throw new BadRequestException('Customer profile not found');
      }

      // Find vehicle and check ownership (SECURITY CHECK)
      const xe = await manager.findOne(Xe, {
        where: { maXe: data.maXe ?? (data as any).xe?.maXe },
        relations: { khachHang: true, loaiXe: true } as any,
      });
      if (!xe) {
        throw new BadRequestException('Vehicle not found');
      }

      // CRITICAL: Verify vehicle belongs to current customer
      if (xe.khachHang?.maKhachHang !== customer.maKhachHang) {
        throw new ForbiddenException(
          'You can only create trips for your own vehicles',
        );
      }

      // Validate vehicle type matches if provided
      if (data.maLoaiXe && xe.loaiXe?.maLoaiXe !== data.maLoaiXe) {
        throw new BadRequestException(
          'Vehicle type does not match the selected vehicle',
        );
      }

      // Find pricing information
      const bangGia = await manager.findOne(BangGia, {
        where: {
          maBangGia: data.maBangGia ?? (data as any).bangGia?.maBangGia,
        },
        relations: { loaiXe: true } as any,
      });
      if (!bangGia) {
        throw new BadRequestException('Pricing not found');
      }

      // Validate pricing matches vehicle type
      if (bangGia.loaiXe?.maLoaiXe !== xe.loaiXe?.maLoaiXe) {
        throw new BadRequestException(
          'Pricing does not match the selected vehicle type',
        );
      }

      // Calculate estimated price
      const giaUocTinh = await this.estimatePrice(
        xe.loaiXe.maLoaiXe,
        data.quangDuongKm ?? 0,
      );

      // Create trip - maChuyenDi is auto-generated by database via @PrimaryGeneratedColumn('uuid')
      const chuyenDi = manager.create(ChuyenDi, {
        ...data,
        // Don't set maChuyenDi - let DB auto-generate UUID
        khachHang: customer,
        xe,
        bangGia,
        giaUocTinh: giaUocTinh.giaUocTinh,
        trangThai: 'REQUESTED', // default status (waiting for driver matching)
        maTaiXe: data.maTaiXe ?? undefined, // optional driver assignment
      });
      const saved = await manager.save(ChuyenDi, chuyenDi);

      // Create status history record
      const nguoiCapNhat = customer.maKhachHang;

      const ls = manager.create(LichSuTrangThai, {
        chuyenDi: saved,
        trangThaiCu: undefined,
        trangThaiMoi: saved.trangThai || 'REQUESTED',
        nguoiCapNhat,
      });

      await manager.save(LichSuTrangThai, ls);

      // Transaction completed - now find and notify nearby drivers
      // (This happens outside transaction to avoid blocking the response)
      try {
        const nearbyDrivers = await this.findNearbyDrivers(
          data.viDoDon ?? 0,
          data.kinhDoDon ?? 0,
          5, // 5km radius by default
        );

        if (nearbyDrivers && nearbyDrivers.length > 0) {
          const driverIds = nearbyDrivers.map((d) => d.maTaiXe);
          const tripData = {
            maChuyenDi: saved.maChuyenDi,
            diemDon: saved.diemDon,
            diemDen: saved.diemDen,
            giaUocTinh: saved.giaUocTinh,
            quangDuongKm: data.quangDuongKm,
            maLoaiXe: saved.xe?.loaiXe?.maLoaiXe,
            trangThai: saved.trangThai,
            khachHang: {
              maNguoiDung: customer.nguoiDung?.maNguoiDung,
              hoTen: customer.nguoiDung?.hoTen,
              soDienThoai: customer.nguoiDung?.soDienThoai,
            },
          };
          // Notify nearby drivers via WebSocket
          // Event: 'new_trip_available' - sent to each driver individually
          if (this.tripsGateway) {
            for (const maTaiXe of driverIds) {
              const distance = nearbyDrivers.find(
                (d) => d.maTaiXe === maTaiXe,
              )?.distance;
              this.tripsGateway.notifyDrivers(maTaiXe, 'new_trip_available', {
                trip: tripData,
                nearbyDistance: distance,
              });
            }
          }
        }
      } catch (wsError: any) {
        // Log but don't throw - WebSocket notification shouldn't block trip creation
        const errorMsg =
          wsError instanceof Error ? wsError.message : 'Unknown error';
        console.error('[createTrip] Error notifying nearby drivers:', errorMsg);
      }

      return saved;
    });
  }

  async vehicleHandover(
    payload: {
      maChuyenDi: string;
      tinhTrangTruoc?: string;
      tinhTrangSau?: string;
      mucNhienLieuTruoc?: number;
      mucNhienLieuSau?: number;
      soKmTruoc?: number;
      soKmSau?: number;
      maKhachHangXacNhan: string;
      maTaiXeXacNhan: string;
      images?: string[];
      ghiChu?: string;
    },
    currentUser: {
      id: string;
      vaiTro?: string;
      role?: { id?: string | number; name?: string };
    },
  ) {
    const ds = await getDataSource();
    return ds.transaction(async (manager) => {
      if (this.normalizeRole(currentUser) !== 'DRIVER') {
        throw new ForbiddenException('Only DRIVER can submit handover');
      }

      // load trip
      const trip = await manager.findOne(ChuyenDi, {
        where: { maChuyenDi: payload.maChuyenDi },
        relations: { khachHang: true, taiXe: true } as any,
      });
      if (!trip) throw new BadRequestException('Trip not found');

      const currentDriver = await this.taiXeRepo.findOne({
        where: { nguoiDung: { maNguoiDung: currentUser.id } as any },
      });

      if (!currentDriver) {
        throw new BadRequestException('Driver profile not found');
      }

      if (trip.khachHang?.maKhachHang !== payload.maKhachHangXacNhan) {
        throw new BadRequestException('Trip customer confirmation is invalid');
      }

      if (trip.taiXe?.maTaiXe !== currentDriver.maTaiXe) {
        throw new ForbiddenException(
          'You can only submit handover for trips assigned to you',
        );
      }

      if (payload.maTaiXeXacNhan !== currentDriver.maTaiXe) {
        throw new BadRequestException('Trip driver confirmation is invalid');
      }

      // create handover record
      const bienBan = manager.create(BienBanBanGiaoXe, {
        chuyenDi: trip,
        tinhTrangTruoc: payload.tinhTrangTruoc,
        tinhTrangSau: payload.tinhTrangSau,
        mucNhienLieuTruoc: payload.mucNhienLieuTruoc,
        mucNhienLieuSau: payload.mucNhienLieuSau,
        soKmTruoc: payload.soKmTruoc,
        soKmSau: payload.soKmSau,
        ghiChu: payload.ghiChu,
        khachHangXacNhan: { maKhachHang: payload.maKhachHangXacNhan } as any,
        taiXeXacNhan: { maTaiXe: payload.maTaiXeXacNhan } as any,
      } as any);

      await manager.save(BienBanBanGiaoXe, bienBan);

      // update trip status to DRIVING
      trip.trangThai = 'DRIVING';
      await manager.save(ChuyenDi, trip);

      // insert images into anh_chung_thuc (bulk)
      const images = payload.images ?? [];
      const anhEntities = images.map((url) =>
        manager.create(AnhChungThuc, {
          chuyenDi: trip,
          bienBan: bienBan,
          duongDan: url,
          loaiAnh: 'AFTER_TRIP',
        } as any),
      );

      if (anhEntities.length) {
        await manager.save(AnhChungThuc, anhEntities);
      }

      // log status change
      const ls = manager.create(LichSuTrangThai, {
        chuyenDi: trip,
        trangThaiCu: undefined,
        trangThaiMoi: 'DRIVING',
        nguoiCapNhat: payload.maKhachHangXacNhan || 'SYSTEM',
      } as any);

      await manager.save(LichSuTrangThai, ls);

      return { bienBan, imagesInserted: anhEntities.length, trip };
    });
  }

  /**
   * Cancel a trip (only if status is PENDING)
   */
  async cancelTrip(maChuyenDi: string, maKhachHang: string, lyDoHuy?: string) {
    const ds = await getDataSource();
    return ds.transaction(async (manager) => {
      // Find trip
      const trip = await manager.findOne(ChuyenDi, {
        where: { maChuyenDi },
        relations: { khachHang: true },
      });

      if (!trip) {
        throw new BadRequestException(
          'ChuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi khÃƒÆ’Ã‚Â´ng tÃƒÂ¡Ã‚Â»Ã¢â‚¬Å“n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i',
        );
      }

      // Verify ownership
      const customer = await manager.findOne(KhachHang, {
        where: { nguoiDung: { maNguoiDung: maKhachHang } } as any,
      });
      if (!customer || trip.khachHang.maKhachHang !== customer.maKhachHang) {
        throw new ForbiddenException(
          'ChuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi nÃƒÆ’Ã‚Â y khÃƒÆ’Ã‚Â´ng thuÃƒÂ¡Ã‚Â»Ã¢â€žÂ¢c vÃƒÂ¡Ã‚Â»Ã‚Â bÃƒÂ¡Ã‚ÂºÃ‚Â¡n',
        );
      }

      // Check status is PENDING
      if (trip.trangThai !== 'REQUESTED') {
        throw new BadRequestException(
          'ChÃƒÂ¡Ã‚Â»Ã¢â‚¬Â° cÃƒÆ’Ã‚Â³ thÃƒÂ¡Ã‚Â»Ã†â€™ hÃƒÂ¡Ã‚Â»Ã‚Â§y chuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi ÃƒÂ¡Ã‚Â»Ã…Â¸ trÃƒÂ¡Ã‚ÂºÃ‚Â¡ng thÃƒÆ’Ã‚Â¡i PENDING',
        );
      }

      // Update trip status to CANCELLED
      trip.trangThai = 'CANCELLED';
      trip.ghiChu = lyDoHuy || trip.ghiChu;
      await manager.save(ChuyenDi, trip);

      // Log status change
      const ls = manager.create(LichSuTrangThai, {
        maLichSu: `ls_${Date.now()}`,
        chuyenDi: trip,
        trangThaiCu: 'PENDING',
        trangThaiMoi: 'CANCELLED',
        nguoiCapNhat: maKhachHang,
      });
      await manager.save(LichSuTrangThai, ls);

      return {
        message:
          'ChuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi Ãƒâ€žÃ¢â‚¬ËœÃƒÆ’Ã‚Â£ Ãƒâ€žÃ¢â‚¬ËœÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã‚Â£c hÃƒÂ¡Ã‚Â»Ã‚Â§y',
        trip,
      };
    });
  }

  /**
   * Create a review for a trip
   */
  async createReview(
    maChuyenDi: string,
    maKhachHang: string,
    soSao: number,
    noiDung?: string,
  ) {
    const ds = await getDataSource();
    return ds.transaction(async (manager) => {
      // Find trip
      const trip = await manager.findOne(ChuyenDi, {
        where: { maChuyenDi },
        relations: { khachHang: true, taiXe: true },
      });

      if (!trip) {
        throw new BadRequestException(
          'ChuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi khÃƒÆ’Ã‚Â´ng tÃƒÂ¡Ã‚Â»Ã¢â‚¬Å“n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i',
        );
      }

      // Verify ownership
      const customer = await manager.findOne(KhachHang, {
        where: { nguoiDung: { maNguoiDung: maKhachHang } } as any,
      });
      if (!customer || trip.khachHang.maKhachHang !== customer.maKhachHang) {
        throw new ForbiddenException(
          'ChuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi nÃƒÆ’Ã‚Â y khÃƒÆ’Ã‚Â´ng thuÃƒÂ¡Ã‚Â»Ã¢â€žÂ¢c vÃƒÂ¡Ã‚Â»Ã‚Â bÃƒÂ¡Ã‚ÂºÃ‚Â¡n',
        );
      }

      // Check if review already exists
      const existing = await manager.findOne(DanhGia, {
        where: { chuyenDi: { maChuyenDi } },
      });
      if (existing) {
        throw new BadRequestException(
          'ChuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi nÃƒÆ’Ã‚Â y Ãƒâ€žÃ¢â‚¬ËœÃƒÆ’Ã‚Â£ Ãƒâ€žÃ¢â‚¬ËœÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã‚Â£c Ãƒâ€žÃ¢â‚¬ËœÃƒÆ’Ã‚Â¡nh giÃƒÆ’Ã‚Â¡',
        );
      }

      // Validate soSao
      if (soSao < 1 || soSao > 5) {
        throw new BadRequestException('Sá»‘ sao pháº£i tá»« 1 Ä‘áº¿n 5');
      }

      // Create review - maDanhGia is auto-generated by database via @PrimaryGeneratedColumn('uuid')
      const danhGia = manager.create(DanhGia, {
        chuyenDi: trip,
        soSao: soSao,
        noiDung: noiDung,
      });

      const saved = await manager.save(DanhGia, danhGia);

      // Auto-update driver's average rating if driver is assigned to this trip
      if (trip.taiXe && trip.taiXe.maTaiXe) {
        await this.reviewsService.updateDriverAverageRating(trip.taiXe.maTaiXe);
      }

      return {
        message:
          'Ãƒâ€žÃ‚ÂÃƒÆ’Ã‚Â¡nh giÃƒÆ’Ã‚Â¡ chuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi thÃƒÆ’Ã‚Â nh cÃƒÆ’Ã‚Â´ng',
        danhGia: saved,
      };
    });
  }

  /**
   * TÃƒÆ’Ã‚Â i xÃƒÂ¡Ã‚ÂºÃ‚Â¿ nhÃƒÂ¡Ã‚ÂºÃ‚Â­n cuÃƒÂ¡Ã‚Â»Ã¢â‚¬Ëœc
   * CÃƒÂ¡Ã‚ÂºÃ‚Â­p nhÃƒÂ¡Ã‚ÂºÃ‚Â­t ma_tai_xe vÃƒÆ’Ã‚Â o chuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi, Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¢i trÃƒÂ¡Ã‚ÂºÃ‚Â¡ng thÃƒÆ’Ã‚Â¡i thÃƒÆ’Ã‚Â nh 'ACCEPTED'
   */
  async acceptTrip(maChuyenDi: string, maTaiXe: string) {
    const ds = await getDataSource();
    return ds.transaction(async (manager) => {
      // Kiá»ƒm tra chuyáº¿n Ä‘i tá»“n táº¡i
      const trip = await manager.findOne(ChuyenDi, {
        where: { maChuyenDi },
        relations: ['taiXe'],
      });

      if (!trip) {
        throw new BadRequestException(
          'ChuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi khÃƒÆ’Ã‚Â´ng tÃƒÂ¡Ã‚Â»Ã¢â‚¬Å“n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i',
        );
      }

      // KiÃƒÂ¡Ã‚Â»Ã†â€™m tra trÃƒÂ¡Ã‚ÂºÃ‚Â¡ng thÃƒÆ’Ã‚Â¡i lÃƒÆ’Ã‚Â  PENDING
      if (trip.trangThai !== 'REQUESTED') {
        throw new BadRequestException(
          `ChuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi nÃƒÆ’Ã‚Â y khÃƒÆ’Ã‚Â´ng ÃƒÂ¡Ã‚Â»Ã…Â¸ trÃƒÂ¡Ã‚ÂºÃ‚Â¡ng thÃƒÆ’Ã‚Â¡i PENDING, hiÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i: ${trip.trangThai}`,
        );
      }

      // KiÃƒÂ¡Ã‚Â»Ã†â€™m tra khÃƒÆ’Ã‚Â´ng cÃƒÆ’Ã‚Â³ tÃƒÆ’Ã‚Â i xÃƒÂ¡Ã‚ÂºÃ‚Â¿ khÃƒÆ’Ã‚Â¡c Ãƒâ€žÃ¢â‚¬ËœÃƒÆ’Ã‚Â£ nhÃƒÂ¡Ã‚ÂºÃ‚Â­n
      if (trip.taiXe && trip.taiXe.maTaiXe !== maTaiXe) {
        throw new BadRequestException(
          'ChuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi nÃƒÆ’Ã‚Â y Ãƒâ€žÃ¢â‚¬ËœÃƒÆ’Ã‚Â£ Ãƒâ€žÃ¢â‚¬ËœÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã‚Â£c tÃƒÆ’Ã‚Â i xÃƒÂ¡Ã‚ÂºÃ‚Â¿ khÃƒÆ’Ã‚Â¡c nhÃƒÂ¡Ã‚ÂºÃ‚Â­n',
        );
      }

      // KiÃƒÂ¡Ã‚Â»Ã†â€™m tra tÃƒÆ’Ã‚Â i xÃƒÂ¡Ã‚ÂºÃ‚Â¿ tÃƒÂ¡Ã‚Â»Ã¢â‚¬Å“n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i
      let driver = await manager.findOne(TaiXe, {
        where: { maTaiXe },
      });

      if (!driver) {
        driver = await manager.findOne(TaiXe, {
          where: { nguoiDung: { maNguoiDung: maTaiXe } },
        });
      }

      if (!driver) {
        throw new BadRequestException(
          'TÃƒÆ’Ã‚Â i xÃƒÂ¡Ã‚ÂºÃ‚Â¿ khÃƒÆ’Ã‚Â´ng tÃƒÂ¡Ã‚Â»Ã¢â‚¬Å“n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i',
        );
      }

      // CÃƒÂ¡Ã‚ÂºÃ‚Â­p nhÃƒÂ¡Ã‚ÂºÃ‚Â­t ma_tai_xe vÃƒÆ’Ã‚Â  trÃƒÂ¡Ã‚ÂºÃ‚Â¡ng thÃƒÆ’Ã‚Â¡i
      trip.taiXe = driver;
      trip.trangThai = 'ACCEPTED';
      await manager.save(ChuyenDi, trip);

      // Create status history record
      const lichSu = manager.create(LichSuTrangThai, {
        chuyenDi: trip,
        trangThaiCu: trip.trangThai,
        trangThaiMoi: 'ACCEPTED',
        nguoiCapNhat: maTaiXe,
      });

      await manager.save(LichSuTrangThai, lichSu);

      return {
        message: 'NhÃƒÂ¡Ã‚ÂºÃ‚Â­n cuÃƒÂ¡Ã‚Â»Ã¢â‚¬Ëœc thÃƒÆ’Ã‚Â nh cÃƒÆ’Ã‚Â´ng',
        trip: {
          maChuyenDi: trip.maChuyenDi,
          maTaiXe: trip.taiXe.maTaiXe,
          trangThai: trip.trangThai,
        },
      };
    });
  }

  /**
   * CÃƒÂ¡Ã‚ÂºÃ‚Â­p nhÃƒÂ¡Ã‚ÂºÃ‚Â­t trÃƒÂ¡Ã‚ÂºÃ‚Â¡ng thÃƒÆ’Ã‚Â¡i chuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi
   * Cho phÃƒÆ’Ã‚Â©p tÃƒÆ’Ã‚Â i xÃƒÂ¡Ã‚ÂºÃ‚Â¿ Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¢i trÃƒÂ¡Ã‚ÂºÃ‚Â¡ng thÃƒÆ’Ã‚Â¡i tuÃƒÂ¡Ã‚ÂºÃ‚Â§n tÃƒÂ¡Ã‚Â»Ã‚Â±:
   * PENDING -> ACCEPTED -> ARRIVED -> STARTED -> COMPLETED
   */
  async updateTripStatus(
    maChuyenDi: string,
    maTaiXe: string,
    newStatus: string,
  ) {
    const ds = await getDataSource();
    return ds.transaction(async (manager) => {
      // Kiá»ƒm tra chuyáº¿n Ä‘i tá»“n táº¡i
      const trip = await manager.findOne(ChuyenDi, {
        where: { maChuyenDi },
        relations: ['taiXe'],
      });

      if (!trip) {
        throw new BadRequestException(
          'ChuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi khÃƒÆ’Ã‚Â´ng tÃƒÂ¡Ã‚Â»Ã¢â‚¬Å“n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i',
        );
      }

      // KiÃƒÂ¡Ã‚Â»Ã†â€™m tra tÃƒÆ’Ã‚Â i xÃƒÂ¡Ã‚ÂºÃ‚Â¿ lÃƒÆ’Ã‚Â  chÃƒÂ¡Ã‚Â»Ã‚Â§ sÃƒÂ¡Ã‚Â»Ã…Â¸ hÃƒÂ¡Ã‚Â»Ã‚Â¯u chuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi
      // Try to find driver by maTaiXe or maNguoiDung
      let driverId = maTaiXe;
      if (trip.taiXe && trip.taiXe.maTaiXe !== maTaiXe) {
        const driver = await manager.findOne(TaiXe, {
          where: { nguoiDung: { maNguoiDung: maTaiXe } },
        });
        if (driver) driverId = driver.maTaiXe;
      }
      if (!trip.taiXe || trip.taiXe.maTaiXe !== driverId) {
        throw new ForbiddenException(
          'BÃƒÂ¡Ã‚ÂºÃ‚Â¡n khÃƒÆ’Ã‚Â´ng cÃƒÆ’Ã‚Â³ quyÃƒÂ¡Ã‚Â»Ã‚Ân cÃƒÂ¡Ã‚ÂºÃ‚Â­p nhÃƒÂ¡Ã‚ÂºÃ‚Â­t chuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi nÃƒÆ’Ã‚Â y',
        );
      }

      // Kiá»ƒm tra status transition há»£p lá»‡
      const validTransitions: { [key: string]: string[] } = {
        PENDING: ['ACCEPTED'],
        ACCEPTED: ['ARRIVED'],
        ARRIVED: ['STARTED'],
        STARTED: ['COMPLETED'],
      };

      const allowedNextStatuses = validTransitions[trip.trangThai] || [];
      if (!allowedNextStatuses.includes(newStatus)) {
        throw new BadRequestException(
          `KhÃƒÆ’Ã‚Â´ng thÃƒÂ¡Ã‚Â»Ã†â€™ chuyÃƒÂ¡Ã‚Â»Ã†â€™n tÃƒÂ¡Ã‚Â»Ã‚Â« ${trip.trangThai} sang ${newStatus}. TrÃƒÂ¡Ã‚ÂºÃ‚Â¡ng thÃƒÆ’Ã‚Â¡i hÃƒÂ¡Ã‚Â»Ã‚Â£p lÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡: ${allowedNextStatuses.join(', ')}`,
        );
      }

      const oldStatus = trip.trangThai;
      trip.trangThai = newStatus;

      // Náº¿u chuyá»ƒn sang STARTED, cáº­p nháº­t thoiGianBatDau
      if (newStatus === 'STARTED' && !trip.thoiGianBatDau) {
        trip.thoiGianBatDau = new Date();
      }

      // Náº¿u chuyá»ƒn sang COMPLETED, cáº­p nháº­t thoiGianKetThuc
      if (newStatus === 'COMPLETED') {
        trip.thoiGianKetThuc = new Date();
      }

      await manager.save(ChuyenDi, trip);

      // TÃƒÂ¡Ã‚ÂºÃ‚Â¡o lÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¹ch sÃƒÂ¡Ã‚Â»Ã‚Â­ trÃƒÂ¡Ã‚ÂºÃ‚Â¡ng thÃƒÆ’Ã‚Â¡i
      const lichSu = manager.create(LichSuTrangThai, {
        chuyenDi: trip,
        trangThaiCu: oldStatus,
        trangThaiMoi: newStatus,
        nguoiCapNhat: driverId,
      });

      await manager.save(LichSuTrangThai, lichSu);

      // Emit WebSocket event to notify clients about trip status change
      if (this.tripsGateway) {
        this.tripsGateway.emitTripStatusChanged(maChuyenDi, {
          maChuyenDi,
          trangThai: newStatus,
          trangThaiCu: oldStatus,
          timestamp: new Date(),
          thoiGianBatDau: trip.thoiGianBatDau,
          thoiGianKetThuc: trip.thoiGianKetThuc,
        });
      }

      return {
        message: `CÃƒÂ¡Ã‚ÂºÃ‚Â­p nhÃƒÂ¡Ã‚ÂºÃ‚Â­t trÃƒÂ¡Ã‚ÂºÃ‚Â¡ng thÃƒÆ’Ã‚Â¡i chuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi thÃƒÆ’Ã‚Â nh ${newStatus} thÃƒÆ’Ã‚Â nh cÃƒÆ’Ã‚Â´ng`,
        trip: {
          maChuyenDi: trip.maChuyenDi,
          trangThai: trip.trangThai,
          thoiGianBatDau: trip.thoiGianBatDau,
          thoiGianKetThuc: trip.thoiGianKetThuc,
        },
      };
    });
  }

  /**
   * Create payment record for a completed trip
   */
  async createPayment(
    maChuyenDi: string,
    soTien: number,
    phuongThucThanhToan: string,
    maGiaoDichNgoai?: string,
    ma?: string,
  ) {
    const ds = await getDataSource();
    return ds.transaction(async (manager) => {
      // Find trip
      const trip = await manager.findOne(ChuyenDi, {
        where: { maChuyenDi },
        relations: { khachHang: true },
      });

      if (!trip) {
        throw new BadRequestException(
          'ChuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi khÃƒÆ’Ã‚Â´ng tÃƒÂ¡Ã‚Â»Ã¢â‚¬Å“n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i',
        );
      }

      // Validate trip status (must be COMPLETED)
      if (trip.trangThai !== 'COMPLETED') {
        throw new BadRequestException(
          `ChÃƒÂ¡Ã‚Â»Ã¢â‚¬Â° cÃƒÆ’Ã‚Â³ thÃƒÂ¡Ã‚Â»Ã†â€™ tÃƒÂ¡Ã‚ÂºÃ‚Â¡o thanh toÃƒÆ’Ã‚Â¡n cho chuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi Ãƒâ€žÃ¢â‚¬ËœÃƒÆ’Ã‚Â£ hoÃƒÆ’Ã‚Â n thÃƒÆ’Ã‚Â nh. TrÃƒÂ¡Ã‚ÂºÃ‚Â¡ng thÃƒÆ’Ã‚Â¡i hiÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i: ${trip.trangThai}`,
        );
      }

      // Check if payment already exists
      const existingPayment = await manager.findOne(ThanhToan, {
        where: { chuyenDi: { maChuyenDi } },
      });

      if (existingPayment) {
        throw new BadRequestException(
          'ChuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi nÃƒÆ’Ã‚Â y Ãƒâ€žÃ¢â‚¬ËœÃƒÆ’Ã‚Â£ cÃƒÆ’Ã‚Â³ bÃƒÂ¡Ã‚ÂºÃ‚Â£n ghi thanh toÃƒÆ’Ã‚Â¡n',
        );
      }

      // Validate payment amount
      if (soTien <= 0) {
        throw new BadRequestException('Sá»‘ tiá»�??n pháº£i lá»›n hÆ¡n 0');
      }

      // Create payment record
      const thanhToan = new ThanhToan();
      if (ma) thanhToan.maThanhToan = ma;
      thanhToan.chuyenDi = trip;
      thanhToan.soTien = soTien.toString();
      thanhToan.phuongThucThanhToan = phuongThucThanhToan;
      thanhToan.trangThaiThanhToan = 'PENDING';
      thanhToan.maGiaoDichNgoai = maGiaoDichNgoai;
      thanhToan.ma = ma;

      const saved = await manager.save(ThanhToan, thanhToan);

      return {
        message:
          'TÃƒÂ¡Ã‚ÂºÃ‚Â¡o bÃƒÂ¡Ã‚ÂºÃ‚Â£n ghi thanh toÃƒÆ’Ã‚Â¡n thÃƒÆ’Ã‚Â nh cÃƒÆ’Ã‚Â´ng',
        thanhToan: saved,
      };
    });
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    maThanhToan: string,
    trangThaiThanhToan: string,
    ghiChu?: string,
  ) {
    const ds = await getDataSource();
    return ds.transaction(async (manager) => {
      // Find payment
      const payment = await manager.findOne(ThanhToan, {
        where: { maThanhToan },
        relations: { chuyenDi: true },
      });

      if (!payment) {
        throw new BadRequestException(
          'BÃƒÂ¡Ã‚ÂºÃ‚Â£n ghi thanh toÃƒÆ’Ã‚Â¡n khÃƒÆ’Ã‚Â´ng tÃƒÂ¡Ã‚Â»Ã¢â‚¬Å“n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i',
        );
      }

      // Validate status transition
      const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
      if (!validStatuses.includes(trangThaiThanhToan)) {
        throw new BadRequestException(
          `TrÃƒÂ¡Ã‚ÂºÃ‚Â¡ng thÃƒÆ’Ã‚Â¡i khÃƒÆ’Ã‚Â´ng hÃƒÂ¡Ã‚Â»Ã‚Â£p lÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡. TrÃƒÂ¡Ã‚ÂºÃ‚Â¡ng thÃƒÆ’Ã‚Â¡i hÃƒÂ¡Ã‚Â»Ã‚Â£p lÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡: ${validStatuses.join(', ')}`,
        );
      }

      // Update payment status
      const oldStatus = payment.trangThaiThanhToan;
      payment.trangThaiThanhToan = trangThaiThanhToan;

      // If status is COMPLETED, set completion timestamp
      if (trangThaiThanhToan === 'COMPLETED' && !payment.thoiGianThanhToan) {
        payment.thoiGianThanhToan = new Date();
      }

      const updated = await manager.save(ThanhToan, payment);

      return {
        message: `CÃƒÂ¡Ã‚ÂºÃ‚Â­p nhÃƒÂ¡Ã‚ÂºÃ‚Â­t trÃƒÂ¡Ã‚ÂºÃ‚Â¡ng thÃƒÆ’Ã‚Â¡i thanh toÃƒÆ’Ã‚Â¡n tÃƒÂ¡Ã‚Â»Ã‚Â« ${oldStatus} sang ${trangThaiThanhToan} thÃƒÆ’Ã‚Â nh cÃƒÆ’Ã‚Â´ng`,
        thanhToan: updated,
        ghiChu: ghiChu,
      };
    });
  }

  /**
   * Get payment details
   */
  async getPaymentByTrip(maChuyenDi: string) {
    const payment = await this.thanhToanRepo.findOne({
      where: { chuyenDi: { maChuyenDi } },
      relations: ['chuyenDi'],
    });

    if (!payment) {
      return {
        message:
          'KhÃƒÆ’Ã‚Â´ng cÃƒÆ’Ã‚Â³ bÃƒÂ¡Ã‚ÂºÃ‚Â£n ghi thanh toÃƒÆ’Ã‚Â¡n cho chuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi nÃƒÆ’Ã‚Â y',
        thanhToan: null,
      };
    }

    return {
      message:
        'LÃƒÂ¡Ã‚ÂºÃ‚Â¥y thÃƒÆ’Ã‚Â´ng tin thanh toÃƒÆ’Ã‚Â¡n thÃƒÆ’Ã‚Â nh cÃƒÆ’Ã‚Â´ng',
      thanhToan: payment,
    };
  }

  /**
   * Save a message in trip chat
   * Called by WebSocket gateway when client sends message
   */
  async saveMessage(
    maChuyenDi: string,
    nguoiGuiId: string,
    noiDung: string,
    loaiTinNhan: string = 'text',
    mediaUrl?: string,
  ) {
    // Import TinNhan in module first
    const TinNhan = await import('../entities/tin-nhan.entity.js').then(
      (m) => m.TinNhan,
    );
    const TinNhanRepo = AppDataSource.getRepository(TinNhan);

    const tinNhan = TinNhanRepo.create({
      maChuyenDi,
      nguoiGuiId,
      noiDung,
      loaiTinNhan,
      mediaUrl,
      thoiGianGui: new Date(),
      daDoc: false,
    });

    return TinNhanRepo.save(tinNhan);
  }

  /**
   * Save customer location for real-time tracking
   * Called by WebSocket gateway when customer sends share_location event
   * Stores in ViTri table with loai_doi_tuong='CUSTOMER' and loai_su_kien
   *
   * @param maChuyenDi - Trip ID
   * @param userId - User ID (from JWT auth)
   * @param viDo - Latitude
   * @param kinhDo - Longitude
   * @param loaiSuKien - Event type: REALTIME_SHARE, PICKUP_UPDATE, ARRIVED
   */
  async saveCustomerLocation(
    maChuyenDi: string | undefined,
    userId: string | undefined,
    viDo: number,
    kinhDo: number,
    loaiSuKien:
      | 'REALTIME_SHARE'
      | 'PICKUP_UPDATE'
      | 'ARRIVED' = 'REALTIME_SHARE',
  ) {
    try {
      let trip: ChuyenDi | null = null;

      // Only look up trip if maChuyenDi is provided
      if (maChuyenDi) {
        trip = await this.chuyenDiRepo.findOne({
          where: { maChuyenDi },
          relations: ['khachHang'],
        });

        if (!trip) {
          throw new BadRequestException('Chuy?n ?i kh�ng t?n t?i');
        }
      }

      // Create location record in ViTri table
      const viTri = this.viTriRepo.create({
        ...(trip ? { chuyenDi: trip } : {}),
        taiXe: null,
        loaiDoiTuong: 'CUSTOMER',
        loaiSuKien,
        viDo,
        kinhDo,
        thoiGianCapNhat: new Date(),
      });

      const saved = await this.viTriRepo.save(viTri);

      return {
        maViTri: saved.maViTri,
        maChuyenDi: saved.chuyenDi?.maChuyenDi ?? maChuyenDi ?? null,
        loaiDoiTuong: saved.loaiDoiTuong,
        loaiSuKien: saved.loaiSuKien,
        viDo: saved.viDo,
        kinhDo: saved.kinhDo,
        thoiGianCapNhat: saved.thoiGianCapNhat,
      };
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException('Không thể lưu vị trí: ' + errorMsg);
    }
  }

  /**
   * Get all messages for a trip, sorted by timestamp ascending (oldest first)
   * @param maChuyenDi - Trip ID
   * @returns Array of messages
   */
  async getMessages(maChuyenDi: string) {
    const TinNhan = await import('../entities/tin-nhan.entity.js').then(
      (m) => m.TinNhan,
    );
    const TinNhanRepo = AppDataSource.getRepository(TinNhan);

    const messages = await TinNhanRepo.find({
      where: { maChuyenDi },
      order: { thoiGianGui: 'ASC' }, // Oldest first for chat history
      relations: ['chuyenDi', 'nguoiGui'],
    });

    return messages;
  }

  /**
   * Get trip history for a user (customer or driver)
   * @param maNguoiDung - User ID from JWT token
   * @param vaiTro - User role (CUSTOMER or DRIVER)
   * @param page - Page number (1-based)
   * @param limit - Records per page
   */
  async getTripHistory(
    maNguoiDung: string,
    vaiTro: string,
    page: number = 1,
    limit: number = 10,
  ) {
    // Validate pagination
    page = Math.max(1, page);
    limit = Math.min(100, Math.max(1, limit));
    const skip = (page - 1) * limit;

    const normalizedRole = vaiTro?.toUpperCase() || '';

    let query = this.chuyenDiRepo
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.xe', 'xe')
      .leftJoinAndSelect('xe.loaiXe', 'loaiXe')
      .leftJoinAndSelect('trip.lichSuTrangThais', 'lichSu')
      .orderBy('trip.thoiGianBatDau', 'DESC')
      .skip(skip)
      .take(limit);

    // Filter based on user role
    if (normalizedRole === 'CUSTOMER') {
      // Get trips where user is the customer
      query = query
        .leftJoinAndSelect('trip.khachHang', 'khachHang')
        .leftJoinAndSelect('khachHang.nguoiDung', 'customerUser')
        .where('customerUser.maNguoiDung = :maNguoiDung', { maNguoiDung });
    } else if (normalizedRole === 'DRIVER') {
      // Get trips where user is the driver
      query = query
        .leftJoinAndSelect('trip.taiXe', 'taiXe')
        .leftJoinAndSelect('taiXe.nguoiDung', 'driverUser')
        .where('driverUser.maNguoiDung = :maNguoiDung', { maNguoiDung });
    } else {
      throw new BadRequestException(
        'Vai trÃƒÆ’Ã‚Â² khÃƒÆ’Ã‚Â´ng hÃƒÂ¡Ã‚Â»Ã‚Â£p lÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡',
      );
    }

    const [trips, total] = await query.getManyAndCount();

    return {
      message:
        'LÃƒÂ¡Ã‚ÂºÃ‚Â¥y lÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¹ch sÃƒÂ¡Ã‚Â»Ã‚Â­ chuyÃƒÂ¡Ã‚ÂºÃ‚Â¿n Ãƒâ€žÃ¢â‚¬Ëœi thÃƒÆ’Ã‚Â nh cÃƒÆ’Ã‚Â´ng',
      data: trips,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get available trips matching driver skills
   * Used by REST polling (Option 3) - drivers call this periodically
   * Returns trips in REQUESTED status where vehicle type matches driver skills
   *
   * @param maTaiXe - Driver ID
   * @param page - Page number (1-based)
   * @param limit - Records per page
   */
  async getAvailableTripsForDriver(
    maTaiXeOrNguoiDung: string,
    page: number = 1,
    limit: number = 10,
  ) {
    // Try to find driver by maTaiXe first, then by maNguoiDung
    let driver = await this.taiXeRepo.findOne({
      where: { maTaiXe: maTaiXeOrNguoiDung },
      relations: ['kiNangs', 'kiNangs.loaiXe'],
    });

    if (!driver) {
      driver = await this.taiXeRepo.findOne({
        where: { nguoiDung: { maNguoiDung: maTaiXeOrNguoiDung } as any },
        relations: ['kiNangs', 'kiNangs.loaiXe'],
      });
    }

    if (!driver) {
      throw new BadRequestException('Driver not found');
    }

    const maLoaiXeList =
      driver.kiNangs?.map((kn) => kn.loaiXe?.maLoaiXe).filter(Boolean) || [];

    if (maLoaiXeList.length === 0) {
      return {
        message: 'No available trips found',
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    // Paginate
    page = Math.max(1, page);
    limit = Math.min(100, Math.max(1, limit));
    const skip = (page - 1) * limit;

    // Find trips in REQUESTED status with matching vehicle type and no driver assigned
    const [trips, total] = await this.chuyenDiRepo
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.xe', 'xe')
      .leftJoinAndSelect('xe.loaiXe', 'loaiXe')
      .leftJoinAndSelect('trip.khachHang', 'khachHang')
      .leftJoinAndSelect('khachHang.nguoiDung', 'customerUser')
      .where('trip.trang_thai = :status', { status: 'REQUESTED' })
      .andWhere('trip.ma_tai_xe IS NULL')
      .andWhere('loaiXe.ma_loai_xe IN (:...maLoaiXeList)', { maLoaiXeList })
      .orderBy('trip.thoiGianDat', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = trips.map((trip) => ({
      maChuyenDi: trip.maChuyenDi,
      diemDon: trip.diemDon,
      diemDen: trip.diemDen,
      quangDuongKm: trip.quangDuongKm,
      giaUocTinh: trip.giaUocTinh,
      thoiGianBatDau: trip.thoiGianBatDau,
      loaiXe: trip.xe?.loaiXe?.ma,
      maLoaiXe: trip.xe?.loaiXe?.maLoaiXe,
      tenKhachHang: trip.khachHang?.nguoiDung?.hoTen,
      soDienThoai: trip.khachHang?.nguoiDung?.soDienThoai,
    }));

    return {
      message: 'Available trips retrieved successfully',
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
