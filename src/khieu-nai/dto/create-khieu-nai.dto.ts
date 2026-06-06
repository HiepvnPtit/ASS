import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsEnum,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKhieuNaiDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Trip UUID (ChuyenDi)',
  })
  @IsUUID()
  @IsNotEmpty()
  maChuyenDi!: string;

  @ApiProperty({
    example: 'Tài xế không chở theo lộ trình đã thỏa thuận',
    description: 'Complaint content',
    minLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  noiDungKhieuNai!: string;

  @ApiProperty({
    example: 'CUSTOMER',
    enum: ['CUSTOMER', 'DRIVER'],
    description: 'Type of person filing the complaint',
  })
  @IsEnum(['CUSTOMER', 'DRIVER'])
  @IsNotEmpty()
  loaiNguoiGui!: 'CUSTOMER' | 'DRIVER';
}
