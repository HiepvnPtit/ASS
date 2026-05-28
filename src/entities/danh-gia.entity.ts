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

@Entity({ name: 'danh_gia' })
export class DanhGia {
  @PrimaryGeneratedColumn('uuid', { name: 'ma_danh_gia' })
  maDanhGia!: string;

  @ApiProperty({
    description: 'Secondary identifier for review',
    example: 'DG001',
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
    description: 'Review rating from 1 to 5 stars',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @Column({ name: 'so_sao', type: 'int' })
  soSao!: number;

  @ApiProperty({
    description: 'Review comments or feedback',
    example: 'Great driver, smooth ride!',
    nullable: true,
  })
  @Column({ name: 'noi_dung', type: 'text', nullable: true })
  noiDung?: string;

  @ApiProperty({
    description: 'Review submission timestamp',
    example: '2026-05-24T11:30:00Z',
  })
  @CreateDateColumn({
    name: 'thoi_gian_danh_gia',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  thoiGianDanhGia!: Date;

  @ApiProperty({
    description: 'Review last update timestamp',
    example: '2026-05-24T11:30:00Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Review soft delete timestamp',
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
