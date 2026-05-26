import {
  IsOptional,
  IsString,
  IsPhoneNumber,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Họ tên người dùng',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  hoTen?: string;

  @ApiProperty({
    example: '0901234567',
    description: 'Số điện thoại người dùng',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber('VN')
  soDienThoai?: string;
}
