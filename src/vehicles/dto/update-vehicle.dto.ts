import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVehicleDto {
  @ApiPropertyOptional({
    example: '29-A-12345',
    description: 'Biển số xe',
  })
  @IsOptional()
  @IsString()
  bienSo?: string;

  @ApiPropertyOptional({
    example: 'Toyota',
    description: 'Hãng xe',
  })
  @IsOptional()
  @IsString()
  hangXe?: string;

  @ApiPropertyOptional({
    example: 'Vios',
    description: 'Dòng xe',
  })
  @IsOptional()
  @IsString()
  dongXe?: string;

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

  @ApiPropertyOptional({
    example: 'LX001',
    description: 'Mã loại xe',
  })
  @IsOptional()
  @IsString()
  maLoaiXe?: string;
}
