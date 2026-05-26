import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';

export enum PaymentMethodEnum {
  CASH = 'CASH',
  CARD = 'CARD',
  WALLET = 'WALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Trip ID to pay for',
    example: 'CD001',
    minLength: 1,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  maChuyenDi!: string;

  @ApiProperty({
    description: 'Payment amount in currency units',
    example: '150.00',
  })
  @IsNotEmpty()
  @IsNumber()
  soTien!: number;

  @ApiProperty({
    description: 'Payment method',
    example: 'CARD',
    enum: PaymentMethodEnum,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethodEnum)
  phuongThucThanhToan!: PaymentMethodEnum;

  @ApiProperty({
    description: 'External payment gateway transaction ID',
    example: 'TXN20260524001',
    nullable: true,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  maGiaoDichNgoai?: string;

  @ApiProperty({
    description: 'Secondary payment identifier',
    example: 'PT001',
    nullable: true,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ma?: string;
}
