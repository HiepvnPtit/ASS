import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseControllerFactory } from '../../common/base';
import { VehiclesService } from '../../vehicles/vehicles.service';
import { Xe } from '../../entities/xe.entity';
import { CreateVehicleDto } from '../../vehicles/dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../../vehicles/dto/update-vehicle.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Admin Vehicles Controller - Full CRUD for Vehicles (Xe)
 *
 * This controller provides complete administrative access to all vehicle records.
 * Uses BaseControllerFactory to auto-generate CRUD endpoints.
 *
 * All endpoints:
 * - Require JWT authentication
 * - Require ADMIN role
 * - Support soft delete & restore
 *
 * Admin can:
 * - Register new vehicles
 * - View all vehicles with pagination
 * - Update vehicle details (brand, model, seats, etc.)
 * - Soft delete or restore vehicles
 * - Manage vehicle status and relationships
 *
 * Endpoints:
 * - POST /admin/vehicles - Register new vehicle
 * - GET /admin/vehicles/page - Paginated list
 * - GET /admin/vehicles/all - All records
 * - GET /admin/vehicles/:id - Get vehicle by ID
 * - PUT /admin/vehicles/:id - Update vehicle
 * - DELETE /admin/vehicles/:id - Soft delete vehicle
 * - POST /admin/vehicles/:id/restore - Restore deleted vehicle
 */
@ApiTags('ADMIN - CUSTOMER VEHICLES MANAGEMENT')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Controller('admin/vehicles')
export class AdminVehiclesController extends BaseControllerFactory(
  Xe,
  CreateVehicleDto,
  UpdateVehicleDto,
) {
  /**
   * Constructor automatically sets up all CRUD endpoints via BaseControllerFactory.
   * @param service The VehiclesService (extends BaseService<Xe>)
   */
  constructor(private readonly service: VehiclesService) {
    super(service);
  }
}
