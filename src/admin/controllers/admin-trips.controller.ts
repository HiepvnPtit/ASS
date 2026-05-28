import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseControllerFactory } from '../../common/base';
import { TripsService } from '../../trips/trips.service';
import { ChuyenDi } from '../../entities/chuyen-di.entity';
import { CreateTripDto } from '../../trips/dto/create-trip.dto';
import { UpdateTripDto } from '../../trips/dto/update-trip.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Admin Trips Controller - Full CRUD for Trips (ChuyenDi)
 *
 * This controller provides complete administrative access to all trip records.
 * Uses BaseControllerFactory to auto-generate CRUD endpoints.
 *
 * All endpoints:
 * - Require JWT authentication
 * - Require ADMIN role
 * - Support soft delete & restore
 *
 * Admin can:
 * - Create new trips
 * - View all trips with pagination
 * - Update any trip details
 * - Soft delete or restore trips
 * - View trip status history
 *
 * Endpoints:
 * - POST /admin/trips - Create new trip
 * - GET /admin/trips/page - Paginated list
 * - GET /admin/trips/all - All records
 * - GET /admin/trips/:id - Get trip by ID
 * - PUT /admin/trips/:id - Update trip
 * - DELETE /admin/trips/:id - Soft delete trip
 * - POST /admin/trips/:id/restore - Restore deleted trip
 */
@ApiTags('ADMIN - TRIP MANAGEMENT')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Controller('admin/trips')
export class AdminTripsController extends BaseControllerFactory(
  ChuyenDi,
  CreateTripDto,
  UpdateTripDto,
) {
  /**
   * Constructor automatically sets up all CRUD endpoints via BaseControllerFactory.
   * @param service The TripsService (extends BaseService<ChuyenDi>)
   */
  constructor(private readonly service: TripsService) {
    super(service);
  }
}
