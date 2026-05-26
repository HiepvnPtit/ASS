import {
  IsOptional,
  IsString,
  IsDecimal,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDriverDto {
  @ApiProperty({
    example: 'A123456789',
    description: 'Số giấy phép lái xe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  soGiayPhepLaiXe?: string;

  @ApiProperty({
    example: '123456789012',
    description: 'Căn cước công dân',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(9)
  canCuocCongDan?: string;

  @ApiProperty({
    example: 4.8,
    description: 'Điểm đánh giá (0-5)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '1,2' })
  @Min(0)
  @Max(5)
  diemDanhGia?: number;

  @ApiProperty({
    example: '2030-01-01',
    description: 'Hạn giấy phép lái xe',
    required: false,
  })
  @IsOptional()
  @IsString()
  hanGiayPhepLaiXe?: string;

  @ApiProperty({
    example: 'Lỗi nhập liệu hạn giấy phép',
    description: 'Ghi chú sửa chữa',
    required: false,
  })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}
