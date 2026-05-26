import { Logger } from '@nestjs/common';
import 'dotenv/config';
import 'reflect-metadata';
import * as mongoose from 'mongoose';

const logger = new Logger('DocumentDatabaseSeed');

async function runSeeds() {
  try {
    logger.log('🌱 Bắt đầu seeding MongoDB document...');

    // Khởi tạo MongoDB connection
    const mongoUri =
      process.env.DATABASE_URL ||
      process.env.MONGO_URL ||
      'mongodb://localhost:27017/appdb';

    await mongoose.connect(mongoUri);
    logger.log('✅ MongoDB connection established');

    // Ví dụ: Tạo admin user (nếu dùng Mongoose models)
    logger.log('📝 Seeding document data...');

    // Thêm seed code tại đây
    // const adminUser = await AdminModel.create({...});

    logger.log('✅ Tất cả document seeds đã hoàn tất thành công!');
  } catch (error) {
    logger.error('❌ Lỗi khi seeding MongoDB:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Chạy seeds
runSeeds().catch((error) => {
  logger.error('❌ Lỗi không mong muốn:', error);
  process.exit(1);
});
