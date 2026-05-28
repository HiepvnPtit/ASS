import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
} from 'typeorm';
import { LoaiXe } from './loai-xe.entity';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';

@Entity({ name: 'bang_gia' })
export class BangGia {
  @ApiProperty({
    description: 'Primary identifier (price table UUID) - auto-generated',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid', { name: 'ma_bang_gia' })
  maBangGia!: string;

  @ApiProperty({ description: 'Secondary identifier', example: 'BG001' })
  @Column({ name: 'ma', type: 'varchar', length: 50 })
  ma!: string;

  @ApiHideProperty()
  @ManyToOne(() => LoaiXe, (l) => l.bangGias)
  @JoinColumn({ name: 'ma_loai_xe' })
  loaiXe!: LoaiXe;

  @ApiProperty({ example: 'Ho Chi Minh', description: 'Area/Region' })
  @Column({ name: 'khu_vuc', type: 'varchar', length: 255 })
  khuVuc!: string;

  @ApiProperty({ example: '08:00-18:00', description: 'Time range' })
  @Column({ name: 'khung_gio', type: 'varchar', length: 100 })
  khungGio!: string;

  @ApiProperty({ type: Number, example: 25000, description: 'Base fare' })
  @Column({ name: 'gia_co_ban', type: 'numeric', precision: 12, scale: 2 })
  giaCoBan!: string;

  @ApiProperty({ type: Number, example: 5000, description: 'Per-km rate' })
  @Column({ name: 'gia_theo_km', type: 'numeric', precision: 12, scale: 2 })
  giaTheoKm!: string;

  @ApiProperty({ example: '2026-01-01', description: 'Application date' })
  @Column({ name: 'ngay_ap_dung', type: 'date' })
  ngayApDung!: Date;

  @ApiProperty({ example: '2026-01-01', description: 'Effective from date' })
  @Column({ name: 'hieu_luc_tu', type: 'date' })
  hieuLucTu!: Date;

  @ApiProperty({
    example: null,
    description: 'Effective until date',
    nullable: true,
  })
  @Column({ name: 'hieu_luc_den', type: 'date', nullable: true })
  hieuLucDen?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Soft delete timestamp', nullable: true })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  /**
   * TypeORM lifecycle hook - Auto-generate ma field before insert
   * Ensures the ma column is never null
   */
  @BeforeInsert()
  generateMaBangGia() {
    if (!this.ma) {
      // Auto-generate: BG-{timestamp} to ensure uniqueness
      this.ma = `BG-${Date.now()}`;
    }
  }
}
