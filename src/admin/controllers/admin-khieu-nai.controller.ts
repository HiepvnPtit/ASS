import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { KhieuNaiService } from '../../khieu-nai/khieu-nai.service';
import { UpdateKhieuNaiStatusDto } from '../../khieu-nai/dto/update-khieu-nai-status.dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';

/**
 * Admin Complaints Management Controller
 * Quản lý khiếu nại từ admin
 */
@ApiTags('ADMIN - COMPLAINTS MANAGEMENT')
@ApiBearerAuth('JWT')
@Controller('admin/khieu-nai')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminKhieuNaiController {
  constructor(private readonly service: KhieuNaiService) {}

  /**
   * GET /admin/khieu-nai
   * Get all complaints with filtering and pagination
   */
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách tất cả khiếu nại',
    description:
      'Admin lấy toàn bộ khiếu nại với hỗ trợ filter theo trạng thái, loại người gửi và phân trang',
  })
  @ApiQuery({
    name: 'trangThai',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'loaiNguoiGui',
    required: false,
    description: 'Filter by sender type',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: 'number',
    description: 'Pagination skip',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: 'number',
    description: 'Pagination take',
  })
  @ApiResponse({ status: 200, description: 'List of all complaints' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('trangThai') trangThai?: string,
    @Query('loaiNguoiGui') loaiNguoiGui?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.service.findAllForAdmin({
      trangThai,
      loaiNguoiGui,
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 20,
    });
  }

  /**
   * GET /admin/khieu-nai/stats/overview
   * Get complaint statistics
   */
  @Get('stats/overview')
  @ApiOperation({
    summary: 'Lấy thống kê khiếu nại',
    description: 'Admin lấy tổng quan thống kê khiếu nại theo trạng thái',
  })
  @ApiResponse({ status: 200, description: 'Complaint statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @HttpCode(HttpStatus.OK)
  async getStatistics() {
    return this.service.getStatistics();
  }

  /**
   * PUT /admin/khieu-nai/:id/resolve
   * Resolve a complaint
   */
  @Put(':id/resolve')
  @ApiOperation({
    summary: 'Giải quyết khiếu nại',
    description:
      'Admin xử lý và giải quyết khiếu nại bằng cách cập nhật trạng thái và ghi chú giải quyết',
  })
  @ApiBody({ type: UpdateKhieuNaiStatusDto })
  @ApiResponse({ status: 200, description: 'Complaint resolved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Complaint not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @HttpCode(HttpStatus.OK)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async resolve(
    @Param('id') id: string,
    @Body() dto: UpdateKhieuNaiStatusDto,
    @Request() req: any,
  ) {
    const adminId = req.user.id;
    return this.service.resolve(id, dto, adminId);
  }
}
