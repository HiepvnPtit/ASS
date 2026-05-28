import {
  IsNotEmpty,
  IsString,
  IsDateString,
  Min,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBangGiaDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Vehicle type UUID',
  })
  @IsUUID()
  @IsNotEmpty()
  maLoaiXe!: string;

  @ApiProperty({ example: 'HCM', description: 'Khu vực áp dụng' })
  @IsString()
  @IsNotEmpty()
  khuVuc!: string;

  @ApiProperty({ example: '08:00-18:00', description: 'Khung giờ áp dụng' })
  @IsString()
  @IsNotEmpty()
  khungGio!: string;

  @ApiProperty({ type: Number, example: 25000.0, description: 'Giá cơ bản' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  giaCoBan!: number;

  @ApiProperty({ type: Number, example: 5000.0, description: 'Giá theo km' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  giaTheoKm!: number;

  @ApiProperty({
    example: '2026-01-01',
    description: 'Ngày áp dụng (ISO date)',
  })
  @IsDateString()
  ngayApDung!: string;

  @ApiProperty({
    example: '2026-01-01T00:00:00Z',
    description: 'Hiệu lực từ (ISO date)',
  })
  @IsDateString()
  hieuLucTu!: string;

  @ApiProperty({
    example: '2026-12-31T23:59:59Z',
    description: 'Hiệu lực đến (ISO date)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  hieuLucDen?: string;
}
