import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoaiXe } from '../entities/loai-xe.entity';
import { LoaiXeService } from './loai-xe.service';
import { LoaiXeController } from './loai-xe.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LoaiXe])],
  controllers: [LoaiXeController],
  providers: [LoaiXeService],
  exports: [LoaiXeService],
})
export class LoaiXeModule {}
