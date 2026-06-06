import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { KhachHang } from './khach-hang.entity';
import { TaiXe } from './tai-xe.entity';
import { KhieuNai } from './khieu-nai.entity';

@Entity({ name: 'nguoi_dung' })
export class NguoiDung {
  @ApiProperty({
    description: 'User primary identifier (UUID) - auto-generated',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid', { name: 'ma_nguoi_dung' })
  maNguoiDung!: string;

  @ApiProperty({
    description: 'Secondary identifier',
    example: 'ND001',
    nullable: true,
  })
  @Column({
    name: 'ma',
    type: 'varchar',
    length: 50,
    nullable: true,
    unique: true,
  })
  ma?: string;

  @ApiProperty({
    description: 'Full name',
    example: 'Nguyễn Văn A',
  })
  @Column({ name: 'ho_ten', type: 'varchar', length: 255 })
  hoTen!: string;

  @ApiProperty({
    description: 'Phone number',
    example: '0987654321',
  })
  @Column({ name: 'so_dien_thoai', type: 'varchar', length: 20, unique: true })
  soDienThoai!: string;

  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
    nullable: true,
  })
  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  email?: string;

  @Column({ name: 'mat_khau', type: 'varchar', length: 255 })
  matKhau!: string;

  @ApiProperty({
    description: 'User role',
    enum: ['CUSTOMER', 'DRIVER', 'ADMIN'],
    example: 'CUSTOMER',
  })
  @Column({ name: 'vai_tro', type: 'varchar', length: 50 })
  vaiTro!: string;

  @ApiProperty({
    description: 'User status',
    enum: ['ACTIVE', 'BANNED'],
    example: 'ACTIVE',
  })
  @Column({
    name: 'trang_thai',
    type: 'varchar',
    length: 50,
    default: 'ACTIVE',
  })
  trangThai!: string;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  @Column({
    name: 'avatar',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  avatar?: string;

  @Column({
    name: 'mat_khau_reset_token',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  matKhauResetToken?: string;

  @Column({
    name: 'mat_khau_reset_token_expires',
    type: 'timestamptz',
    nullable: true,
  })
  matKhauResetTokenExpires?: Date;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2026-05-24T10:30:00Z',
    type: 'string',
    format: 'date-time',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2026-05-24T15:45:00Z',
    type: 'string',
    format: 'date-time',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Soft delete timestamp (null if active)',
    example: null,
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt?: Date;

  @CreateDateColumn({
    name: 'ngay_tao',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  ngayTao!: Date;

  @ApiHideProperty()
  @OneToOne(() => KhachHang, (kh: KhachHang) => kh.nguoiDung)
  khachHang?: KhachHang;

  @ApiHideProperty()
  @OneToOne(() => TaiXe, (tx: TaiXe) => tx.nguoiDung)
  taiXe?: TaiXe;

  @ApiHideProperty()
  @OneToMany(() => KhieuNai, (k: KhieuNai) => k.nguoiXuLy)
  khieuNaisHandled?: KhieuNai[];
}
