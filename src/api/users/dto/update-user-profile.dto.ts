import {
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    description: 'Full name',
    example: 'Nguyễn Văn A',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  hoTen?: string;

  @ApiPropertyOptional({
    description: 'Phone number (must be unique)',
    example: '0987654321',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  soDienThoai?: string;

  @ApiPropertyOptional({
    description: 'Email address (must be unique)',
    example: 'user@example.com',
    maxLength: 255,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    description: 'New password (minimum 6 characters)',
    example: 'NewPassword123!',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  matKhau?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;
}
