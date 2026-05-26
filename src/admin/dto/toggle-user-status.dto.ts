import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
}

export class ToggleUserStatusDto {
  @ApiProperty({
    enum: UserStatus,
    example: 'BANNED',
    description: 'Trạng thái người dùng: ACTIVE hoặc BANNED',
  })
  @IsEnum(UserStatus)
  trangThai!: UserStatus;

  @ApiProperty({
    example: 'Vi phạm điều khoản dịch vụ',
    description: 'Lý do thay đổi trạng thái',
    required: false,
  })
  @IsOptional()
  @IsString()
  lyDo?: string;
}
