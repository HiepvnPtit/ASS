import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Vehicles (Customer)')
@ApiBearerAuth('JWT')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly service: VehiclesService) {}

  /**
   * Create a new vehicle for the logged-in customer
   */
  @Post()
  @ApiOperation({ summary: 'Thêm xe mới (Khách hàng)' })
  @ApiResponse({
    status: 201,
    description: 'Xe được tạo thành công',
  })
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
  create(@Request() req: any, @Body() dto: CreateVehicleDto) {
    const maKhachHang = req.user.id;
    return this.service.createForCustomer(maKhachHang, dto);
  }

  /**
   * Get all vehicles of the logged-in customer
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách xe của tôi' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách xe',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('CUSTOMER')
  findAll(@Request() req: any) {
    const maKhachHang = req.user.id;
    return this.service.findAllByCustomer(maKhachHang);
  }

  /**
   * Get a specific vehicle by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết xe' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin xe',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('CUSTOMER')
  findOne(@Param('id') maXe: string, @Request() req: any) {
    const maKhachHang = req.user.id;
    return this.service.findOneByCustomer(maXe, maKhachHang);
  }

  /**
   * Update a vehicle
   */
  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật xe' })
  @ApiResponse({
    status: 200,
    description: 'Xe được cập nhật thành công',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('CUSTOMER')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  update(
    @Param('id') maXe: string,
    @Request() req: any,
    @Body() dto: UpdateVehicleDto,
  ) {
    const maKhachHang = req.user.id;
    return this.service.updateByCustomer(maXe, maKhachHang, dto);
  }

  /**
   * Delete a vehicle
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa xe' })
  @ApiResponse({
    status: 200,
    description: 'Xe được xóa thành công',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('CUSTOMER')
  remove(@Param('id') maXe: string, @Request() req: any) {
    const maKhachHang = req.user.id;
    return this.service.removeByCustomer(maXe, maKhachHang);
  }
}
