import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDate, MaxLength } from 'class-validator';

export class CreateDriverDto {
  @ApiProperty({
    description: 'Driver primary identifier',
    example: 'TX001',
    minLength: 1,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  maTaiXe!: string;

  @ApiProperty({
    description: 'Secondary identifier',
    example: 'TX001',
    nullable: true,
    minLength: 1,
    maxLength: 50,
  })
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
}
