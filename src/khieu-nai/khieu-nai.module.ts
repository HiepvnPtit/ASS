import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KhieuNai } from '../entities/khieu-nai.entity';
import { KhieuNaiService } from './khieu-nai.service';
import { KhieuNaiController } from './khieu-nai.controller';

@Module({
  imports: [TypeOrmModule.forFeature([KhieuNai])],
  providers: [KhieuNaiService],
  controllers: [KhieuNaiController],
  exports: [KhieuNaiService],
})
export class KhieuNaiModule {}
