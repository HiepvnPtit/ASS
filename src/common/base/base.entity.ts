import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Base Entity Class - Provides common fields for all entities
 *
 * Includes:
 * - UUID primary key (auto-generated)
 * - createdAt: Automatically set when record is created
 * - updatedAt: Automatically set when record is updated
 * - deletedAt: For soft deletes (NULL = not deleted)
 * - ma: Secondary identifier (e.g., CD001, TX009)
 *
 * Usage: export class MyEntity extends BaseEntity { ... }
 */
export abstract class BaseEntity {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'Secondary identifier (e.g., CD001, TX009)',
    example: 'CD001',
    type: 'string',
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
    description: 'Creation timestamp',
    example: '2026-05-24T10:30:00Z',
    type: Date,
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-05-24T15:45:30Z',
    type: Date,
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Soft delete timestamp (NULL if not deleted)',
    example: null,
    type: Date,
    nullable: true,
  })
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt?: Date;
}
