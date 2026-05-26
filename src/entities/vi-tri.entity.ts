import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ChuyenDi } from './chuyen-di.entity';

@Entity({ name: 'vi_tri' })
export class ViTri {
  @PrimaryColumn({ name: 'ma_vi_tri', type: 'varchar', length: 50 })
  maViTri!: string;

  @ManyToOne(() => ChuyenDi, (cd) => cd.viTris, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ma_chuyen_di' })
  chuyenDi!: ChuyenDi;

  @Column({ name: 'loai_doi_tuong', type: 'varchar', length: 50 })
  loaiDoiTuong!: string;

  @Column({ name: 'vi_do', type: 'double precision' })
  viDo!: number;

  @Column({ name: 'kinh_do', type: 'double precision' })
  kinhDo!: number;

  @CreateDateColumn({
    name: 'thoi_gian_cap_nhat',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  thoiGianCapNhat!: Date;
}
