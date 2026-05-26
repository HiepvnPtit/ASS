# Database Seeding Guide

## 📋 Mục đích
Seed (hạt giống) dùng để tạo dữ liệu mẫu khi khởi tạo database, giúp:
- ✅ Tạo sẵn tài khoản admin
- ✅ Tạo dữ liệu test
- ✅ Nhanh chóng setup development environment
- ✅ Đảm bảo tất cả dev có cùng dữ liệu ban đầu

---

## 🚀 Cách Sử Dụng

### 1. **Chạy Seed Relational Database (PostgreSQL)**

```bash
npm run seed:run:relational
```

**Output expected:**
```
[DatabaseSeed] 🌱 Bắt đầu seeding database...
[DatabaseSeed] ✅ Database connection established
[CreateAdminUserSeed] ✅ Admin user đã được tạo thành công
   - Email: admin@app.com
   - Password: Admin@123
   - Role: ADMIN
[DatabaseSeed] ✅ Tất cả seeds đã hoàn tất thành công!
```

### 2. **Thứ tự Chạy Lệnh Khi Setup Mới**

```bash
# 1. Tạo database
# (Nếu chưa có, tạo manual hoặc dùng docker-compose)

# 2. Chạy migrations
npm run migration:run

# 3. Chạy seeds để tạo admin user
npm run seed:run:relational

# 4. Khởi động dev server
npm run start:dev
```

---

## 📝 Admin Account Mặc Định

| Thông tin | Giá trị |
|----------|--------|
| **Email** | admin@app.com |
| **Password** | Admin@123 |
| **Role** | ADMIN |
| **Status** | ACTIVE |
| **User ID** | ND_ADMIN_001 |

### ⚠️ Lưu ý Bảo Mật
- **Đổi mật khẩu ngay lập tức** sau khi login lần đầu
- **Không commit** password vào git
- **Dùng environment variable** cho production:
  ```bash
  ADMIN_EMAIL=your-email@company.com
  ADMIN_PASSWORD=your-secure-password
  ```

---

## 🔧 Thêm Seed Mới

### 1. Tạo file seed mới
```typescript
// src/database/seeds/relational/create-users.seed.ts
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { NguoiDung } from '../../entities/nguoi-dung.entity';

export const createUsersSeed = async (dataSource: DataSource) => {
  const logger = new Logger('CreateUsersSeed');
  const repository = dataSource.getRepository(NguoiDung);

  // Tạo dữ liệu
  const users = [
    {
      maNguoiDung: 'ND_001',
      hoTen: 'Tài Xế 1',
      soDienThoai: '0911111111',
      vaiTro: 'DRIVER',
      trangThai: 'ACTIVE',
    },
    // ... thêm users khác
  ];

  for (const user of users) {
    const existing = await repository.findOne({
      where: { maNguoiDung: user.maNguoiDung },
    });
    if (!existing) {
      await repository.save(user);
    }
  }

  logger.log(`✅ Tạo ${users.length} users thành công`);
};
```

### 2. Import vào run-seed.ts
```typescript
import { createUsersSeed } from './create-users.seed';

// Thêm vào runSeeds function:
await createUsersSeed(AppDataSource);
```

### 3. Chạy lại
```bash
npm run seed:run:relational
```

---

## 📊 Cấu Trúc Seed Files

```
src/database/seeds/
├── relational/
│   ├── create-admin-user.seed.ts    # Tạo admin user
│   ├── create-users.seed.ts         # (Optional) Tạo users test
│   ├── create-roles.seed.ts         # (Optional) Tạo roles
│   └── run-seed.ts                  # Main seeder script
├── document/
│   └── run-seed.ts                  # Seeder cho MongoDB (nếu dùng)
└── SEEDING_GUIDE.md                 # Hướng dẫn này
```

---

## ⚡ Troubleshooting

### ❌ Error: "Cannot find module..."
```bash
# Clear node_modules và reinstall
rm -rf node_modules
npm install
npm run seed:run:relational
```

### ❌ Error: "relation does not exist"
```bash
# Chạy migrations trước
npm run migration:run
npm run seed:run:relational
```

### ❌ Error: "Admin user đã tồn tại"
Script sẽ tự bỏ qua nếu admin đã tồn tại. Không báo lỗi.

---

## 🔄 Docker Integration

Khi dùng Docker, chạy seed sau khi container start:

```dockerfile
# Dockerfile
RUN npm install
CMD ["sh", "-c", "npm run migration:run && npm run seed:run:relational && npm run start:dev"]
```

Hoặc trong docker-compose:
```yaml
services:
  api:
    build: .
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/appdb
    depends_on:
      - db
    command: sh -c "npm run migration:run && npm run seed:run:relational && npm run start:dev"
```

---

## 📚 Tham khảo
- [TypeORM Documentation](https://typeorm.io)
- [NestJS Database Documentation](https://docs.nestjs.com/techniques/database)
- [Database Guide](../database.md)
