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

@Entity({ name: 'vi_tri' })
export class ViTri {
  @PrimaryGeneratedColumn('uuid', { name: 'ma_vi_tri' })
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

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
