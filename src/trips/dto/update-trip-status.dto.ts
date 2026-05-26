import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum TripStatus {
  ARRIVED = 'ARRIVED',
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
}

export class UpdateTripStatusDto {
  @ApiProperty({
    example: 'ARRIVED',
    description: 'Trạng thái chuyến đi',
    enum: ['ARRIVED', 'STARTED', 'COMPLETED'],
  })
  @IsNotEmpty()
  @IsEnum(TripStatus)
  trangThai!: string;
}
