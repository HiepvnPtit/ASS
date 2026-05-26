import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TaiXe } from './tai-xe.entity';
import { LoaiXe } from './loai-xe.entity';

@Entity({ name: 'ki_nang_tai_xe' })
export class KiNangTaiXe {
  @PrimaryColumn({ name: 'ma_ki_nang_tai_xe', type: 'varchar', length: 50 })
  maKiNangTaiXe!: string;

  @ManyToOne(() => TaiXe, (tx) => tx.kiNangs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ma_tai_xe' })
  taiXe!: TaiXe;

  @ManyToOne(() => LoaiXe, (l) => l.kiNangs)
  @JoinColumn({ name: 'ma_loai_xe' })
  loaiXe!: LoaiXe;

  @Column({ name: 'so_nam_kinh_nghiem', type: 'int', default: 0 })
  soNamKinhNghiem!: number;

  @Column({
    name: 'loai_bang_lai',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  loaiBangLai?: string;

  @Column({ name: 'ngay_cap', type: 'date', nullable: true })
  ngayCap?: Date;

  @Column({ name: 'ngay_het_han', type: 'date', nullable: true })
  ngayHetHan?: Date;

  @Column({
    name: 'trang_thai',
    type: 'varchar',
    length: 50,
    default: 'ACTIVE',
  })
  trangThai!: string;
}
