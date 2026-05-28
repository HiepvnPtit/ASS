import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ChuyenDi } from './chuyen-di.entity';
import { BienBanBanGiaoXe } from './bien-ban-bangiao.entity';

@Entity({ name: 'anh_chung_thuc' })
export class AnhChungThuc {
  @PrimaryGeneratedColumn('uuid', { name: 'ma_anh' })
  maAnh!: string;

  @ManyToOne(() => ChuyenDi, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ma_chuyen_di' })
  chuyenDi!: ChuyenDi;

  @ManyToOne(() => BienBanBanGiaoXe, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ma_bien_ban' })
  bienBan!: BienBanBanGiaoXe;

  @Column({ name: 'duong_dan', type: 'text' })
  duongDan!: string;

  @Column({ name: 'mo_ta', type: 'text', nullable: true })
  moTa?: string;

  @Column({ name: 'loai_anh', type: 'varchar', length: 50 })
  loaiAnh!: string;

  @CreateDateColumn({
    name: 'thoi_gian_tao',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  thoiGianTao!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
