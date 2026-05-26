import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseControllerFactory } from '../common/base';
import { LoaiXeService } from './loai-xe.service';
import { LoaiXe } from '../entities/loai-xe.entity';
import { CreateLoaiXeDto } from './dto/create-loai-xe.dto';
import { UpdateLoaiXeDto } from './dto/update-loai-xe.dto';

/**
 * LoaiXe Controller - Auto-generated CRUD endpoints via BaseControllerFactory
 *
 * This controller demonstrates the power of the BaseControllerFactory "Super Weapon".
 * All endpoints are automatically generated with:
 * - Full Swagger documentation
 * - JWT authentication guards
 * - Input validation
 * - Soft delete & restore capabilities
 * - Pagination support
 *
 * No need to write endpoint methods manually!
 */
@ApiTags('LoaiXe (Vehicle Types)')
@ApiBearerAuth('JWT')
@Controller('loai-xe')
export class LoaiXeController extends BaseControllerFactory(
  LoaiXe,
  CreateLoaiXeDto,
  UpdateLoaiXeDto,
) {
  /**
   * Constructor automatically sets up all 7 CRUD endpoints
   * @param service Injected LoaiXeService (extends BaseService)
   */
  constructor(private readonly service: LoaiXeService) {
    super(service);
  }
}
