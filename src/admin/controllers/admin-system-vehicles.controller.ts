import {
  Controller,
  Get,
  Delete,
  Param,
  Body,
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
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminService } from '../admin.service';
import { GetPaginationQueryDto } from '../dto/get-pagination-query.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Admin System Vehicles Management Controller
 * Quản lý toàn bộ xe trong hệ thống
 */
@ApiTags('ADMIN - VEHICLE MANAGEMENT')
@Controller('admin/system-vehicles')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminSystemVehiclesController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/system-vehicles
   * Xem toàn bộ xe trong hệ thống
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lấy danh sách toàn bộ xe trong hệ thống',
    description: 'Biết xe nào của ai, biển số, loại xe, trạng thái xe, etc',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách xe' })
  async getAllVehicles(@Query() query: GetPaginationQueryDto) {
    return this.adminService.getAllVehicles(query);
  }

  /**
   * DELETE /admin/system-vehicles/:id
   * Admin xóa xe vi phạm hoặc khai báo sai
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xóa xe',
    description: 'Quyền Admin được phép xóa xe vi phạm hoặc khai báo sai',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', example: 'Vi phạm điều khoản dịch vụ' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Xóa xe thành công' })
  async deleteVehicle(
    @Param('id') vehicleId: string,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.deleteVehicle(vehicleId, reason);
  }
}
