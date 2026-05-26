import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { UpdateDriverStatusDto } from './dto/update-driver-status.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TaiXe } from '../entities/tai-xe.entity';
import { ViTri } from '../entities/vi-tri.entity';

@ApiTags('Drivers - Self-Service')
@Controller('drivers')
@ApiBearerAuth('JWT')
export class DriversController {
  // System discount percentage for earnings calculation
  private readonly SYSTEM_COMMISSION_RATE = 0.2; // 20%

  constructor(private readonly driversService: DriversService) {}

  /**
   * GET /drivers/me
   * Get current driver's profile
   */
  @Get('me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('DRIVER')
  @ApiOperation({
    summary: 'Get driver profile',
    description:
      'Retrieve the current authenticated driver profile with license and rating information',
  })
  @ApiResponse({
    status: 200,
    description: 'Driver profile retrieved successfully',
    type: TaiXe,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Driver not found',
  })
  async getProfile(@Req() req: any) {
    const maTaiXe = req.user.id;
    return this.driversService.getProfile(maTaiXe);
  }

  /**
   * PATCH /drivers/me/status
   * Update driver availability status (ONLINE/OFFLINE)
   */
  @Patch('me/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('DRIVER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update driver status',
    description: 'Toggle driver availability status between ONLINE and OFFLINE',
  })
  @ApiBody({
    type: UpdateDriverStatusDto,
    description: 'Status update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Driver status updated successfully',
    schema: {
      example: {
        message: 'Cập nhật trạng thái thành ONLINE thành công',
        trangThaiHoatDong: 'ONLINE',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Driver not found',
  })
  async updateStatus(
    @Req() req: any,
    @Body() updateStatusDto: UpdateDriverStatusDto,
  ) {
    const maTaiXe = req.user.id;
    return this.driversService.updateStatus(maTaiXe, updateStatusDto);
  }

  /**
   * POST /drivers/me/locations
   * Update current GPS location for real-time tracking
   */
  @Post('me/locations')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('DRIVER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Update driver location',
    description:
      'Record current GPS coordinates for real-time driver tracking during active trips',
  })
  @ApiBody({
    type: CreateLocationDto,
    description: 'GPS location data',
  })
  @ApiResponse({
    status: 201,
    description: 'Location updated successfully',
    type: ViTri,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Driver not found',
  })
  async updateLocation(
    @Req() req: any,
    @Body() createLocationDto: CreateLocationDto,
  ) {
    const maNguoiDung = req.user.id; // User ID from JWT token
    return this.driversService.updateLocation(maNguoiDung, createLocationDto);
  }

  /**
   * GET /drivers/me/wallet
   * Get driver's current wallet balance
   */
  @Get('me/wallet')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('DRIVER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get driver wallet balance',
    description:
      'Retrieve the current wallet balance of the authenticated driver',
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet balance retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        maTaiXe: { type: 'string', example: 'TX-001' },
        soVi: { type: 'string', example: '1250.50' },
        currencyUnit: { type: 'string', example: 'VND' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Driver not found',
  })
  async getWallet(@Req() req: any) {
    const maTaiXe = req.user.id;
    return this.driversService.getWallet(maTaiXe);
  }

  /**
   * GET /drivers/me/earnings
   * Get driver's earnings within a specified timeframe
   * Query params: ?timeframe=today|week|month
   */
  @Get('me/earnings')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('DRIVER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get driver earnings',
    description:
      'Calculate driver earnings for completed trips within the specified timeframe (today, week, month)',
  })
  @ApiResponse({
    status: 200,
    description: 'Earnings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        timeframe: { type: 'string', example: 'today' },
        totalTrips: { type: 'number', example: 5 },
        grossEarnings: { type: 'string', example: '625.00' },
        systemCommission: { type: 'string', example: '125.00' },
        netEarnings: { type: 'string', example: '500.00' },
        commissionRate: { type: 'string', example: '20%' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid timeframe parameter',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Driver not found',
  })
  async getEarnings(
    @Req() req: any,
    @Query('timeframe') timeframe: string = 'today',
  ) {
    const maTaiXe = req.user.id;
    return this.driversService.getEarnings(
      maTaiXe,
      timeframe,
      this.SYSTEM_COMMISSION_RATE,
    );
  }
}
