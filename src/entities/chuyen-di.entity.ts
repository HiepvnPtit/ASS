import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { KhachHang } from './khach-hang.entity';
import { TaiXe } from './tai-xe.entity';
import { Xe } from './xe.entity';
import { BangGia } from './bang-gia.entity';
import { LichSuTrangThai } from './lich-su-trang-thai.entity';
import { ViTri } from './vi-tri.entity';
import { BienBanBanGiaoXe } from './bien-ban-bangiao.entity';

@Entity({ name: 'chuyen_di' })
export class ChuyenDi {
  @PrimaryColumn({ name: 'ma_chuyen_di', type: 'varchar', length: 50 })
  maChuyenDi!: string;

  @ApiProperty({
    description: 'Secondary identifier for trip',
    example: 'CD001',
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
  @ManyToOne(() => KhachHang, (kh) => kh.chuyenDis)
  @JoinColumn({ name: 'ma_khach_hang' })
  khachHang!: KhachHang;

  @ApiHideProperty()
  @ManyToOne(() => TaiXe, (tx) => tx.chuyenDis, { nullable: true })
  @JoinColumn({ name: 'ma_tai_xe' })
  taiXe?: TaiXe | null;

  @ApiHideProperty()
  @ManyToOne(() => Xe, (x) => x)
  @JoinColumn({ name: 'ma_xe' })
  xe!: Xe;

  @ApiHideProperty()
  @ManyToOne(() => BangGia, (b) => b)
  @JoinColumn({ name: 'ma_bang_gia' })
  bangGia!: BangGia;

  @ApiProperty({
    description: 'Pickup location address',
    example: '123 Nguyen Hue Blvd, District 1',
  })
  @Column({ name: 'diem_don', type: 'text' })
  diemDon!: string;

  @ApiProperty({
    description: 'Destination location address',
    example: '456 Le Loi Blvd, District 1',
  })
  @Column({ name: 'diem_den', type: 'text' })
  diemDen!: string;

  @ApiProperty({
    description: 'Pickup location latitude',
    example: 10.776839,
    nullable: true,
  })
  @Column({ name: 'vi_do_don', type: 'double precision', nullable: true })
  viDoDon?: number;

  @ApiProperty({
    description: 'Pickup location longitude',
    example: 106.696055,
    nullable: true,
  })
  @Column({ name: 'kinh_do_don', type: 'double precision', nullable: true })
  kinhDoDon?: number;

  @ApiProperty({
    description: 'Destination location latitude',
    example: 10.789373,
    nullable: true,
  })
  @Column({ name: 'vi_do_den', type: 'double precision', nullable: true })
  viDoDen?: number;

  @ApiProperty({
    description: 'Destination location longitude',
    example: 106.704833,
    nullable: true,
  })
  @Column({ name: 'kinh_do_den', type: 'double precision', nullable: true })
  kinhDoDen?: number;

  @ApiProperty({
    description: 'Trip booking timestamp',
    example: '2026-05-24T10:30:00Z',
  })
  @CreateDateColumn({
    name: 'thoi_gian_dat',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  thoiGianDat!: Date;

  @ApiProperty({
    description: 'Trip start timestamp',
    example: '2026-05-24T10:45:00Z',
    nullable: true,
  })
  @Column({ name: 'thoi_gian_bat_dau', type: 'timestamptz', nullable: true })
  thoiGianBatDau?: Date;

  @ApiProperty({
    description: 'Trip end timestamp',
    example: '2026-05-24T11:15:00Z',
    nullable: true,
  })
  @Column({ name: 'thoi_gian_ket_thuc', type: 'timestamptz', nullable: true })
  thoiGianKetThuc?: Date;

  @ApiProperty({
    description: 'Trip distance in kilometers',
    example: 12.5,
    nullable: true,
  })
  @Column({ name: 'quang_duong_km', type: 'real', nullable: true })
  quangDuongKm?: number;

  @ApiProperty({
    description: 'Estimated trip price in currency units',
    example: '125.50',
  })
  @Column({ name: 'gia_uoc_tinh', type: 'numeric', precision: 12, scale: 2 })
  giaUocTinh!: string;

  @ApiProperty({
    description: 'Actual trip price paid in currency units',
    example: '130.00',
    nullable: true,
  })
  @Column({
    name: 'gia_thuc_te',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  giaThucTe?: string;

  @ApiProperty({
    description:
      'Trip status (REQUESTED, ACCEPTED, PICKING, DRIVING, COMPLETED, CANCELLED)',
    example: 'COMPLETED',
    enum: [
      'REQUESTED',
      'ACCEPTED',
      'PICKING',
      'DRIVING',
      'COMPLETED',
      'CANCELLED',
    ],
  })
  @Column({ name: 'trang_thai', type: 'varchar', length: 50 })
  trangThai!: string;

  @ApiProperty({
    description: 'Additional notes or remarks',
    example: 'Customer requested to wait 5 minutes',
    nullable: true,
  })
  @Column({ name: 'ghi_chu', type: 'text', nullable: true })
  ghiChu?: string;

  @ApiProperty({
    description: 'Trip last update timestamp',
    example: '2026-05-24T11:15:00Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Trip soft delete timestamp',
    example: null,
    nullable: true,
  })
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt?: Date;

  @ApiHideProperty()
  @OneToMany(() => LichSuTrangThai, (ls: LichSuTrangThai) => ls.chuyenDi)
  lichSuTrangThais?: LichSuTrangThai[];

  @ApiHideProperty()
  @OneToMany(() => ViTri, (vt: ViTri) => vt.chuyenDi)
  viTris?: ViTri[];

  @ApiHideProperty()
  @OneToMany(() => BienBanBanGiaoXe, (b: BienBanBanGiaoXe) => b.chuyenDi)
  bienBans?: BienBanBanGiaoXe[];
}
