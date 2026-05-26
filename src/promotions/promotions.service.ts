import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KhuyenMai } from '../entities/khuyen-mai.entity';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(KhuyenMai)
    private readonly khuyenMaiRepo: Repository<KhuyenMai>,
  ) {}

  /**
   * Get all active promotions/vouchers
   */
  async getActivePromotions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const promotions = await this.khuyenMaiRepo.find({
      where: {
        trangThai: 'ACTIVE',
      },
    });

    // Filter by date range
    return promotions.filter((p) => {
      if (p.ngayBatDau && new Date(p.ngayBatDau) > today) {
        return false; // Not started yet
      }
      if (p.ngayKetThuc && new Date(p.ngayKetThuc) < today) {
        return false; // Already expired
      }
      // Check if usage limit exceeded
      if (p.soLanSuDung && p.daSuDung >= p.soLanSuDung) {
        return false; // Usage limit exceeded
      }
      return true;
    });
  }

  /**
   * Validate voucher code and apply discount
   * Returns discount amount or throws exception if invalid
   */
  async validateAndApplyVoucher(
    voucherCode: string,
    estimatedPrice: number,
  ): Promise<{
    isValid: boolean;
    discountAmount: number;
    finalPrice: number;
  }> {
    const promotion = await this.khuyenMaiRepo.findOne({
      where: { maCode: voucherCode },
    });

    if (!promotion) {
      throw new NotFoundException(`Voucher code "${voucherCode}" not found`);
    }

    // Check if promotion is active
    if (promotion.trangThai !== 'ACTIVE') {
      throw new BadRequestException(
        `Voucher is not active (status: ${promotion.trangThai})`,
      );
    }

    // Check date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (promotion.ngayBatDau && new Date(promotion.ngayBatDau) > today) {
      throw new BadRequestException('Voucher has not started yet');
    }

    if (promotion.ngayKetThuc && new Date(promotion.ngayKetThuc) < today) {
      throw new BadRequestException('Voucher has expired');
    }

    // Check usage limit
    if (promotion.soLanSuDung && promotion.daSuDung >= promotion.soLanSuDung) {
      throw new BadRequestException('Voucher usage limit exceeded');
    }

    // Check minimum price requirement
    if (
      promotion.giaToiThieu &&
      estimatedPrice < parseFloat(promotion.giaToiThieu as any)
    ) {
      throw new BadRequestException(
        `Minimum trip price of ${promotion.giaToiThieu} required to use this voucher`,
      );
    }

    // Calculate discount
    const discountPercentage = parseFloat(promotion.phanTramGiam as any);
    const maxDiscount = parseFloat(promotion.giamToiDa as any);
    let discountAmount = (estimatedPrice * discountPercentage) / 100;

    // Cap discount to maximum allowed
    if (discountAmount > maxDiscount) {
      discountAmount = maxDiscount;
    }

    const finalPrice = Math.max(0, estimatedPrice - discountAmount);

    return {
      isValid: true,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalPrice: parseFloat(finalPrice.toFixed(2)),
    };
  }

  /**
   * Get promotion details by code
   */
  async getPromotionByCode(voucherCode: string) {
    const promotion = await this.khuyenMaiRepo.findOne({
      where: { maCode: voucherCode },
    });

    if (!promotion) {
      throw new NotFoundException(`Voucher code "${voucherCode}" not found`);
    }

    return promotion;
  }
}
