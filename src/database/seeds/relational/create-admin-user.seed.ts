import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { NguoiDung } from '../../../entities/nguoi-dung.entity';

export const createAdminUserSeed = async (dataSource: DataSource) => {
  const logger = new Logger('CreateAdminUserSeed');

  const nguoiDungRepository = dataSource.getRepository(NguoiDung);

  try {
    // Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await nguoiDungRepository.findOne({
      where: { vaiTro: 'ADMIN' },
    });

    if (existingAdmin) {
      logger.log('✅ Admin user đã tồn tại - Bỏ qua');
      return;
    }

    // Tạo mật khẩu hash
    const hashedPassword = await bcrypt.hash('0123456789', 10);

    // Tạo admin user
    const adminUser = new NguoiDung();
    adminUser.maNguoiDung = 'ND_ADMIN_002';
    adminUser.ma = 'ADMIN_002';
    adminUser.hoTen = 'Admin System';
    adminUser.soDienThoai = '0000000000';
    adminUser.email = 'admin';
    adminUser.matKhau = hashedPassword;
    adminUser.vaiTro = 'ADMIN';
    adminUser.trangThai = 'ACTIVE';

    await nguoiDungRepository.save(adminUser);

    logger.log('✅ Admin user đã được tạo thành công');
    logger.log('   - Email: admin@app.com');
    logger.log('   - Password: Admin@123');
    logger.log('   - Role: ADMIN');
  } catch (error) {
    logger.error('❌ Lỗi khi tạo admin user:', error);
    throw error;
  }
};
