import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../common/base/base.service';
import { DanhGia } from '../entities/danh-gia.entity';
import { TaiXe } from '../entities/tai-xe.entity';

/**
 * Reviews Service - Review/Rating Management
 *
 * Extends BaseService for standard CRUD operations.
 * Manages all review-related operations including:
 * - Review creation and tracking
 * - Rating management (1-5 stars)
 * - Review content and feedback
 * - Review history and soft delete
 */
@Injectable()
export class ReviewsService extends BaseService<DanhGia> {
  constructor(
    @InjectRepository(DanhGia)
    private readonly reviewsRepo: Repository<DanhGia>,
    @InjectRepository(TaiXe)
    private readonly taiXeRepo: Repository<TaiXe>,
  ) {
    super(reviewsRepo);
  }

  /**
   * Find all reviews with optional relations
   */
  async findAllWithRelations(relations?: string[]): Promise<DanhGia[]> {
    return super.findAll({
      relations,
      order: { thoiGianDanhGia: 'DESC' } as any,
    });
  }

  /**
   * Find reviews by trip ID using query builder
   */
  async findReviewsByTrip(tripId: string): Promise<DanhGia[]> {
    return this.reviewsRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.chuyenDi', 'chuyenDi')
      .where('chuyenDi.maChuyenDi = :tripId', { tripId })
      .orderBy('review.thoiGianDanhGia', 'DESC')
      .getMany();
  }

  /**
   * Find reviews by rating (stars)
   */
  async findReviewsByRating(rating: number): Promise<DanhGia[]> {
    return this.reviewsRepo.find({
      where: { soSao: rating },
      order: { thoiGianDanhGia: 'DESC' },
    });
  }

  /**
   * Calculate average rating for a trip
   */
  async getAverageRatingForTrip(tripId: string): Promise<number> {
    const result = await this.reviewsRepo
      .createQueryBuilder('review')
      .leftJoin('review.chuyenDi', 'chuyenDi')
      .select('AVG(review.soSao)', 'avgRating')
      .where('chuyenDi.maChuyenDi = :tripId', { tripId })
      .getRawOne();

    return result?.avgRating || 0;
  }

  /**
   * Update driver's average rating (diemDanhGia) after a review is created
   * Calculates the average of all soSao from reviews for all trips by this driver
   * @param maTaiXe - Driver ID
   */
  async updateDriverAverageRating(maTaiXe: string): Promise<void> {
    // Calculate average rating across all reviews for this driver's trips
    const result = await this.reviewsRepo
      .createQueryBuilder('review')
      .leftJoin('review.chuyenDi', 'trip')
      .select('AVG(review.soSao)', 'avgRating')
      .addSelect('COUNT(review.maDanhGia)', 'reviewCount')
      .where('trip.ma_tai_xe = :maTaiXe', { maTaiXe })
      .andWhere('review.deletedAt IS NULL')
      .getRawOne();

    if (result && result.avgRating) {
      // Round to 2 decimal places
      const diemDanhGia = parseFloat(result.avgRating).toFixed(2);
      await this.taiXeRepo.update(
        { maTaiXe },
        { diemDanhGia: diemDanhGia as any },
      );
    }
  }
}
