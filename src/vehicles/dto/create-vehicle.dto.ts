import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({
    example: '29-A-12345',
    description: 'Biển số xe (unique)',
  })
  @IsString()
  @IsNotEmpty()
  bienSo!: string;

  @ApiProperty({
    example: 'Toyota',
    description: 'Hãng xe',
  })
  @IsString()
  @IsNotEmpty()
  hangXe!: string;

  @ApiProperty({
    example: 'Vios',
    description: 'Dòng xe',
  })
  @IsString()
  @IsNotEmpty()
  dongXe!: string;

  @ApiPropertyOptional({
    example: 'Đỏ',
    description: 'Màu xe',
  })
  @IsOptional()
  @IsString()
  mauXe?: string;

  @ApiPropertyOptional({
    example: 'VIN123456789',
    description: 'Cấu trúc sang số',
  })
  @IsOptional()
  @IsString()
  cauTrucSangSo?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Vehicle type UUID',
  })
  @IsString()
  @IsNotEmpty()
  maLoaiXe!: string;
}
