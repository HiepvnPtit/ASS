import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DanhGia } from '../entities/danh-gia.entity';
import { TaiXe } from '../entities/tai-xe.entity';
import { ReviewsService } from './reviews.service';

/**
 * Reviews Module - Review/Rating Management
 *
 * Provides services for managing review and rating records.
 * Exported for use in other modules (admin, trips, etc.)
 */
@Module({
  imports: [TypeOrmModule.forFeature([DanhGia, TaiXe])],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
