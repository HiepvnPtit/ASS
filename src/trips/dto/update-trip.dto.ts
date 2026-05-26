import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Update Trip DTO
 *
 * Used for updating existing trip records.
 * All fields are optional (partial update).
 */
export class UpdateTripDto {
  @ApiPropertyOptional({ example: 'CD123', description: 'Mã chuyến đi' })
  @IsOptional()
  @IsString()
  maChuyenDi?: string;

  @ApiPropertyOptional({ example: 'KH123', description: 'Mã khách hàng' })
  @IsOptional()
  @IsString()
  maKhachHang?: string;

  @ApiPropertyOptional({ example: 'LX1', description: 'Mã loại xe' })
  @IsOptional()
  @IsString()
  maLoaiXe?: string;

  @ApiPropertyOptional({
    example: 'TX123',
    description: 'Mã tài xế',
  })
  @IsOptional()
  @IsString()
  maTaiXe?: string;

  @ApiPropertyOptional({ example: 'XE123', description: 'Mã xe' })
  @IsOptional()
  @IsString()
  maXe?: string;

  @ApiPropertyOptional({ example: 'BG1', description: 'Mã bảng giá áp dụng' })
  @IsOptional()
  @IsString()
  maBangGia?: string;

  @ApiPropertyOptional({ example: 'Số 1, Đường A', description: 'Điểm đón' })
  @IsOptional()
  @IsString()
  diemDon?: string;

  @ApiPropertyOptional({ example: 'Số 2, Đường B', description: 'Điểm đến' })
  @IsOptional()
  @IsString()
  diemDen?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 12.5,
    description: 'Quãng đường (km)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quangDuongKm?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 10.7623,
    description: 'Vĩ độ điểm đón',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  viDoDon?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 106.1234,
    description: 'Kinh độ điểm đón',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  kinhDoDon?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 10.7625,
    description: 'Vĩ độ điểm đến',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  viDoDen?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 106.1236,
    description: 'Kinh độ điểm đến',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  kinhDoDen?: number;
}
