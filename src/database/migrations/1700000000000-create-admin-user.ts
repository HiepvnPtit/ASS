import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export class CreateAdminUser1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hash password cho admin account
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Tạo admin user nếu chưa tồn tại
    await queryRunner.query(
      `
      INSERT INTO nguoi_dung (
        ma_nguoi_dung,
        ho_ten,
        so_dien_thoai,
        email,
        mat_khau,
        vai_tro,
        trang_thai,
        ngay_tao
      )
      SELECT 
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM nguoi_dung 
        WHERE vai_tro = $6 AND email = $4
      )
      `,
      [
        'ND_ADMIN_001', // ma_nguoi_dung
        'Admin System', // ho_ten
        '0000000000', // so_dien_thoai
        'admin@app.com', // email
        hashedPassword, // mat_khau (hashed)
        'ADMIN', // vai_tro
        'ACTIVE', // trang_thai
      ],
    );

    console.log('✅ Admin user created successfully!');
    console.log('   Email: admin@app.com');
    console.log('   Password: Admin@123');
    console.log('   Role: ADMIN');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa admin user khi rollback
    await queryRunner.query(`DELETE FROM nguoi_dung WHERE ma_nguoi_dung = $1`, [
      'ND_ADMIN_001',
    ]);
  }
}
