import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CancelTripDto {
  @ApiPropertyOptional({
    example: 'Khách hàng hủy',
    description: 'Lý do hủy chuyến',
  })
  @IsOptional()
  @IsString()
  lyDoHuy?: string;
}
