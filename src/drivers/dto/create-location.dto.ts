import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateLocationDto {
  @ApiProperty({
    example: 21.028511,
    description: 'Vĩ độ (Latitude)',
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  viDo!: number;

  @ApiProperty({
    example: 105.804017,
    description: 'Kinh độ (Longitude)',
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  kinhDo!: number;
}
