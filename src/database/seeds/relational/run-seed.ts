import { Logger } from '@nestjs/common';
import 'dotenv/config';
import 'reflect-metadata';
import AppDataSource from '../../../database/data-source';
import { createAdminUserSeed } from './create-admin-user.seed';

const logger = new Logger('DatabaseSeed');

async function runSeeds() {
  try {
    logger.log('🌱 Bắt đầu seeding database...');

    // Khởi tạo data source
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    logger.log('✅ Database connection established');

    // Chạy seeds
    await createAdminUserSeed(AppDataSource);

    logger.log('✅ Tất cả seeds đã hoàn tất thành công!');
  } catch (error) {
    logger.error('❌ Lỗi khi seeding database:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Chạy seeds
runSeeds().catch((error) => {
  logger.error('❌ Lỗi không mong muốn:', error);
  process.exit(1);
});
