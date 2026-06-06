import { IsString, MinLength, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: '6-digit OTP code sent via email',
    example: '123456',
  })
  @IsString()
  @Length(6, 6, {
    message: 'Mã OTP phải chính xác 6 ký tự',
  })
  otp!: string;

  @ApiProperty({
    description: 'New password (minimum 6 characters)',
    example: 'NewPassword123!',
  })
  @MinLength(6)
  matKhau!: string;
}
