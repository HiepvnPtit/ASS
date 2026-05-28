import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { ChuyenDi } from './chuyen-di.entity';
import { NguoiDung } from './nguoi-dung.entity';

/**
 * TinNhan Entity - Messages in trip chat
 * Stores real-time chat messages between customer and driver during a trip
 */
@Entity({ name: 'tin_nhan' })
@Index(['maChuyenDi', 'thoiGianGui'])
@Index(['maChuyenDi', 'createdAt'])
export class TinNhan {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @ApiProperty({
    description: 'Trip ID (foreign key)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'ma_chuyen_di', type: 'uuid' })
  maChuyenDi!: string;

  @ApiProperty({
    description: 'Message sender ID (NguoiDung)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'nguoi_gui_id', type: 'uuid' })
  nguoiGuiId!: string;

  @ApiProperty({
    description: 'Message content',
    example: 'I am on my way, 5 minutes away',
  })
  @Column({ name: 'noi_dung', type: 'text' })
  noiDung!: string;

  @ApiProperty({
    description: 'Message sent timestamp',
    type: 'string',
    format: 'date-time',
    example: '2026-05-25T12:30:00Z',
  })
  @Column({ name: 'thoi_gian_gui', type: 'timestamptz' })
  thoiGianGui!: Date;

  @ApiProperty({
    description: 'Is message read by recipient',
    example: true,
  })
  @Column({ name: 'da_doc', type: 'boolean', default: false })
  daDoc!: boolean;

  @ApiProperty({
    description: 'Message type (text, image, etc)',
    enum: ['text', 'image', 'location'],
    example: 'text',
  })
  @Column({
    name: 'loai_tin_nhan',
    type: 'varchar',
    length: 20,
    default: 'text',
  })
  loaiTinNhan!: string;

  @ApiProperty({
    description: 'Media URL if message contains image/attachment',
    nullable: true,
    example: 'https://cdn.example.com/image.jpg',
  })
  @Column({
    name: 'media_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  mediaUrl?: string;

  @ApiHideProperty()
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @ApiHideProperty()
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt?: Date;

  @ApiHideProperty()
  @ManyToOne(() => ChuyenDi, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ma_chuyen_di' })
  chuyenDi!: ChuyenDi;

  @ApiHideProperty()
  @ManyToOne(() => NguoiDung, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'nguoi_gui_id' })
  nguoiGui!: NguoiDung;
}
