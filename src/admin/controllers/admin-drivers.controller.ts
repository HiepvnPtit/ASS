import {
  Controller,
  Get,
  Put,
  Post,
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
import { UpdateDriverDto } from '../dto/update-driver.dto';
import { ApproveDriverDto } from '../dto/approve-driver.dto';
import { GetPaginationQueryDto } from '../dto/get-pagination-query.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Admin Drivers Management Controller
 * Quản lý tất cả tài xế, duyệt hồ sơ, cập nhật thông tin
 */
@ApiTags('ADMIN - DRIVER MANAGEMENT')
@Controller('admin/drivers')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminDriversController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/drivers
   * Lấy danh sách tài xế (join với người dùng)
   */
  @Get()
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
   * GET /admin/drivers/pending
   * Lấy danh sách tài xế chờ duyệt
   */
  @Get('pending')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lấy danh sách tài xế chờ duyệt',
    description: 'Danh sách các tài xế có hồ sơ chưa được duyệt',
  })
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
   * PUT /admin/drivers/:id
   * Admin sửa thông tin bằng lái, CCCD, hạng sao của tài xế
   */
  @Put(':id')
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
   * POST /admin/drivers/:id/approve
   * Duyệt hồ sơ tài xế
   */
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Duyệt hồ sơ tài xế',
    description: 'Chấp nhận hồ sơ của tài xế và kích hoạt tài khoản',
  })
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
}
