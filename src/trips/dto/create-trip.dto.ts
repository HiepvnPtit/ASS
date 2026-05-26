import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTripDto {
  @ApiProperty({ example: 'LX1', description: 'Mã loại xe' })
  @IsString()
  @IsNotEmpty()
  maLoaiXe!: string;

  @ApiPropertyOptional({
    example: 'TX123',
    description: 'Mã tài xế (không bắt buộc - khi tạo chưa có tài xế)',
  })
  @IsOptional()
  @IsString()
  maTaiXe?: string;

  @ApiProperty({
    example: 'XE123',
    description: 'Mã xe (bắt buộc - xe của khách)',
  })
  @IsString()
  @IsNotEmpty()
  maXe!: string;

  @ApiProperty({ example: 'BG1', description: 'Mã bảng giá áp dụng' })
  @IsString()
  @IsNotEmpty()
  maBangGia!: string;

  @ApiProperty({ example: 'Số 1, Đường A', description: 'Điểm đón' })
  @IsString()
  @IsNotEmpty()
  diemDon!: string;

  @ApiProperty({ example: 'Số 2, Đường B', description: 'Điểm đến' })
  @IsString()
  @IsNotEmpty()
  diemDen!: string;

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
