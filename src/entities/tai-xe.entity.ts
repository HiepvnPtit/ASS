import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { NguoiDung } from './nguoi-dung.entity';
import { KiNangTaiXe } from './ki-nang-tai-xe.entity';
import { ChuyenDi } from './chuyen-di.entity';
import { BienBanBanGiaoXe } from './bien-ban-bangiao.entity';

@Entity({ name: 'tai_xe' })
export class TaiXe {
  @ApiProperty({
    description: 'Driver primary identifier (UUID) - auto-generated',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid', { name: 'ma_tai_xe' })
  maTaiXe!: string;

  @ApiProperty({
    description: 'Secondary identifier',
    example: 'TX001',
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

  @ApiHideProperty()
  @OneToOne(() => NguoiDung, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ma_nguoi_dung' })
  nguoiDung!: NguoiDung;

  @ApiProperty({
    description: 'Driver license number',
    example: 'A123456',
  })
  @Column({
    name: 'so_giay_phep_lai_xe',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  soGiayPhepLaiXe!: string;

  @ApiProperty({
    description: 'National ID number',
    example: '123456789012',
  })
  @Column({
    name: 'can_cuoc_cong_dan',
    type: 'varchar',
    length: 20,
    unique: true,
  })
  canCuocCongDan!: string;

  @ApiProperty({
    description: 'Driver rating (0-5)',
    example: '4.75',
    type: 'number',
  })
  @Column({
    name: 'diem_danh_gia',
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: '5.00',
  })
  diemDanhGia!: string;

  @ApiProperty({
    description: 'Driver activity status',
    enum: ['ONLINE', 'OFFLINE'],
    example: 'OFFLINE',
  })
  @Column({
    name: 'trang_thai_hoat_dong',
    type: 'varchar',
    length: 50,
    default: 'OFFLINE',
  })
  trangThaiHoatDong!: string;

  @ApiProperty({
    description: 'Driver verification status',
    enum: ['PENDING', 'VERIFIED'],
    example: 'PENDING',
  })
  @Column({
    name: 'trang_thai_xac_thuc',
    type: 'varchar',
    length: 50,
    default: 'PENDING',
  })
  trangThaiXacThuc!: string;

  @ApiProperty({
    description: 'License expiration date',
    example: '2027-05-24',
    type: 'string',
    format: 'date',
  })
  @Column({ name: 'han_giay_phep_lai_xe', type: 'date' })
  hanGiayPhepLaiXe!: Date;

  @ApiProperty({
    description: 'Driver wallet balance (in currency units)',
    example: '1250.50',
    type: 'string',
    default: '0',
  })
  @Column({
    name: 'so_vi',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: '0',
  })
  soVi!: string;

  @ApiProperty({
    description: 'Current driver latitude (real-time GPS location)',
    example: 21.028511,
    type: 'number',
    nullable: true,
  })
  @Column({
    name: 'vi_do_hien_tai',
    type: 'double precision',
    nullable: true,
    comment: 'Driver current latitude for real-time tracking',
  })
  viDoHienTai?: number;

  @ApiProperty({
    description: 'Current driver longitude (real-time GPS location)',
    example: 105.804017,
    type: 'number',
    nullable: true,
  })
  @Column({
    name: 'kinh_do_hien_tai',
    type: 'double precision',
    nullable: true,
    comment: 'Driver current longitude for real-time tracking',
  })
  kinhDoHienTai?: number;

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

  @ApiHideProperty()
  @OneToMany(() => KiNangTaiXe, (kn: KiNangTaiXe) => kn.taiXe)
  kiNangs?: KiNangTaiXe[];

  @ApiHideProperty()
  @OneToMany(() => ChuyenDi, (cd: ChuyenDi) => cd.taiXe)
  chuyenDis?: ChuyenDi[];

  @ApiHideProperty()
  @OneToMany(() => BienBanBanGiaoXe, (b: BienBanBanGiaoXe) => b.taiXeXacNhan)
  bienBansConfirmed?: BienBanBanGiaoXe[];
}
