import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThanhToan } from '../entities/thanh-toan.entity';
import { PaymentsService } from './payments.service';

/**
 * Payments Module - Payment/Transaction Management
 *
 * Provides services for managing payment records.
 * Exported for use in other modules (admin, trips, etc.)
 */
@Module({
  imports: [TypeOrmModule.forFeature([ThanhToan])],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
