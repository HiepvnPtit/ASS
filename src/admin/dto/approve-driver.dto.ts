import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveDriverDto {
  @ApiPropertyOptional({
    example: 'Hồ sơ đã được xác minh đầy đủ',
    description: 'Ghi chú phê duyệt (tùy chọn)',
  })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}
