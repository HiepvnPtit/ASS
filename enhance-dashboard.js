const fs = require("fs");
const path = "O:\\nestjs-boilerplate-main\\nestjs-boilerplate-main\\src\\admin\\admin.service.ts";
let content = fs.readFileSync(path, "utf8");

// 1. Add ThanhToan and DanhGia imports
content = content.replace(
  "import { ChuyenDi } from '../entities/chuyen-di.entity';",
  "import { ChuyenDi } from '../entities/chuyen-di.entity';\nimport { ThanhToan } from '../entities/thanh-toan.entity';\nimport { DanhGia } from '../entities/danh-gia.entity';"
);

// 2. Add repositories to constructor
content = content.replace(
  "    @InjectRepository(ChuyenDi)\n    private readonly chuyenDiRepo: Repository<ChuyenDi>,\n  ) {}",
  "    @InjectRepository(ChuyenDi)\n    private readonly chuyenDiRepo: Repository<ChuyenDi>,\n    @InjectRepository(ThanhToan)\n    private readonly thanhToanRepo: Repository<ThanhToan>,\n    @InjectRepository(DanhGia)\n    private readonly danhGiaRepo: Repository<DanhGia>,\n  ) {}"
);

// 3. Replace getDashboardMetrics with enhanced version
const oldMethod = content.substring(
  content.indexOf("async getDashboardMetrics()"),
  content.indexOf("\n  }\n\n  // ==========")
);

const newMethod = `async getDashboardMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Users
    const totalUsers = await this.nguoiDungRepo.count();
    const totalCustomers = await this.khachHangRepo.count();
    const totalDrivers = await this.taiXeRepo.count();

    // Drivers status
    const driversOnline = await this.taiXeRepo.count({ where: { trangThaiHoatDong: "ONLINE" } });
    const driversVerified = await this.taiXeRepo.count({ where: { trangThaiXacThuc: "VERIFIED" } });
    const driversPending = await this.taiXeRepo.count({ where: { trangThaiXacThuc: "PENDING" } });

    // Vehicles
    const totalVehicles = await this.xeRepo.count();

    // Trips
    const totalTrips = await this.chuyenDiRepo.count();
    const tripsToday = await this.chuyenDiRepo.count({ where: { thoiGianDat: MoreThanOrEqual(today) } });
    const tripsCompleted = await this.chuyenDiRepo.count({ where: { trangThai: "COMPLETED" } });
    const tripsCancelled = await this.chuyenDiRepo.count({ where: { trangThai: "CANCELLED" } });
    const tripsRequested = await this.chuyenDiRepo.count({ where: { trangThai: "REQUESTED" } });

    // Revenue
    const revenueResult = await this.thanhToanRepo
      .createQueryBuilder("pay")
      .select("COALESCE(SUM(CAST(pay.soTien AS DECIMAL)), 0)", "totalRevenue")
      .where("pay.trang_thai_thanh_toan = :status", { status: "COMPLETED" })
      .getRawOne();
    const totalRevenue = parseFloat(revenueResult?.totalRevenue || "0").toFixed(2);

    // Revenue today
    const revenueTodayResult = await this.thanhToanRepo
      .createQueryBuilder("pay")
      .select("COALESCE(SUM(CAST(pay.soTien AS DECIMAL)), 0)", "revenueToday")
      .where("pay.trang_thai_thanh_toan = :status", { status: "COMPLETED" })
      .andWhere("pay.thoi_gian_thanh_toan >= :today", { today })
      .getRawOne();
    const revenueToday = parseFloat(revenueTodayResult?.revenueToday || "0").toFixed(2);

    // Average rating
    const ratingResult = await this.danhGiaRepo
      .createQueryBuilder("review")
      .select("COALESCE(AVG(review.soSao), 0)", "avgRating")
      .getRawOne();
    const averageRating = parseFloat(ratingResult?.avgRating || "0").toFixed(2);

    // Complaints
    const totalComplaints = await this.khieuNaiRepo.count();
    const pendingComplaints = await this.khieuNaiRepo.count({ where: { trangThai: "PENDING" } });

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
        currency: "VND",
      },
      ratings: {
        average: averageRating,
      },
      complaints: {
        total: totalComplaints,
        pending: pendingComplaints,
      },
    };
  }`;

content = content.replace(oldMethod, newMethod);

fs.writeFileSync(path, content, "utf8");
console.log("Dashboard enhanced successfully");
