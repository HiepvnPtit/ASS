import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HandoverDto {
  @ApiProperty({ example: 'CD123', description: 'Mã chuyến đi' })
  @IsString()
  @IsNotEmpty()
  maChuyenDi!: string;

  @ApiPropertyOptional({ description: 'Tình trạng trước (mô tả)' })
  @IsOptional()
  @IsString()
  tinhTrangTruoc?: string;

  @ApiPropertyOptional({ description: 'Tình trạng sau (mô tả)' })
  @IsOptional()
  @IsString()
  tinhTrangSau?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Mức nhiên liệu trước (lít)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  mucNhienLieuTruoc?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Mức nhiên liệu sau (lít)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  mucNhienLieuSau?: number;

  @ApiPropertyOptional({ type: Number, description: 'Số km trước' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  soKmTruoc?: number;

  @ApiPropertyOptional({ type: Number, description: 'Số km sau' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  soKmSau?: number;

  @ApiProperty({ example: 'KH123', description: 'Mã khách hàng xác nhận' })
  @IsString()
  @IsNotEmpty()
  maKhachHangXacNhan!: string;

  @ApiProperty({ example: 'TX123', description: 'Mã tài xế xác nhận' })
  @IsString()
  @IsNotEmpty()
  maTaiXeXacNhan!: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Danh sách URL hình ảnh chứng thực',
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Ghi chú thêm' })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}
