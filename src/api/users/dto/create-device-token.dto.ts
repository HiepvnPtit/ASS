import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeviceTokenDto {
  @ApiProperty({
    description: 'FCM device token',
    example: 'eJxYL0ixUsisSS0p0klIzEkpysxL...',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  token!: string;

  @ApiPropertyOptional({
    description: 'Device platform type',
    enum: ['ios', 'android', 'web'],
    example: 'android',
  })
  @IsOptional()
  @IsIn(['ios', 'android', 'web'])
  platform?: string;

  @ApiPropertyOptional({
    description: 'Device name/model',
    example: 'Samsung Galaxy S21',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceName?: string;
}
