import { IsOptional, IsString, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN',
}

export enum UserStatusFilter {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
}

export class GetUsersQueryDto {
  @ApiProperty({
    example: 1,
    description: 'Trang (từ 1 trở lên)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    example: 20,
    description: 'Số lượng kết quả trên trang',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    enum: UserRole,
    example: 'CUSTOMER',
    description: 'Lọc theo vai trò',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  vaiTro?: UserRole;

  @ApiProperty({
    enum: UserStatusFilter,
    example: 'ACTIVE',
    description: 'Lọc theo trạng thái',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatusFilter)
  trangThai?: UserStatusFilter;

  @ApiProperty({
    example: '{"hoTen":"John","email":"john"}',
    description:
      'Tìm kiếm động theo các trường. Có thể truyền JSON string hoặc object. ' +
      'Các trường được phép: hoTen, email, soDienThoai. ' +
      'Ví dụ: ?search={"hoTen":"John"} hoặc ?search=john@example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
