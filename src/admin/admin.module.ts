import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { LoaiXeModule } from '../loai-xe/loai-xe.module';
import { BangGiaModule } from '../bang-gia/bang-gia.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { TripsModule } from '../trips/trips.module';
import { PaymentsModule } from '../payments/payments.module';
import { ReviewsModule } from '../reviews/reviews.module';

import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminLoaiXeController } from './controllers/admin-loai-xe.controller';
import { AdminBangGiaController } from './controllers/admin-bang-gia.controller';
import { AdminVehiclesController } from './controllers/admin-vehicles.controller';
import { AdminTripsController } from './controllers/admin-trips.controller';
import { AdminPaymentsController } from './controllers/admin-payments.controller';
import { AdminReviewsController } from './controllers/admin-reviews.controller';

import { NguoiDung } from '../entities/nguoi-dung.entity';
import { TaiXe } from '../entities/tai-xe.entity';
import { KhachHang } from '../entities/khach-hang.entity';
import { Xe } from '../entities/xe.entity';
import { KhieuNai } from '../entities/khieu-nai.entity';
import { ChuyenDi } from '../entities/chuyen-di.entity';

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
 * All endpoints support soft delete and restore operations.
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
    ]),
    AuthModule,
    // Entity-specific modules with services
    LoaiXeModule,
    BangGiaModule,
    VehiclesModule,
    TripsModule,
    PaymentsModule,
    ReviewsModule,
  ],
  controllers: [
    AdminController,
    // Admin CRUD Controllers for Full Access
    AdminLoaiXeController,
    AdminBangGiaController,
    AdminVehiclesController,
    AdminTripsController,
    AdminPaymentsController,
    AdminReviewsController,
  ],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
