import {
  Controller,
  Get,
  Put,
  Patch,
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
  ApiResponse,
} from '@nestjs/swagger';
import { AdminService } from '../admin.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ToggleUserStatusDto } from '../dto/toggle-user-status.dto';
import { GetUsersQueryDto } from '../dto/get-users-query.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Admin Users Management Controller
 * Quản lý tất cả người dùng trong hệ thống
 */
@ApiTags('ADMIN - USER MANAGEMENT')
@Controller('admin/users')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminUsersController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/users
   * Lấy danh sách tất cả người dùng với filter, phân trang, tìm kiếm
   */
  @Get()
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
  @Put(':id')
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
    return await this.adminService.updateUser(userId, updateDto);
  }

  /**
   * PATCH /admin/users/:id/toggle-status
   * Khóa/Mở khóa tài khoản (Soft Deactivate)
   */
  @Patch(':id/toggle-status')
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
    return await this.adminService.toggleUserStatus(userId, toggleDto);
  }
}
