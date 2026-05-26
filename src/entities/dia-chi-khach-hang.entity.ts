import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { KhachHang } from './khach-hang.entity';

@Entity({ name: 'dia_chi_khach_hang' })
export class DiaChiKhachHang {
  @PrimaryColumn({ name: 'ma_dia_chi', type: 'varchar', length: 50 })
  maDiaChi!: string;

  @ManyToOne(() => KhachHang, (kh) => kh.diaChis, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ma_khach_hang' })
  khachHang!: KhachHang;

  @Column({ name: 'ten_goi', type: 'varchar', length: 100, nullable: true })
  tenGoi?: string;

  @Column({ name: 'dia_chi', type: 'text' })
  diaChi!: string;

  @Column({ name: 'vi_do', type: 'double precision' })
  viDo!: number;

  @Column({ name: 'kinh_do', type: 'double precision' })
  kinhDo!: number;

  @Column({ name: 'la_dia_chi_mac_dinh', type: 'boolean', default: false })
  laDiaChiMacDinh!: boolean;
}
