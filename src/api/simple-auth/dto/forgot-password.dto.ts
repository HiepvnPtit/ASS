import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address to request password reset',
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;
}
