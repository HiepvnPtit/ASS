import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseControllerFactory } from '../../common/base';
import { LoaiXeService } from '../../loai-xe/loai-xe.service';
import { LoaiXe } from '../../entities/loai-xe.entity';
import { CreateLoaiXeDto } from '../../loai-xe/dto/create-loai-xe.dto';
import { UpdateLoaiXeDto } from '../../loai-xe/dto/update-loai-xe.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Admin Loại Xe Controller - Full CRUD for Vehicle Types
 *
 * This controller provides complete administrative access to all vehicle type records.
 * Uses BaseControllerFactory to auto-generate CRUD endpoints.
 *
 * All endpoints:
 * - Require JWT authentication
 * - Require ADMIN role
 * - Support soft delete
 *
 * Endpoints:
 * - POST /admin/loai-xe - Create new vehicle type
 * - GET /admin/loai-xe/page - Paginated list
 * - GET /admin/loai-xe/all - All records
 * - GET /admin/loai-xe/:id - Get by ID
 * - PUT /admin/loai-xe/:id - Update record
 * - DELETE /admin/loai-xe/:id - Soft delete
 */
@ApiTags('ADMIN - VEHICLE TYPE MANAGEMENT')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Controller('admin/loai-xe')
export class AdminLoaiXeController extends BaseControllerFactory(
  LoaiXe,
  CreateLoaiXeDto,
  UpdateLoaiXeDto,
) {
  /**
   * Constructor automatically sets up all CRUD endpoints via BaseControllerFactory.
   * @param service The LoaiXeService (extends BaseService<LoaiXe>)
   */
  constructor(private readonly service: LoaiXeService) {
    super(service);
  }
}
