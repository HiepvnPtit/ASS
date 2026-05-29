import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class ShareLocationDto {
  @ApiProperty({
    description: 'Trip ID (ma_chuyen_di)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  maChuyenDi!: string;

  @ApiProperty({
    description: 'Latitude (vĩ độ)',
    example: 10.776839,
    type: 'number',
  })
  @IsNumber()
  viDo!: number;

  @ApiProperty({
    description: 'Longitude (kinh độ)',
    example: 106.696055,
    type: 'number',
  })
  @IsNumber()
  kinhDo!: number;

  @ApiProperty({
    description: 'Location event type',
    example: 'REALTIME_SHARE',
    enum: ['REALTIME_SHARE', 'PICKUP_UPDATE', 'ARRIVED'],
    required: false,
  })
  @IsOptional()
  @IsString()
  loaiSuKien?: 'REALTIME_SHARE' | 'PICKUP_UPDATE' | 'ARRIVED';
}
