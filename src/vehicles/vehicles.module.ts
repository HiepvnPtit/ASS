import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Xe } from '../entities/xe.entity';
import { KhachHang } from '../entities/khach-hang.entity';
import { LoaiXe } from '../entities/loai-xe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Xe, KhachHang, LoaiXe]), AuthModule],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
