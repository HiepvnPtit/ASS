import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { TaiXe } from '../entities/tai-xe.entity';
import { ViTri } from '../entities/vi-tri.entity';
import { ChuyenDi } from '../entities/chuyen-di.entity';
import { KiNangTaiXe } from '../entities/ki-nang-tai-xe.entity';
import { LoaiXe } from '../entities/loai-xe.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaiXe, ViTri, ChuyenDi, KiNangTaiXe, LoaiXe]),
    AuthModule,
  ],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
