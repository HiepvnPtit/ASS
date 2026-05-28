import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Main Admin Controller
 *
 * ⚠️ NOTE: This controller is kept for backward compatibility.
 *
 * All endpoints have been moved to specialized controllers for better organization:
 *
 * 📍 User Management Endpoints:
 *    - AdminUsersController @ /admin/users
 *
 * 📍 Driver Management Endpoints:
 *    - AdminDriversController @ /admin/drivers
 *
 * 📍 Customer Management Endpoints:
 *    - AdminCustomersController @ /admin/customers
 *
 * 📍 System Vehicle Management Endpoints:
 *    - AdminSystemVehiclesController @ /admin/system-vehicles
 *
 * 📍 Dashboard & Reports Endpoints:
 *    - AdminDashboardController @ /admin/dashboard
 *
 * 📍 Additional Resource Management:
 *    - AdminLoaiXeController @ /admin/loai-xe
 *    - AdminBangGiaController @ /admin/bang-gia
 *    - AdminVehiclesController @ /admin/vehicles
 *    - AdminTripsController @ /admin/trips
 *    - AdminPaymentsController @ /admin/payments
 *    - AdminReviewsController @ /admin/reviews
 */
@ApiTags('ADMIN - MAIN')
@Controller('admin')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminController {
  // All endpoints have been moved to specialized controllers
  // See class documentation for the mapping
}
