import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { LoaiXeModule } from '../loai-xe/loai-xe.module';
import { BangGiaModule } from '../bang-gia/bang-gia.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { TripsModule } from '../trips/trips.module';
import { PaymentsModule } from '../payments/payments.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { KhieuNaiModule } from '../khieu-nai/khieu-nai.module';

import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminDriversController } from './controllers/admin-drivers.controller';
import { AdminCustomersController } from './controllers/admin-customers.controller';
import { AdminSystemVehiclesController } from './controllers/admin-system-vehicles.controller';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { AdminLoaiXeController } from './controllers/admin-loai-xe.controller';
import { AdminBangGiaController } from './controllers/admin-bang-gia.controller';
import { AdminTripsController } from './controllers/admin-trips.controller';
import { AdminPaymentsController } from './controllers/admin-payments.controller';
import { AdminReviewsController } from './controllers/admin-reviews.controller';
import { AdminKhieuNaiController } from './controllers/admin-khieu-nai.controller';

import { NguoiDung } from '../entities/nguoi-dung.entity';
import { TaiXe } from '../entities/tai-xe.entity';
import { KhachHang } from '../entities/khach-hang.entity';
import { Xe } from '../entities/xe.entity';
import { KhieuNai } from '../entities/khieu-nai.entity';
import { ChuyenDi } from '../entities/chuyen-di.entity';
import { ThanhToan } from '../entities/thanh-toan.entity';
import { DanhGia } from '../entities/danh-gia.entity';

/**
 * Admin Module - Administrative Management
 *
 * Provides full CRUD access to all database entities for administrators.
 *
 * Features:
 * - User management (customers, drivers, admins)
 * - Vehicle type management (LoaiXe)
 * - Price table management (BangGia)
 * - Vehicle management (Xe)
 * - Trip management (ChuyenDi)
 * - Payment management (ThanhToan)
 * - Review management (DanhGia)
 * - Complaint management (KhieuNai)
 *
 * All controllers require JWT authentication and ADMIN role.
 * All endpoints support soft delete operations.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      NguoiDung,
      TaiXe,
      KhachHang,
      Xe,
      KhieuNai,
      ChuyenDi,
      ThanhToan,
      DanhGia,
    ]),
    AuthModule,
    // Entity-specific modules with services
    LoaiXeModule,
    BangGiaModule,
    VehiclesModule,
    TripsModule,
    PaymentsModule,
    ReviewsModule,
    KhieuNaiModule,
  ],
  controllers: [
    AdminController,
    // Business-specific management controllers
    AdminUsersController,
    AdminDriversController,
    AdminCustomersController,
    AdminSystemVehiclesController,
    AdminDashboardController,
    // Admin CRUD Controllers for Full Access
    AdminLoaiXeController,
    AdminBangGiaController,
    AdminTripsController,
    AdminPaymentsController,
    AdminReviewsController,
    AdminKhieuNaiController,
  ],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
