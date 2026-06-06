import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
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
import { KhieuNaiService } from './khieu-nai.service';
import { CreateKhieuNaiDto } from './dto/create-khieu-nai.dto';

/**
 * User/Customer Complaints Controller
 * Khách hàng và lái xe có thể gửi khiếu nại về các chuyến đi
 */
@ApiTags('Khiếu nại (Complaints)')
@ApiBearerAuth('JWT')
@Controller('khieu-nai')
export class KhieuNaiController {
  constructor(private readonly service: KhieuNaiService) {}

  /**
   * Create a new complaint (User/Driver)
   */
  @Post()
  @ApiOperation({
    summary: 'Gửi khiếu nại mới',
    description:
      'Khách hàng hoặc lái xe gửi khiếu nại về một chuyến đi. Tự động đặt trạng thái là PENDING.',
  })
  @ApiBody({ type: CreateKhieuNaiDto })
  @ApiResponse({ status: 201, description: 'Khiếu nại được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu nhập không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async create(@Body() dto: CreateKhieuNaiDto, @Request() req: any) {
    const userId = req.user.id;
    return this.service.createComplaint(userId, dto);
  }

  /**
   * Get my complaints (User/Driver)
   */
  @Get('me')
  @ApiOperation({
    summary: 'Lấy khiếu nại của tôi',
    description: 'Lấy tất cả khiếu nại được gửi bởi người dùng hiện tại',
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
  @ApiResponse({
    status: 200,
    description: 'Danh sách khiếu nại của người dùng',
  })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async findMyComplaints(
    @Request() req: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const userId = req.user.id;
    return this.service.findMyComplaints(userId, {
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 20,
    });
  }
}
