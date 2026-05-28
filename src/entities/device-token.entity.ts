import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { NguoiDung } from './nguoi-dung.entity';

/**
 * DeviceToken Entity
 * Lưu trữ FCM tokens của thiết bị người dùng để gửi push notification
 */
@Entity({ name: 'device_token' })
@Index(['maNguoiDung', 'token'], {
  unique: true,
  where: 'ma_nguoi_dung IS NOT NULL',
})
@Index(['token'])
export class DeviceToken {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @ApiProperty({
    description: 'User ID (foreign key)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  @Column({ name: 'ma_nguoi_dung', type: 'uuid', nullable: true })
  maNguoiDung?: string;

  @ApiProperty({
    description: 'FCM device token',
    example: 'eJxYL0ixUsisSS0p0klIzEkpysxL...',
  })
  @Column({ name: 'token', type: 'text' })
  token!: string;

  @ApiProperty({
    description: 'Device platform type',
    enum: ['ios', 'android', 'web'],
    example: 'android',
    nullable: true,
  })
  @Column({
    name: 'platform',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  platform?: string;

  @ApiProperty({
    description: 'Device name/model',
    example: 'Samsung Galaxy S21',
    nullable: true,
  })
  @Column({
    name: 'device_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  deviceName?: string;

  @ApiProperty({
    description: 'Is this token active',
    example: true,
  })
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Last used timestamp',
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  @Column({
    name: 'last_used_at',
    type: 'timestamptz',
    nullable: true,
  })
  lastUsedAt?: Date;

  @ApiHideProperty()
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @ApiHideProperty()
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @ApiHideProperty()
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt?: Date;

  @ApiHideProperty()
  @ManyToOne(() => NguoiDung, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'ma_nguoi_dung' })
  nguoiDung?: NguoiDung;
}
