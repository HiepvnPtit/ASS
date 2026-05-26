import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ChuyenDi } from './chuyen-di.entity';

@Entity({ name: 'lich_su_trang_thai' })
export class LichSuTrangThai {
  @PrimaryColumn({ name: 'ma_lich_su', type: 'varchar', length: 50 })
  maLichSu!: string;

  @ManyToOne(() => ChuyenDi, (cd) => cd.lichSuTrangThais, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ma_chuyen_di' })
  chuyenDi!: ChuyenDi;

  @Column({
    name: 'trang_thai_cu',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  trangThaiCu?: string;

  @Column({ name: 'trang_thai_moi', type: 'varchar', length: 50 })
  trangThaiMoi!: string;

  @CreateDateColumn({
    name: 'thoi_gian_cap_nhat',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  thoiGianCapNhat!: Date;

  @Column({ name: 'nguoi_cap_nhat', type: 'varchar', length: 50 })
  nguoiCapNhat!: string;
}
