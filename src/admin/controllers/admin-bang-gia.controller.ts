import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseControllerFactory } from '../../common/base';
import { BangGiaService } from '../../bang-gia/bang-gia.service';
import { BangGia } from '../../entities/bang-gia.entity';
import { CreateBangGiaDto } from '../../bang-gia/dto/create-bang-gia.dto';
import { UpdateBangGiaDto } from '../../bang-gia/dto/update-bang-gia.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Admin Bang Gia (Price Table) Controller - Full CRUD for Price Tables
 *
 * This controller provides complete administrative access to all price table records.
 * Uses BaseControllerFactory to auto-generate CRUD endpoints.
 *
 * All endpoints:
 * - Require JWT authentication
 * - Require ADMIN role
 * - Support soft delete & restore
 *
 * Admin can:
 * - Create new price tables
 * - View all price tables with pagination
 * - Update price table details (pricing rules, regions, etc.)
 * - Soft delete or restore price tables
 * - Manage price table versions
 *
 * Endpoints:
 * - POST /admin/bang-gia - Create new price table
 * - GET /admin/bang-gia/page - Paginated list
 * - GET /admin/bang-gia/all - All records
 * - GET /admin/bang-gia/:id - Get price table by ID
 * - PUT /admin/bang-gia/:id - Update price table
 * - DELETE /admin/bang-gia/:id - Soft delete price table
 * - POST /admin/bang-gia/:id/restore - Restore deleted price table
 */
@ApiTags('Admin - Full Access')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Controller('admin/bang-gia')
export class AdminBangGiaController extends BaseControllerFactory(
  BangGia,
  CreateBangGiaDto,
  UpdateBangGiaDto,
) {
  /**
   * Constructor automatically sets up all CRUD endpoints via BaseControllerFactory.
   * @param service The BangGiaService (extends BaseService<BangGia>)
   */
  constructor(private readonly service: BangGiaService) {
    super(service);
  }
}
