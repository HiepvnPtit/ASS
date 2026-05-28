import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { ChuyenDi } from './chuyen-di.entity';

@Entity({ name: 'thanh_toan' })
export class ThanhToan {
  @PrimaryGeneratedColumn('uuid', { name: 'ma_thanh_toan' })
  maThanhToan!: string;

  @ApiProperty({
    description: 'Secondary identifier for payment',
    example: 'PT001',
    nullable: true,
    maxLength: 50,
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
  @OneToOne(() => ChuyenDi, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ma_chuyen_di' })
  chuyenDi!: ChuyenDi;

  @ApiProperty({
    description: 'Payment amount in currency units',
    example: '150.00',
  })
  @Column({ name: 'so_tien', type: 'numeric', precision: 12, scale: 2 })
  soTien!: string;

  @ApiProperty({
    description: 'Payment method (CASH, CARD, WALLET, BANK_TRANSFER)',
    example: 'CARD',
    enum: ['CASH', 'CARD', 'WALLET', 'BANK_TRANSFER'],
  })
  @Column({ name: 'phuong_thuc_thanh_toan', type: 'varchar', length: 50 })
  phuongThucThanhToan!: string;

  @ApiProperty({
    description: 'Payment status (PENDING, COMPLETED, FAILED, REFUNDED)',
    example: 'COMPLETED',
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
  })
  @Column({
    name: 'trang_thai_thanh_toan',
    type: 'varchar',
    length: 50,
    default: 'PENDING',
  })
  trangThaiThanhToan!: string;

  @ApiProperty({
    description: 'Payment completion timestamp',
    example: '2026-05-24T11:20:00Z',
    nullable: true,
  })
  @Column({ name: 'thoi_gian_thanh_toan', type: 'timestamptz', nullable: true })
  thoiGianThanhToan?: Date;

  @ApiProperty({
    description: 'External payment gateway transaction ID',
    example: 'TXN20260524001',
    nullable: true,
    maxLength: 100,
  })
  @Column({
    name: 'ma_giao_dich_ngoai',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  maGiaoDichNgoai?: string;

  @ApiProperty({
    description: 'Payment record creation timestamp',
    example: '2026-05-24T11:15:00Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Payment record last update timestamp',
    example: '2026-05-24T11:20:00Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Payment record soft delete timestamp',
    example: null,
    nullable: true,
  })
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt?: Date;
}
