import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BangGia } from '../entities/bang-gia.entity';
import { LoaiXe } from '../entities/loai-xe.entity';
import { BangGiaService } from './bang-gia.service';
import { BangGiaController } from './bang-gia.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BangGia, LoaiXe])],
  providers: [BangGiaService],
  controllers: [BangGiaController],
  exports: [BangGiaService],
})
export class BangGiaModule {}
