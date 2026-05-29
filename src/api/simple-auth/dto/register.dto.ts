import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsIn,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * RegisterDto - Luồng đăng ký tài khoản
 *
 * Frontend chỉ cần gửi lên:
 * - hoTen, soDienThoai, email (optional), matKhau, vaiTro
 * - Nếu DRIVER: soGiayPhepLaiXe, canCuocCongDan, hanGiayPhepLaiXe (optional)
 *
 * Backend TỰ ĐỘNG sinh:
 * - maNguoiDung (ND-{uuid})
 * - maKhachHang (KH-{uuid}) nếu vaiTro='CUSTOMER'
 * - maTaiXe (TX-{uuid}) nếu vaiTro='DRIVER'
 */
export class RegisterDto {
  @ApiProperty({ example: 'Nguyen Van A', description: 'Họ tên' })
  @IsString()
  @IsNotEmpty()
  hoTen!: string;

  @ApiProperty({ example: '+84901234567', description: 'Số điện thoại' })
  @IsString()
  @IsNotEmpty()
  soDienThoai!: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'P@ssw0rd', description: 'Mật khẩu' })
  @IsString()
  @IsNotEmpty()
  matKhau!: string;

  @ApiProperty({
    example: 'CUSTOMER',
    enum: ['CUSTOMER', 'DRIVER'],
    description: 'Vai trò được phép đăng ký',
  })
  @IsString()
  @IsIn(['CUSTOMER', 'DRIVER'])
  vaiTro!: string;

  // Trường driver-specific (bắt buộc nếu vaiTro='DRIVER')
  @ApiPropertyOptional({ description: 'Số giấy phép lái xe' })
  @IsOptional()
  @IsString()
  soGiayPhepLaiXe?: string;

  @ApiPropertyOptional({ description: 'Căn cước công dân' })
  @IsOptional()
  @IsString()
  canCuocCongDan?: string;

  @ApiPropertyOptional({ description: 'Hạn giấy phép lái xe (ISO date)' })
  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'Han giay phep lai xe phai la dinh dang ngay hop le (VD: 2026-12-31)',
    },
  )
  hanGiayPhepLaiXe?: string; // ISO date
}
