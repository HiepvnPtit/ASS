import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { TripsGateway } from './trips.gateway';
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
import { TinNhan } from '../entities/tin-nhan.entity';

@Module({
  imports: [
    AuthModule,
    ReviewsModule,
    PromotionsModule,
    TypeOrmModule.forFeature([
      BangGia,
      TaiXe,
      KhachHang,
      KiNangTaiXe,
      ChuyenDi,
      LichSuTrangThai,
      BienBanBanGiaoXe,
      AnhChungThuc,
      Xe,
      DanhGia,
      ThanhToan,
      TinNhan,
    ]),
  ],
  controllers: [TripsController],
  providers: [TripsGateway, TripsService],
  exports: [TripsService],
})
export class TripsModule {}
