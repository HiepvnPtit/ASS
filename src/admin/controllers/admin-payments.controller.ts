import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseControllerFactory } from '../../common/base';
import { PaymentsService } from '../../payments/payments.service';
import { ThanhToan } from '../../entities/thanh-toan.entity';
import { CreatePaymentDto } from '../../trips/dto/create-payment.dto';
import { UpdatePaymentStatusDto } from '../../trips/dto/update-payment-status.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Admin Payments Controller - Full CRUD for Payments (ThanhToan)
 *
 * This controller provides complete administrative access to all payment records.
 * Uses BaseControllerFactory to auto-generate CRUD endpoints.
 *
 * All endpoints:
 * - Require JWT authentication
 * - Require ADMIN role
 * - Support soft delete & restore
 *
 * Admin can:
 * - Create payment records manually
 * - View all payments with pagination
 * - Update payment status (PENDING, COMPLETED, FAILED, REFUNDED, etc.)
 * - Soft delete or restore payment records
 * - Monitor payment transactions
 *
 * Endpoints:
 * - POST /admin/payments - Create new payment record
 * - GET /admin/payments/page - Paginated list
 * - GET /admin/payments/all - All records
 * - GET /admin/payments/:id - Get payment by ID
 * - PUT /admin/payments/:id - Update payment
 * - DELETE /admin/payments/:id - Soft delete payment
 * - POST /admin/payments/:id/restore - Restore deleted payment
 */
@ApiTags('ADMIN - PAYMENT MANAGEMENT')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Controller('admin/payments')
export class AdminPaymentsController extends BaseControllerFactory(
  ThanhToan,
  CreatePaymentDto,
  UpdatePaymentStatusDto,
) {
  /**
   * Constructor automatically sets up all CRUD endpoints via BaseControllerFactory.
   * @param service The PaymentsService (extends BaseService<ThanhToan>)
   */
  constructor(private readonly service: PaymentsService) {
    super(service);
  }
}
