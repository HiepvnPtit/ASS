import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { KhachHang } from './khach-hang.entity';
import { LoaiXe } from './loai-xe.entity';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';

@Entity({ name: 'xe' })
export class Xe {
  @ApiProperty({
    description: 'Primary identifier (vehicle UUID) - auto-generated',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid', { name: 'ma_xe' })
  maXe!: string;

  @ApiProperty({ description: 'Secondary identifier', example: 'XE001' })
  @Column({ name: 'ma', type: 'varchar', length: 50 })
  ma!: string;

  @ApiHideProperty()
  @ManyToOne(() => KhachHang, (kh) => kh.xe, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ma_khach_hang' })
  khachHang!: KhachHang;

  @ApiHideProperty()
  @ManyToOne(() => LoaiXe, (l: LoaiXe) => l.xes)
  @JoinColumn({ name: 'ma_loai_xe' })
  loaiXe!: LoaiXe;

  @ApiProperty({ example: '51A-12345', description: 'License plate' })
  @Column({ name: 'bien_so', type: 'varchar', length: 20, unique: true })
  bienSo!: string;

  @ApiProperty({ example: 'Toyota', description: 'Vehicle brand' })
  @Column({ name: 'hang_xe', type: 'varchar', length: 100 })
  hangXe!: string;

  @ApiProperty({ example: 'Camry', description: 'Vehicle model' })
  @Column({ name: 'dong_xe', type: 'varchar', length: 100 })
  dongXe!: string;

  @ApiProperty({
    example: 'Black',
    description: 'Vehicle color',
    nullable: true,
  })
  @Column({ name: 'mau_xe', type: 'varchar', length: 50, nullable: true })
  mauXe?: string;

  @ApiProperty({
    example: 'Manual',
    description: 'Transmission type',
    nullable: true,
  })
  @Column({
    name: 'cau_truc_sang_so',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  cauTrucSangSo?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Soft delete timestamp', nullable: true })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
