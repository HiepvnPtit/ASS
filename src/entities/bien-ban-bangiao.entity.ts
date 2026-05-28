import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ChuyenDi } from './chuyen-di.entity';
import { KhachHang } from './khach-hang.entity';
import { TaiXe } from './tai-xe.entity';

@Entity({ name: 'bien_ban_ban_giao_xe' })
export class BienBanBanGiaoXe {
  @PrimaryGeneratedColumn('uuid', { name: 'ma_bien_ban' })
  maBienBan!: string;

  @ManyToOne(() => ChuyenDi, (cd) => cd.bienBans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ma_chuyen_di' })
  chuyenDi!: ChuyenDi;

  @Column({
    name: 'tinh_trang_truoc_khi_ban_giao',
    type: 'text',
    nullable: true,
  })
  tinhTrangTruoc?: string;

  @Column({
    name: 'tinh_trang_sau_khi_ban_giao',
    type: 'text',
    nullable: true,
  })
  tinhTrangSau?: string;

  @Column({ name: 'muc_nhien_lieu_truoc', type: 'real', nullable: true })
  mucNhienLieuTruoc?: number;

  @Column({ name: 'muc_nhien_lieu_sau', type: 'real', nullable: true })
  mucNhienLieuSau?: number;

  @Column({ name: 'so_km_truoc', type: 'real', nullable: true })
  soKmTruoc?: number;

  @Column({ name: 'so_km_sau', type: 'real', nullable: true })
  soKmSau?: number;

  @CreateDateColumn({
    name: 'thoi_gian_tao',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  thoiGianTao!: Date;

  @Column({ name: 'ghi_chu', type: 'text', nullable: true })
  ghiChu?: string;

  @ManyToOne(() => KhachHang, (kh) => kh.bienBansConfirmed)
  @JoinColumn({ name: 'ma_khach_hang_xac_nhan' })
  khachHangXacNhan!: KhachHang;

  @ManyToOne(() => TaiXe, (tx) => tx.bienBansConfirmed)
  @JoinColumn({ name: 'ma_tai_xe_xac_nhan' })
  taiXeXacNhan!: TaiXe;
}
