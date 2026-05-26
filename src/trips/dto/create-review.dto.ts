import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty({
    example: 5,
    description: 'Số sao đánh giá (1-5)',
    minimum: 1,
    maximum: 5,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  soSao!: number;

  @ApiPropertyOptional({
    example: 'Tài xế rất chuyên nghiệp và lịch sự',
    description: 'Nội dung đánh giá',
  })
  @IsOptional()
  @IsString()
  noiDung?: string;
}
