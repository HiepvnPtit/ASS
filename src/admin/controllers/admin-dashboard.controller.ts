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
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Admin Dashboard & Reports Controller
 * Thống kê, báo cáo và quản lý khiếu nại
 */
@ApiTags('ADMIN - DASHBOARD & REPORTS')
@Controller('admin/dashboard')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminDashboardController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/dashboard/metrics
   * Dashboard Metrics - Thống kê chung
   */
  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Dashboard Metrics',
    description:
      'Lấy các số liệu thống kê chung: tổng người dùng, tài xế, chuyến đi, doanh thu, etc',
  })
  @ApiResponse({ status: 200, description: 'Thống kê dashboard' })
  async getDashboardMetrics() {
    return await this.adminService.getDashboardMetrics();
  }

  /**
   * GET /admin/dashboard/complaints
   * Danh sách khiếu nại
   */
  @Get('complaints')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Danh sách khiếu nại',
    description: 'Quản lý và theo dõi các khiếu nại từ người dùng',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách khiếu nại' })
  async getComplaints(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.adminService.getComplaints(
      parseInt(page) || 1,
      parseInt(limit) || 20,
    );
  }
}
