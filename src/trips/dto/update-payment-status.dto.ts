import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, MaxLength } from 'class-validator';

export enum PaymentStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class UpdatePaymentStatusDto {
  @ApiProperty({
    description: 'Payment status',
    example: 'COMPLETED',
    enum: PaymentStatusEnum,
  })
  @IsNotEmpty()
  @IsEnum(PaymentStatusEnum)
  trangThaiThanhToan!: PaymentStatusEnum;

  @ApiProperty({
    description: 'Status update note or reason',
    example: 'Transaction processed successfully',
    nullable: true,
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  ghiChu?: string;
}
