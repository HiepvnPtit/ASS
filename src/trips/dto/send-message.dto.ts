import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsIn,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for sending a message in trip chat
 * Payload sent by WebSocket client
 */
export class SendMessageDto {
  @ApiProperty({
    description: 'Trip ID',
    example: 'CD-12345',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  maChuyenDi!: string;

  @ApiProperty({
    description: 'Message content',
    example: 'I am on my way',
    maxLength: 5000,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  noiDung!: string;

  @ApiPropertyOptional({
    description: 'Message type',
    enum: ['text', 'image', 'location'],
    example: 'text',
  })
  @IsOptional()
  @IsIn(['text', 'image', 'location'])
  loaiTinNhan?: string;

  @ApiPropertyOptional({
    description: 'Media URL if message contains image/attachment',
    example: 'https://cdn.example.com/image.jpg',
  })
  @IsOptional()
  @IsUrl()
  mediaUrl?: string;
}
