import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTripDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Vehicle type UUID',
  })
  @IsUUID()
  @IsNotEmpty()
  maLoaiXe!: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description:
      'Driver UUID (optional - when creating, driver may not be assigned yet)',
  })
  @IsOptional()
  @IsUUID()
  maTaiXe?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description: 'Vehicle UUID',
  })
  @IsUUID()
  @IsNotEmpty()
  maXe!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440003',
    description: 'Price table UUID',
  })
  @IsUUID()
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
