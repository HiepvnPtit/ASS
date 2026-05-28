import {
  Controller,
  Get,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminService } from '../admin.service';
import { GetPaginationQueryDto } from '../dto/get-pagination-query.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Admin Customers Management Controller
 * Quản lý tất cả khách hàng trong hệ thống
 */
@ApiTags('ADMIN - CUSTOMER MANAGEMENT')
@Controller('admin/customers')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminCustomersController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/customers
   * Lấy danh sách khách hàng
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lấy danh sách khách hàng',
    description: 'Bao gồm số lượng xe và thông tin cơ bản của mỗi khách hàng',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách khách hàng' })
  async getAllCustomers(@Query() query: GetPaginationQueryDto) {
    return this.adminService.getAllCustomers(query);
  }
}
