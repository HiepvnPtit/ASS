import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  MaxLength,
  IsUUID,
} from 'class-validator';

export enum PaymentMethodEnum {
  CASH = 'CASH',
  CARD = 'CARD',
  WALLET = 'WALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Trip UUID to pay for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
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
