import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { DeviceToken } from '../../entities/device-token.entity';
import { CreateDeviceTokenDto } from './dto/create-device-token.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Update user profile (PUT /api/users/me)
   * User CAN change: hoTen, soDienThoai, email, matKhau, avatar
   * User CANNOT change: maNguoiDung, ma, vaiTro, trangThai
   */
  @Put('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully (password not returned)',
  })
  @ApiResponse({ status: 400, description: 'Validation failed or conflict' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async updateProfile(
    @Request() request: any,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<any> {
    const maNguoiDung = request.user.maNguoiDung || request.user.id;
    return this.usersService.updateProfile(maNguoiDung, dto);
  }

  /**
   * Lưu FCM token của thiết bị người dùng
   * Sử dụng để gửi push notification đến tất cả thiết bị của user
   */
  @Post('me/device-tokens')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Save FCM device token for push notifications',
  })
  @ApiResponse({
    status: 201,
    description: 'Device token saved successfully',
    type: DeviceToken,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request (user not found, invalid token)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async addDeviceToken(
    @Request() request: any,
    @Body() dto: CreateDeviceTokenDto,
  ): Promise<DeviceToken> {
    const maNguoiDung = request.user.maNguoiDung || request.user.id;
    return this.usersService.addDeviceToken(maNguoiDung, dto);
  }

  /**
   * Lấy danh sách tất cả device tokens của người dùng hiện tại
   */
  @Get('me/device-tokens')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all active device tokens of current user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of device tokens',
    type: [DeviceToken],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDeviceTokens(@Request() request: any): Promise<DeviceToken[]> {
    const maNguoiDung = request.user.maNguoiDung || request.user.id;
    return this.usersService.getDeviceTokens(maNguoiDung);
  }

  /**
   * Xóa một device token cụ thể (khi logout từ một thiết bị)
   */
  @Delete('me/device-tokens/:tokenId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove a specific device token',
  })
  @ApiResponse({
    status: 204,
    description: 'Device token removed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request (token not found or unauthorized)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeDeviceToken(
    @Request() request: any,
    @Param('tokenId') tokenId: string,
  ): Promise<void> {
    const maNguoiDung = request.user.maNguoiDung || request.user.id;
    return this.usersService.removeDeviceToken(maNguoiDung, tokenId);
  }

  /**
   * Xóa tất cả device tokens của người dùng (logout từ tất cả thiết bị)
   */
  @Delete('me/device-tokens')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove all device tokens (logout from all devices)',
  })
  @ApiResponse({
    status: 204,
    description: 'All device tokens removed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeAllDeviceTokens(@Request() request: any): Promise<void> {
    const maNguoiDung = request.user.maNguoiDung || request.user.id;
    return this.usersService.removeAllDeviceTokens(maNguoiDung);
  }
}
