# Setup Admin Account - Hướng Dẫn

## 🎯 Mục Đích

Tạo sẵn 1 tài khoản ADMIN khi khởi tạo database, giúp:

- ✅ Nhanh chóng truy cập admin panel
- ✅ Không cần tạo thủ công
- ✅ Đảm bảo mọi dev có cùng credential
- ✅ Setup production database dễ dàng

---

## 📋 Quick Start

### 1. Khởi tạo Database (lần đầu)

```bash
# Option A: Dùng docker-compose
docker-compose up -d

# Option B: PostgreSQL đã chạy sẵn
# Đảm bảo DB connection tại .env hoặc env-example-relational
```

### 2. Chạy Migrations

```bash
npm run migration:run
```

**Output:**

```text
✅ Database migrations applied successfully
```

### 3. Chạy Seed - Tạo Admin User

```bash
npm run seed:run:relational
```

**Output:**

```text
✅ Admin user đã được tạo thành công
   - Email: admin@app.com
   - Password: Admin@123
   - Role: ADMIN
```

### 4. Khởi động Dev Server

```bash
npm run start:dev
```

**Server chạy tại:** `http://localhost:3000`

---

## 👤 Admin Account Details

| Field        | Value             |
| ------------ | ----------------- |
| **Email**    | `admin@app.com`   |
| **Password** | `Admin@123`       |
| **User ID**  | `ND_ADMIN_001`    |
| **Role**     | `ADMIN`           |
| **Status**   | `ACTIVE`          |

---

## 🔐 Bảo Mật - Thay Đổi Mật Khẩu

### Ngay lập tức sau khi login

```bash
# 1. Login vào API
POST /auth/login
Content-Type: application/json

{
  "email": "admin@app.com",
  "password": "Admin@123"
}

# Response sẽ có access_token
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "..."
}
```

### 2. Thay đổi mật khẩu

```bash
PATCH /profile/password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "Admin@123",
  "newPassword": "YourSecurePassword@123"
}
```

### Hoặc dùng Environment Variable

```bash
# .env hoặc .env.local
ADMIN_EMAIL=your-admin@company.com
ADMIN_PASSWORD=your-super-secure-password@123
```

---

## 📊 Verify Admin User

### Cách 1: Query từ Database

```sql
-- PostgreSQL
SELECT * FROM nguoi_dung WHERE vai_tro = 'ADMIN';

-- Output:
-- | ma_nguoi_dung  | ho_ten       | email              | vai_tro |
-- | ND_ADMIN_001   | Admin System | admin@app.com      | ADMIN   |
```

### Cách 2: Call API

```bash
# Login để lấy token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@app.com",
    "password": "Admin@123"
  }'

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "maNguoiDung": "ND_ADMIN_001",
    "hoTen": "Admin System",
    "email": "admin@app.com",
    "vaiTro": "ADMIN"
  }
}

# Sử dụng token để truy cập protected endpoints
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer <token>"
```

---

## 🔄 Chạy Lại Seeding

### Xóa Admin Cũ và Tạo Mới

```bash
# 1. Xóa tài khoản admin từ database (optional)
npm run migration:revert      # Rollback tất cả migrations
npm run schema:drop           # Xóa toàn bộ schema

# 2. Chạy lại từ đầu
npm run migration:run
npm run seed:run:relational
```

### Hoặc Chỉ Drop Admin User

```sql
-- PostgreSQL
DELETE FROM nguoi_dung WHERE vai_tro = 'ADMIN';

-- Rồi chạy lại seed
npm run seed:run:relational
```

---

## 🐳 Docker Setup

### Tự động Seed khi Container Start

**Dockerfile:**

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Chạy migrations + seeds trước khi start server
CMD ["sh", "-c", "npm run migration:run && npm run seed:run:relational && npm run start:prod"]

```

**docker-compose.yaml:**

```yaml
services:
  api:
    build: .
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASS=postgres
      - DB_NAME=appdb
    depends_on:
      - postgres
    ports:
      - "3000:3000"
    command: sh -c "npm run migration:run && npm run seed:run:relational && npm run start:dev"

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=appdb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

**Chạy:**

```bash
docker-compose up -d

# Admin sẽ được tạo tự động
```

---

## 📋 Full Setup Flow (Complete Guide)

```bash
# 1. Clone repo
git clone <repo-url>
cd nestjs-boilerplate

# 2. Cài dependencies
npm install

# 3. Cấu hình .env
cp env-example-relational .env

# Chỉnh sửa .env nếu cần (DB connection string, etc.)

# 4. Khởi tạo database (nếu chưa có)
docker-compose up -d postgres

# Hoặc có sẵn PostgreSQL: Tạo DB "appdb"

# 5. Chạy migrations
npm run migration:run

# 6. ✨ Chạy seed - Tạo admin account
npm run seed:run:relational

# 7. Khởi động dev server
npm run start:dev

# 8. Truy cập Swagger API
# http://localhost:3000/api

# 9. Login với admin account
# Email: admin@app.com
# Password: Admin@123

# 10. 🔐 Đổi mật khẩu ngay lập tức
```

---

## ⚙️ Advanced: Custom Admin Credentials

### Edit seed file để dùng custom credentials

```typescript
// src/database/seeds/relational/create-admin-user.seed.ts

const adminUser = new NguoiDung();
adminUser.maNguoiDung = process.env.ADMIN_ID || 'ND_ADMIN_001';
adminUser.hoTen = process.env.ADMIN_NAME || 'Admin System';
adminUser.email = process.env.ADMIN_EMAIL || 'admin@app.com';
adminUser.matKhau = await bcrypt.hash(
  process.env.ADMIN_PASSWORD || 'Admin@123',
  10
);

```

### .env

```bash
ADMIN_ID=ND_ADMIN_001
ADMIN_NAME=Admin System
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=SuperSecure@123

```

### Chạy seed

```bash
npm run seed:run:relational

```

---

## 🆘 Troubleshooting

| Lỗi | Giải pháp |
| --- | --- |
| `Error: Admin user đã tồn tại` | ✅ Bình thường - script sẽ bỏ qua, không báo lỗi |
| `Database connection failed` | Kiểm tra DB connection string trong .env |
| `Migration not found` | Chạy `npm run migration:run` trước |
| `Cannot find module` | `npm install` để cài dependencies |

---

## 📚 Liên Quan

- [Database Guide](./database.md) - Chi tiết migrations
- [Seeding Guide](../src/database/seeds/SEEDING_GUIDE.md) - Advanced seeding
- [Authentication](./auth.md) - JWT authentication
- [Installing and Running](./installing-and-running.md) - Full setup guide

---

## ✅ Checklist

- [ ] Database khởi tạo thành công
- [ ] Migrations chạy xong (0 errors)
- [ ] Seed script chạy thành công
- [ ] Admin account được tạo
- [ ] Dev server khởi động (port 3000)
- [ ] Swagger API truy cập được
- [ ] Login thành công với admin account
- [ ] Mật khẩu đã được đổi
