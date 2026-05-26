import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for self-service user profile updates
 * Users can update their own profile via PATCH /users/me
 */
export class UpdateProfileDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'Nguyễn Văn A',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Tên phải ít nhất 2 ký tự' })
  @MaxLength(255, { message: 'Tên tối đa 255 ký tự' })
  hoTen?: string;

  @ApiProperty({
    description: 'Phone number (must be unique)',
    example: '0912345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^0\d{9}$/, {
    message: 'Số điện thoại phải là 10 chữ số bắt đầu với 0',
  })
  soDienThoai?: string;

  @ApiProperty({
    description: 'Email address (must be unique)',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiProperty({
    description: 'New password (will be hashed before storing)',
    example: 'newPassword123',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải ít nhất 6 ký tự' })
  @MaxLength(255, { message: 'Mật khẩu tối đa 255 ký tự' })
  matKhau?: string;

  @ApiProperty({
    description: 'Avatar URL or base64 encoded image',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;
}
