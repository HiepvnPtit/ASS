import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBangGiaDto {
  @IsOptional()
  @IsString()
  maLoaiXe?: string; // UUID

  @IsOptional()
  @IsString()
  khuVuc?: string;

  @IsOptional()
  @IsString()
  khungGio?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  giaCoBan?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  giaTheoKm?: number;

  @IsOptional()
  @IsDateString()
  ngayApDung?: string;

  @IsOptional()
  @IsDateString()
  hieuLucTu?: string;

  @IsOptional()
  @IsDateString()
  hieuLucDen?: string;
}
