import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum DriverStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export class UpdateDriverStatusDto {
  @ApiProperty({
    example: 'ONLINE',
    description: 'Trạng thái làm việc của tài xế',
    enum: ['ONLINE', 'OFFLINE'],
  })
  @IsNotEmpty()
  @IsEnum(DriverStatus)
  trangThaiHoatDong!: string;
}
