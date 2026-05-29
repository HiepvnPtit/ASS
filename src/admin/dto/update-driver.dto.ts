import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDriverDto {
  @ApiProperty({
    example: 'A123456789',
    description: 'So giay phep lai xe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  soGiayPhepLaiXe?: string;

  @ApiProperty({
    example: '123456789012',
    description: 'Can cuoc cong dan',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(9)
  canCuocCongDan?: string;

  @ApiProperty({
    example: '2030-01-01',
    description: 'Han giay phep lai xe',
    required: false,
  })
  @IsOptional()
  @IsString()
  hanGiayPhepLaiXe?: string;

  @ApiProperty({
    example: 'Loi nhap lieu han giay phep',
    description: 'Ghi chu sua chua',
    required: false,
  })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}
