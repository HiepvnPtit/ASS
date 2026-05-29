import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../common/base/base.service';
import { ThanhToan } from '../entities/thanh-toan.entity';
import { UpdatePaymentStatusDto } from '../trips/dto/update-payment-status.dto';

/**
 * Payments Service - Payment/Transaction Management
 *
 * Extends BaseService for standard CRUD operations.
 * Manages all payment-related operations including:
 * - Payment creation and tracking
 * - Payment status updates
 * - Payment history
 * - Payment soft delete
 */
@Injectable()
export class PaymentsService extends BaseService<ThanhToan> {
  constructor(
    @InjectRepository(ThanhToan)
    private readonly paymentsRepo: Repository<ThanhToan>,
  ) {
    super(paymentsRepo);
  }

  /**
   * Find all payments with optional relations
   */
  async findAllWithRelations(relations?: string[]): Promise<ThanhToan[]> {
    return super.findAll({
      relations,
      order: { createdAt: 'DESC' } as any,
    });
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    id: string,
    dto: UpdatePaymentStatusDto,
  ): Promise<ThanhToan> {
    return super.update(id, dto as any);
  }

  /**
   * Find payments by trip ID using query builder
   */
  async findPaymentsByTrip(tripId: string): Promise<ThanhToan[]> {
    return this.paymentsRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.chuyenDi', 'chuyenDi')
      .where('chuyenDi.maChuyenDi = :tripId', { tripId })
      .orderBy('payment.createdAt', 'DESC')
      .getMany();
  }
}
