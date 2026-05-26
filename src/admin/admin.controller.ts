import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
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
import { AdminService } from './admin.service';
import { ApproveDriverDto } from './dto/approve-driver.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ToggleUserStatusDto } from './dto/toggle-user-status.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { GetPaginationQueryDto } from './dto/get-pagination-query.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin - Super Admin')
@Controller('admin')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ===== QUẢN LÝ NGƯỜI DÙNG (Users Management) =====

  /**
   * GET /admin/users
   * Lấy danh sách tất cả người dùng với filter, phân trang, tìm kiếm
   */
  @Get('users')
  @ApiOperation({
    summary: 'Lấy danh sách tất cả người dùng',
    description:
      'Hỗ trợ filter theo vai trò, trạng thái và tìm kiếm theo email/sdt',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'vaiTro',
    required: false,
    enum: ['CUSTOMER', 'DRIVER', 'ADMIN'],
  })
  @ApiQuery({ name: 'trangThai', required: false, enum: ['ACTIVE', 'BANNED'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Danh sách người dùng' })
  async getAllUsers(@Query() query: GetUsersQueryDto) {
    return this.adminService.getAllUsers(query);
  }

  /**
   * PUT /admin/users/:id
   * Cập nhật thông tin cơ bản người dùng
   */
  @Put('users/:id')
  @ApiOperation({
    summary: 'Cập nhật thông tin người dùng',
    description: 'Admin cập nhật Họ tên, SĐT của bất kỳ user nào',
  })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async updateUser(
    @Param('id') userId: string,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(userId, updateDto);
  }

  /**
   * PATCH /admin/users/:id/toggle-status
   * Khóa/Mở khóa tài khoản (Soft Deactivate)
   */
  @Patch('users/:id/toggle-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Khóa/Mở khóa tài khoản',
    description: 'Đổi trạng thái từ ACTIVE sang BANNED và ngược lại',
  })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @ApiResponse({ status: 200, description: 'Thay đổi trạng thái thành công' })
  async toggleUserStatus(
    @Param('id') userId: string,
    @Body() toggleDto: ToggleUserStatusDto,
  ) {
    return this.adminService.toggleUserStatus(userId, toggleDto);
  }

  // ===== QUẢN LÝ TÀI XẾ (Drivers Management) =====

  /**
   * GET /admin/drivers
   * Lấy danh sách tài xế (join với người dùng)
   */
  @Get('drivers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lấy danh sách tài xế',
    description: 'Bao gồm thông tin từ bảng người dùng',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách tài xế' })
  async getAllDrivers(@Query() query: GetPaginationQueryDto) {
    return this.adminService.getAllDrivers(query);
  }

  /**
   * PUT /admin/drivers/:id
   * Admin sửa thông tin bằng lái, CCCD, hạng sao của tài xế
   */
  @Put('drivers/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cập nhật thông tin tài xế',
    description: 'Admin sửa bằng lái, CCCD, hạng sao nếu có sai sót',
  })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async updateDriver(
    @Param('id') driverId: string,
    @Body() updateDto: UpdateDriverDto,
  ) {
    return this.adminService.updateDriver(driverId, updateDto);
  }

  /**
   * GET /admin/drivers/pending
   * Lấy danh sách tài xế chờ duyệt
   */
  @Get('drivers/pending')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách tài xế chờ duyệt' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách tài xế chờ duyệt' })
  async getPendingDrivers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.adminService.getPendingDrivers(
      parseInt(page) || 1,
      parseInt(limit) || 20,
    );
  }

  /**
   * POST /admin/drivers/:id/approve
   * Duyệt hồ sơ tài xế
   */
  @Post('drivers/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Duyệt hồ sơ tài xế' })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @ApiResponse({ status: 200, description: 'Duyệt thành công' })
  async approveDriver(
    @Param('id') maTaiXe: string,
    @Body() approveDto: ApproveDriverDto,
  ) {
    return this.adminService.approveDriver(maTaiXe, approveDto);
  }

  // ===== QUẢN LÝ KHÁCH HÀNG (Customers Management) =====

  /**
   * GET /admin/customers
   * Lấy danh sách khách hàng
   */
  @Get('customers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lấy danh sách khách hàng',
    description: 'Bao gồm số lượng xe của mỗi khách hàng',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách khách hàng' })
  async getAllCustomers(@Query() query: GetPaginationQueryDto) {
    return this.adminService.getAllCustomers(query);
  }

  // ===== QUẢN LÝ XE CỘ (Vehicles Management) =====

  /**
   * GET /admin/vehicles
   * Xem toàn bộ xe trong hệ thống
   */
  @Get('vehicles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lấy danh sách toàn bộ xe trong hệ thống',
    description: 'Biết xe nào của ai, biển số, loại xe, etc',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách xe' })
  async getAllVehicles(@Query() query: GetPaginationQueryDto) {
    return this.adminService.getAllVehicles(query);
  }

  /**
   * DELETE /admin/vehicles/:id
   * Admin xóa xe vi phạm hoặc khai báo sai
   */
  @Delete('vehicles/:id')
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

  // ===== KHÁC (Others) =====

  /**
   * GET /admin/complaints
   * Danh sách khiếu nại
   */
  @Get('complaints')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách khiếu nại' })
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

  /**
   * GET /admin/dashboard/metrics
   * Dashboard Metrics
   */
  @Get('dashboard/metrics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dashboard Metrics' })
  @ApiResponse({ status: 200, description: 'Thống kê dashboard' })
  async getDashboardMetrics() {
    return this.adminService.getDashboardMetrics();
  }
}
