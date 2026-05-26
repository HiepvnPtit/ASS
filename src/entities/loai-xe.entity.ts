import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Xe } from './xe.entity';
import { KiNangTaiXe } from './ki-nang-tai-xe.entity';
import { BangGia } from './bang-gia.entity';

/**
 * LoaiXe Entity - Vehicle Type/Category
 *
 * Represents different vehicle types in the system
 * with audit timestamps for tracking changes.
 *
 * Soft delete support via deletedAt column (NULL = active record)
 */
@Entity({ name: 'loai_xe' })
export class LoaiXe {
  @ApiProperty({
    description: 'Vehicle type primary identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid', { name: 'ma_loai_xe' })
  maLoaiXe!: string;

  @ApiProperty({
    description: 'Secondary identifier for reference',
    example: 'LX001-ALT',
  })
  @Column({
    name: 'ma',
    type: 'varchar',
    length: 50,
    nullable: true,
    unique: true,
  })
  ma?: string;

  @ApiProperty({ example: 5, description: 'Number of seats' })
  @Column({ name: 'so_cho', type: 'int' })
  soCho!: number;

  @ApiProperty({ example: 'Manual', description: 'Transmission type' })
  @Column({ name: 'hop_so', type: 'varchar', length: 50 })
  hopSo!: string;

  @ApiProperty({ example: 'Sedan', description: 'Vehicle segment/class' })
  @Column({ name: 'phan_khuc', type: 'varchar', length: 100 })
  phanKhuc!: string;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2024-01-01T00:00:00Z',
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
    nullable: true,
  })
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt?: Date;

  // Relations (hidden from Swagger to prevent circular dependencies)
  @ApiHideProperty()
  @OneToMany(() => Xe, (xe: Xe) => xe.loaiXe)
  xes?: Xe[];

  @ApiHideProperty()
  @OneToMany(() => KiNangTaiXe, (k: KiNangTaiXe) => k.loaiXe)
  kiNangs?: KiNangTaiXe[];

  @ApiHideProperty()
  @OneToMany(() => BangGia, (bg: BangGia) => bg.loaiXe)
  bangGias?: BangGia[];
}
