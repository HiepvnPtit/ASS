import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BaseControllerFactory } from '../common/base';
import { BangGiaService } from './bang-gia.service';
import { BangGia } from '../entities/bang-gia.entity';
import { CreateBangGiaDto } from './dto/create-bang-gia.dto';
import { UpdateBangGiaDto } from './dto/update-bang-gia.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * BangGia Controller - Auto-generated CRUD via BaseControllerFactory
 * Manages price/rate tables
 * **Authorization**: Only ADMIN role can CREATE, UPDATE, DELETE price tables
 *
 * Endpoints:
 * - POST / - Create price entry (ADMIN only) 🔐
 * - GET /page - Get paginated entries (Public)
 * - GET /all - Get all entries (Public)
 * - GET /:id - Get entry by ID (Public)
 * - PUT /:id - Update entry (ADMIN only) 🔐
 * - DELETE /:id - Soft delete entry (ADMIN only) 🔐
 */
@ApiTags('BangGia (Price Tables)')
@ApiBearerAuth('JWT')
@Controller('bang-gia')
export class BangGiaController extends BaseControllerFactory(
  BangGia,
  CreateBangGiaDto,
  UpdateBangGiaDto,
) {
  constructor(private readonly service: BangGiaService) {
    super(service);
  }

  /**
   * POST / - Create new price table (ADMIN only)
   * Override to add RolesGuard and @Roles('ADMIN')
   * Returns 403 Forbidden if user is not ADMIN
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Create a new price table (ADMIN only)',
    description:
      'Creates a new price table. Only administrators can access this endpoint.',
  })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async create(@Body() dto: CreateBangGiaDto): Promise<BangGia> {
    return this.service.create(dto as any);
  }

  /**
   * PUT /:id - Update price table (ADMIN only)
   * Override to add RolesGuard and @Roles('ADMIN')
   * Returns 403 Forbidden if user is not ADMIN
   */
  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Update price table (ADMIN only)',
    description:
      'Updates a price table. Only administrators can access this endpoint.',
  })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBangGiaDto,
  ): Promise<BangGia> {
    return this.service.update(id, dto as any);
  }

  /**
   * DELETE /:id - Soft delete price table (ADMIN only)
   * Override to add RolesGuard and @Roles('ADMIN')
   * Returns 403 Forbidden if user is not ADMIN
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Soft delete price table (ADMIN only)',
    description:
      'Soft deletes a price table. Only administrators can access this endpoint.',
  })
  async softDelete(@Param('id') id: string): Promise<BangGia> {
    return this.service.softDelete(id);
  }
}
