import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ChuyenDi } from './chuyen-di.entity';
import { NguoiDung } from './nguoi-dung.entity';

@Entity({ name: 'khieu_nai' })
export class KhieuNai {
  @PrimaryGeneratedColumn('uuid', { name: 'ma_khieu_nai' })
  maKhieuNai!: string;

  @Column({ name: 'ma_chuyen_di', type: 'uuid' })
  maChuyenDi!: string;

  @ManyToOne(() => ChuyenDi, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ma_chuyen_di' })
  chuyenDi!: ChuyenDi;

  @Column({ name: 'ma_nguoi_gui', type: 'uuid' })
  maNguoiGui!: string;

  @ManyToOne(() => NguoiDung)
  @JoinColumn({ name: 'ma_nguoi_gui' })
  nguoiGui!: NguoiDung;

  @Column({ name: 'ma_nguoi_xu_ly', type: 'uuid', nullable: true })
  maNguoiXuLy?: string;

  @ManyToOne(() => NguoiDung, { nullable: true })
  @JoinColumn({ name: 'ma_nguoi_xu_ly' })
  nguoiXuLy?: NguoiDung;

  @Column({
    name: 'trang_thai',
    type: 'varchar',
    length: 50,
    default: 'PENDING',
  })
  trangThai!: string;

  @Column({ name: 'noi_dung_khieu_nai', type: 'text' })
  noiDungKhieuNai!: string;

  @Column({ name: 'loai_nguoi_gui', type: 'varchar', length: 50 })
  loaiNguoiGui!: string;

  @Column({ name: 'ket_qua_xu_ly', type: 'text', nullable: true })
  ketQuaXuLy?: string;

  @CreateDateColumn({
    name: 'thoi_gian_tao',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  thoiGianTao!: Date;

  @Column({ name: 'thoi_gian_lu_choi', type: 'timestamptz', nullable: true })
  thoiGianLuChoi?: Date;

  @Column({ name: 'thoi_gian_xu_ly', type: 'timestamptz', nullable: true })
  thoiGianXuLy?: Date;
}
