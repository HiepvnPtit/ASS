import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({
    description: 'Mã loại xe (UUID)',
    example: 'dbfe0020-6f3b-4e16-aae7-e64ada128872',
  })
  @IsUUID()
  @IsNotEmpty()
  maLoaiXe!: string;

  @ApiPropertyOptional({
    description: 'Số năm kinh nghiệm',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(50)
  soNamKinhNghiem?: number;

  @ApiPropertyOptional({
    description: 'Loại bằng lái (VD: B1, B2, C, D, E)',
    example: 'B2',
  })
  @IsOptional()
  @IsString()
  loaiBangLai?: string;
}
