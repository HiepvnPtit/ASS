import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDate,
  MaxLength,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateDriverDto {
  @ApiProperty({
    description: 'User UUID (reference to NguoiDung)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  maNguoiDung!: string;

  @ApiProperty({
    description: 'Secondary identifier',
    example: 'TX001',
    nullable: true,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ma?: string;

  @ApiProperty({
    description: 'Driver license number',
    example: 'A123456',
    minLength: 1,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  soGiayPhepLaiXe!: string;

  @ApiProperty({
    description: 'National ID card number',
    example: '123456789012',
    minLength: 1,
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  canCuocCongDan!: string;

  @ApiProperty({
    description: 'License expiration date',
    example: '2027-05-24',
    type: 'string',
    format: 'date',
  })
  @IsNotEmpty()
  @IsDate()
  hanGiayPhepLaiXe!: Date;

  @ApiProperty({
    description: 'Driver rating (0-5)',
    example: '5.00',
    type: 'number',
    nullable: true,
  })
  @IsOptional()
  diemDanhGia?: number | null;
}
