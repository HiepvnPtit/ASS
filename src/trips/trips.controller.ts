import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { HandoverDto } from './dto/handover.dto';
import { CancelTripDto } from './dto/cancel-trip.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateTripStatusDto } from './dto/update-trip-status.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Trips')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('trips')
export class TripsController {
  constructor(private readonly service: TripsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new trip (booking)',
    description:
      'Customer creates a trip. API automatically handles: maChuyenDi generation, maKhachHang lookup from JWT, vehicle ownership validation, status set to REQUESTED',
  })
  @ApiBody({ type: CreateTripDto })
  @ApiResponse({ status: 201, description: 'Trip created successfully' })
  @ApiResponse({
    status: 403,
    description: 'Vehicle does not belong to customer',
  })
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async createTrip(@Request() request, @Body() dto: CreateTripDto) {
    const saved = await this.service.createTrip(dto as any, request.user);
    return saved;
  }

  @Post('handover')
  @ApiOperation({ summary: 'Submit vehicle handover (requires auth)' })
  @ApiResponse({ status: 200, description: 'Handover recorded' })
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async handover(@Request() request, @Body() dto: HandoverDto) {
    return this.service.vehicleHandover(dto as any, request.user);
  }

  @Get('estimate')
  @ApiOperation({
    summary: 'Estimate price for given vehicle type and distance',
    description:
      'Calculate estimated trip price based on vehicle type, distance, and optional voucher code',
  })
  @ApiQuery({ name: 'ma_loai_xe', required: true })
  @ApiQuery({ name: 'quang_duong_km', required: false })
  @ApiQuery({
    name: 'voucher_code',
    required: false,
    description: 'Optional voucher code to apply discount',
  })
  @ApiResponse({
    status: 200,
    description: 'Price estimate calculated successfully',
    schema: {
      type: 'object',
      properties: {
        giaUocTinh: { type: 'string', example: '125.50' },
        giaCoBan: { type: 'string', example: '20.00' },
        giaTheoKm: { type: 'string', example: '10.50' },
        voucherApplied: { type: 'boolean', example: true },
        soTienGiam: { type: 'string', example: '12.55' },
        giaSauGiam: { type: 'string', example: '112.95' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid parameters or voucher code',
  })
  async estimate(
    @Query('ma_loai_xe') maLoaiXe: string,
    @Query('quang_duong_km') quangDuongKm: string,
    @Query('voucher_code') voucherCode?: string,
  ) {
    const km = Number(quangDuongKm || 0);
    return this.service.estimatePrice(maLoaiXe, km, voucherCode);
  }

  @Get('matching')
  @ApiOperation({ summary: 'Find available drivers for a vehicle type' })
  @ApiQuery({ name: 'ma_loai_xe', required: true })
  @UseGuards(AuthGuard('jwt'))
  async matching(@Query('ma_loai_xe') maLoaiXe: string) {
    return this.service.findAvailableDrivers(maLoaiXe);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Hủy chuyến đi (Khách hàng)' })
  @ApiResponse({
    status: 200,
    description: 'Chuyến đi đã hủy',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('CUSTOMER')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async cancelTrip(
    @Param('id') maChuyenDi: string,
    @Request() req: any,
    @Body() dto: CancelTripDto,
  ) {
    const maKhachHang = req.user.id;
    return this.service.cancelTrip(maChuyenDi, maKhachHang, dto.lyDoHuy);
  }

  @Post(':id/reviews')
  @ApiOperation({ summary: 'Đánh giá chuyến đi (Khách hàng)' })
  @ApiResponse({
    status: 201,
    description: 'Đánh giá chuyến đi thành công',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('CUSTOMER')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async createReview(
    @Param('id') maChuyenDi: string,
    @Request() req: any,
    @Body() dto: CreateReviewDto,
  ) {
    const maKhachHang = req.user.id;
    return this.service.createReview(
      maChuyenDi,
      maKhachHang,
      dto.soSao,
      dto.noiDung,
    );
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Nhận cuốc (Tài xế)' })
  @ApiResponse({
    status: 200,
    description: 'Nhận cuốc thành công',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('DRIVER')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async acceptTrip(@Param('id') maChuyenDi: string, @Request() req: any) {
    const maTaiXe = req.user.id;
    return this.service.acceptTrip(maChuyenDi, maTaiXe);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Cập nhật trạng thái chuyến đi (Tài xế)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật trạng thái thành công',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('DRIVER')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async updateTripStatus(
    @Param('id') maChuyenDi: string,
    @Request() req: any,
    @Body() updateStatusDto: UpdateTripStatusDto,
  ) {
    const maTaiXe = req.user.id;
    return this.service.updateTripStatus(
      maChuyenDi,
      maTaiXe,
      updateStatusDto.trangThai,
    );
  }

  @Post(':id/payments')
  @ApiOperation({
    summary: 'Tạo bản ghi thanh toán cho chuyến đi (Khách hàng)',
  })
  @ApiResponse({
    status: 201,
    description: 'Bản ghi thanh toán được tạo thành công',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('CUSTOMER')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async createPayment(
    @Param('id') maChuyenDi: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.service.createPayment(
      maChuyenDi,
      dto.soTien,
      dto.phuongThucThanhToan,
      dto.maGiaoDichNgoai,
      dto.ma,
    );
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Lấy thông tin thanh toán cho chuyến đi' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin thanh toán',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getPayment(@Param('id') maChuyenDi: string) {
    return this.service.getPaymentByTrip(maChuyenDi);
  }

  @Patch(':id/payments/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái thanh toán' })
  @ApiResponse({
    status: 200,
    description: 'Trạng thái thanh toán đã cập nhật',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async updatePaymentStatus(
    @Query('maThanhToan') maThanhToan: string,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.service.updatePaymentStatus(
      maThanhToan,
      dto.trangThaiThanhToan,
      dto.ghiChu,
    );
  }

  @Get(':id/messages')
  @ApiOperation({
    summary: 'Get chat messages for a trip',
    description: 'Retrieve all messages sent during a trip',
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          maChuyenDi: { type: 'string' },
          nguoiGuiId: { type: 'string' },
          noiDung: { type: 'string' },
          loaiTinNhan: { type: 'string' },
          mediaUrl: { type: 'string', nullable: true },
          thoiGianGui: { type: 'string', format: 'date-time' },
          daDoc: { type: 'boolean' },
        },
      },
    },
  })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async getMessages(@Param('id') maChuyenDi: string) {
    const messages = await this.service.getMessages(maChuyenDi);
    return {
      message: 'Messages retrieved successfully',
      data: messages,
      count: messages.length,
    };
  }

  @Get('me/history')
  @ApiOperation({
    summary:
      'Get trip history for current user (customer or driver with pagination)',
  })
  @ApiQuery({ name: 'page', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 })
  @ApiResponse({ status: 200, description: 'Trip history retrieved' })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async getTripHistory(
    @Request() request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const maNguoiDung = request.user.maNguoiDung || request.user.id;
    const vaiTro = request.user.vaiTro;

    return this.service.getTripHistory(maNguoiDung, vaiTro, pageNum, limitNum);
  }
}
