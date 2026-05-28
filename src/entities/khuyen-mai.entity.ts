import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';

@Entity({ name: 'khuyen_mai' })
export class KhuyenMai {
  @PrimaryGeneratedColumn('uuid', { name: 'ma_code' })
  maCode!: string;

  @ApiProperty({
    description: 'Discount percentage (0-100)',
    example: 10,
    type: 'number',
  })
  @Column({ name: 'phan_tram_giam', type: 'numeric', precision: 5, scale: 2 })
  phanTramGiam!: string;

  @ApiProperty({
    description: 'Maximum discount amount in currency units',
    example: 50000,
    type: 'string',
  })
  @Column({ name: 'giam_toi_da', type: 'numeric', precision: 12, scale: 2 })
  giamToiDa!: string;

  @ApiProperty({
    description: 'Promotion status (ACTIVE, INACTIVE, EXPIRED)',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'EXPIRED'],
  })
  @Column({
    name: 'trang_thai',
    type: 'varchar',
    length: 20,
    default: 'ACTIVE',
  })
  trangThai!: string;

  @ApiProperty({
    description: 'Start date of promotion',
    example: '2026-05-01',
    type: 'string',
    format: 'date',
    nullable: true,
  })
  @Column({ name: 'ngay_bat_dau', type: 'date', nullable: true })
  ngayBatDau?: Date;

  @ApiProperty({
    description: 'End date of promotion',
    example: '2026-12-31',
    type: 'string',
    format: 'date',
    nullable: true,
  })
  @Column({ name: 'ngay_ket_thuc', type: 'date', nullable: true })
  ngayKetThuc?: Date;

  @ApiProperty({
    description: 'Promotion description',
    example: 'Summer discount for new users',
    nullable: true,
  })
  @Column({ name: 'mo_ta', type: 'text', nullable: true })
  moTa?: string;

  @ApiProperty({
    description: 'Usage limit (null = unlimited)',
    example: 1000,
    nullable: true,
  })
  @Column({ name: 'so_lan_su_dung', type: 'int', nullable: true })
  soLanSuDung?: number;

  @ApiProperty({
    description: 'Times used',
    example: 250,
    default: 0,
  })
  @Column({ name: 'da_su_dung', type: 'int', default: 0 })
  daSuDung!: number;

  @ApiProperty({
    description: 'Minimum trip price required to use this voucher',
    example: 100000,
    nullable: true,
  })
  @Column({
    name: 'gia_toi_thieu',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  giaToiThieu?: string;

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
}
