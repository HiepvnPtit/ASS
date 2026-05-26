import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { NguoiDung } from './nguoi-dung.entity';
import { Xe } from './xe.entity';
import { DiaChiKhachHang } from './dia-chi-khach-hang.entity';
import { BienBanBanGiaoXe } from './bien-ban-bangiao.entity';
import { ChuyenDi } from './chuyen-di.entity';

@Entity({ name: 'khach_hang' })
export class KhachHang {
  @ApiProperty({
    description: 'Customer primary identifier',
    example: 'KH001',
  })
  @PrimaryColumn({ name: 'ma_khach_hang', type: 'varchar', length: 50 })
  maKhachHang!: string;

  @ApiProperty({
    description: 'Secondary identifier',
    example: 'KH001',
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
    description: 'Default delivery address',
    example: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
    nullable: true,
  })
  @Column({ name: 'dia_chi_mac_dinh', type: 'text', nullable: true })
  diaChiMacDinh?: string;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Deliver at back gate',
    nullable: true,
  })
  @Column({ name: 'ghi_chu', type: 'text', nullable: true })
  ghiChu?: string;

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
  @OneToMany(() => Xe, (xe: Xe) => xe.khachHang)
  xe?: Xe[];

  @ApiHideProperty()
  @OneToMany(() => DiaChiKhachHang, (dc: DiaChiKhachHang) => dc.khachHang)
  diaChis?: DiaChiKhachHang[];

  @ApiHideProperty()
  @OneToMany(() => ChuyenDi, (cd: ChuyenDi) => cd.khachHang)
  chuyenDis?: ChuyenDi[];

  @ApiHideProperty()
  @OneToMany(
    () => BienBanBanGiaoXe,
    (b: BienBanBanGiaoXe) => b.khachHangXacNhan,
  )
  bienBansConfirmed?: BienBanBanGiaoXe[];
}
