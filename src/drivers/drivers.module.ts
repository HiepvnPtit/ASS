import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { TaiXe } from '../entities/tai-xe.entity';
import { ViTri } from '../entities/vi-tri.entity';
import { ChuyenDi } from '../entities/chuyen-di.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaiXe, ViTri, ChuyenDi]), AuthModule],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
