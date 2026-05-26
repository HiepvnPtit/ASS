import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Update Review DTO
 *
 * Used for updating existing review records.
 * All fields are optional (partial update).
 */
export class UpdateReviewDto {
  @ApiPropertyOptional({
    example: 4,
    description: 'Số sao đánh giá (1-5)',
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  soSao?: number;

  @ApiPropertyOptional({
    example: 'Tài xế rất chuyên nghiệp và lịch sự',
    description: 'Nội dung đánh giá',
  })
  @IsOptional()
  @IsString()
  noiDung?: string;
}
