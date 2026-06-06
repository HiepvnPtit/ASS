import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateKhieuNaiStatusDto {
  @ApiProperty({
    example: 'RESOLVED',
    enum: ['PENDING', 'PROCESSING', 'RESOLVED', 'REJECTED'],
    description: 'New status of the complaint',
  })
  @IsEnum(['PENDING', 'PROCESSING', 'RESOLVED', 'REJECTED'])
  @IsNotEmpty()
  trangThai!: 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'REJECTED';

  @ApiPropertyOptional({
    example: 'Đã xác minh lại lộ trình. Tài xế tuân thủ đầy đủ thỏa thuận.',
    description: 'Resolution result or explanation',
    minLength: 10,
  })
  @IsString()
  @IsOptional()
  @MinLength(10)
  ketQuaXuLy?: string;
}
