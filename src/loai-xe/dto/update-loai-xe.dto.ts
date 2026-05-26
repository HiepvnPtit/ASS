import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Update Loại Xe (Vehicle Type) DTO
 *
 * All fields are optional - only provide fields that need updating.
 * Inherits same validation rules as CreateLoaiXeDto.
 */
export class UpdateLoaiXeDto {
  @ApiProperty({
    example: 4,
    description: 'Số chỗ ngồi (Number of seats)',
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Số chỗ phải lớn hơn 0' })
  soCho?: number;

  @ApiProperty({
    example: 'Tự động',
    description: 'Hộp số (Transmission type)',
    required: false,
  })
  @IsOptional()
  @IsString()
  hopSo?: string;

  @ApiProperty({
    example: 'Xe du lịch',
    description: 'Phân khúc (Vehicle segment/category)',
    required: false,
  })
  @IsOptional()
  @IsString()
  phanKhuc?: string;
}
