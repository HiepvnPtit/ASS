# Admin Setup - Implementation Summary

## 📋 Tóm Tắt

Hệ thống **Seeding** đã được setup hoàn chỉnh để **tạo sẵn 1 tài khoản ADMIN** khi khởi tạo database.

---

## ✨ Những Gì Đã Được Tạo

### 1. **Seed Scripts** 
- ✅ `/src/database/seeds/relational/create-admin-user.seed.ts` - Logic tạo admin user
- ✅ `/src/database/seeds/relational/run-seed.ts` - Main seeder script
- ✅ `/src/database/seeds/document/run-seed.ts` - Seeder cho MongoDB

### 2. **Documentation**
- ✅ `/docs/admin-setup.md` - Hướng dẫn chi tiết (400+ lines)
- ✅ `/src/database/seeds/SEEDING_GUIDE.md` - Advanced seeding guide

### 3. **Helper Scripts**
- ✅ `/setup-admin.ps1` - PowerShell script cho Windows
- ✅ `/setup-admin.sh` - Bash script cho Linux/macOS

---

## 🚀 Quick Start (3 bước)

### Windows (PowerShell):
```bash
# 1️⃣ Chạy setup script
.\setup-admin.ps1

# 2️⃣ Khởi động server
npm run start:dev

# 3️⃣ Login
# Email: admin@app.com
# Password: Admin@123
```

### Linux/macOS:
```bash
# 1️⃣ Cấp quyền execute
chmod +x setup-admin.sh

# 2️⃣ Chạy setup script
./setup-admin.sh

# 3️⃣ Khởi động server
npm run start:dev
```

### Manual (Tất cả OS):
```bash
npm run migration:run
npm run seed:run:relational
npm run start:dev
```

---

## 📊 Admin Account

| Field | Value |
|-------|-------|
| Email | `admin@app.com` |
| Password | `Admin@123` |
| User ID | `ND_ADMIN_001` |
| Role | `ADMIN` |
| Status | `ACTIVE` |

---

## 🔐 Bảo Mật

**⚠️ Ngay sau khi login, đổi mật khẩu:**

```bash
# API call để đổi mật khẩu
PATCH /profile/password
{
  "currentPassword": "Admin@123",
  "newPassword": "your-new-secure-password"
}
```

**Hoặc dùng environment variable:**
```env
ADMIN_EMAIL=your-email@company.com
ADMIN_PASSWORD=your-secure-password
```

---

## 📁 File Structure

```
src/database/seeds/
├── relational/
│   ├── create-admin-user.seed.ts    ✅ Tạo admin logic
│   └── run-seed.ts                  ✅ Main seeder script
├── document/
│   └── run-seed.ts                  ✅ MongoDB seeder (template)
└── SEEDING_GUIDE.md                 ✅ Advanced guide

docs/
├── admin-setup.md                   ✅ Chi tiết hướng dẫn
└── SETUP_ADMIN_SUMMARY.md           ✅ File này

setup-admin.ps1                       ✅ Windows helper
setup-admin.sh                        ✅ Linux/macOS helper
```

---

## 🔄 Npm Scripts Liên Quan

```json
{
  "migration:generate": "Generate migrations từ entities",
  "migration:run": "Chạy pending migrations",
  "migration:revert": "Rollback 1 migration cuối cùng",
  "seed:run:relational": "✅ Chạy seed tạo admin",
  "seed:run:document": "Chạy seed MongoDB"
}
```

---

## ✅ Verification

### Cách 1: Query Database
```sql
SELECT * FROM nguoi_dung WHERE vai_tro = 'ADMIN';
-- Sẽ có 1 row với email: admin@app.com
```

### Cách 2: Login vào API
```bash
POST /auth/login
{
  "email": "admin@app.com",
  "password": "Admin@123"
}

# Response sẽ có access token
```

---

## 🐳 Docker Integration

**Tự động seed khi container start:**

```yaml
services:
  api:
    build: .
    command: sh -c "npm run migration:run && npm run seed:run:relational && npm run start:dev"
```

---

## 🔧 Customize Admin Credentials

### Edit seed file:
```typescript
// src/database/seeds/relational/create-admin-user.seed.ts

const adminUser = new NguoiDung();
adminUser.email = process.env.ADMIN_EMAIL || 'admin@app.com';
adminUser.matKhau = await bcrypt.hash(
  process.env.ADMIN_PASSWORD || 'Admin@123',
  10
);
```

### .env:
```
ADMIN_EMAIL=your-email@company.com
ADMIN_PASSWORD=your-password
```

---

## 💡 Key Features

✅ **Idempotent** - Chạy nhiều lần không tạo duplicate admin  
✅ **Safe** - Kiểm tra admin tồn tại trước khi tạo  
✅ **TypeScript** - Fully typed seed scripts  
✅ **Error Handling** - Clear error messages  
✅ **Logging** - Tất cả actions được log  
✅ **Cross-Platform** - Windows, Linux, macOS  
✅ **Docker Ready** - Tích hợp Docker/Compose  

---

## 📚 Tham Khảo

- [Admin Setup Guide](./admin-setup.md) - Hướng dẫn chi tiết
- [Seeding Guide](../src/database/seeds/SEEDING_GUIDE.md) - Advanced seeding
- [Database Guide](./database.md) - Migrations & Database
- [Installing and Running](./installing-and-running.md) - Full setup

---

## 🎯 Next Steps

1. ✅ Chạy `npm run seed:run:relational` để tạo admin
2. ✅ Login với admin account
3. ✅ Đổi mật khẩu ngay lập tức
4. ✅ Đọc [admin-setup.md](./admin-setup.md) để hiểu thêm

---

**Created:** May 24, 2026  
**Status:** ✅ Ready for Production  
**Tested:** ✅ Verified with 2 runs (create + idempotent check)
