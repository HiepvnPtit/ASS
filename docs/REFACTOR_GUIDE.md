# Refactor Guide: Remove Boilerplate Entities & Use Custom NguoiDung

## Overview

Hướng dẫn này giúp bạn loại bỏ các entity mặc định từ boilerplate (`User`, `Role`, `Status`, `File`, `Session`) và chỉ sử dụng các custom entity tự thiết kế: `NguoiDung`, `KhachHang`, `TaiXe`.

---

## Step 1: Update JWT Payload Type ✅ (DONE)

**File:** `src/auth/strategies/types/jwt-payload.type.ts`

Đã được cập nhật để sử dụng:
```typescript
export type JwtPayloadType = {
  maNguoiDung: string;  // User ID
  email: string;
  vaiTro: string;       // Role: ADMIN, USER, DRIVER, CUSTOMER
  iat?: number;
  exp?: number;
};
```

---

## Step 2: Update JWT Strategy ✅ (DONE)

**File:** `src/auth/strategies/jwt.strategy.ts`

Đã được cập nhật để validate payload theo NguoiDung entity.

---

## Step 3: Replace AuthService

**Current Status:** File mới tạo tại `src/auth/auth.service.new.ts`

### Action Required:

1. **Backup file cũ:**
   ```bash
   cp src/auth/auth.service.ts src/auth/auth.service.ts.bak
   ```

2. **Replace file:**
   ```bash
   cp src/auth/auth.service.new.ts src/auth/auth.service.ts
   rm src/auth/auth.service.new.ts
   ```

### Key Changes in New AuthService:

✅ **Removed Dependencies:**
- `UsersService` → Sử dụng `InjectRepository(NguoiDung)` directly
- `SessionService` → Không cần session, JWT đủ
- `RoleEnum`, `StatusEnum` → Sử dụng string values directly

✅ **New Methods:**
- `validateLogin()` - Đăng nhập với NguoiDung entity
  - Tìm user by email trong `NguoiDung`
  - Hash password và compare
  - Generate JWT token

- `register()` - Đăng ký mới
  - Tạo NguoiDung record
  - Nếu `vaiTro='CUSTOMER'`, tạo KhachHang record
  - Nếu `vaiTro='DRIVER'`, tạo TaiXe record

- `me()` - Lấy thông tin user hiện tại từ JWT

✅ **JWT Payload Structure:**
```typescript
{
  maNguoiDung: "ND_1234567890",
  email: "user@example.com",
  vaiTro: "CUSTOMER"  // or "DRIVER", "ADMIN", "USER"
}
```

---

## Step 4: Update AuthModule

**File:** `src/auth/auth.module.ts`

Replace nội dung:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';

import { NguoiDung } from '../entities/nguoi-dung.entity';
import { KhachHang } from '../entities/khach-hang.entity';
import { TaiXe } from '../entities/tai-xe.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NguoiDung, KhachHang, TaiXe]),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

---

## Step 5: Delete Deprecated Files & Folders

### Delete these folders entirely:
```bash
rm -rf src/users/                # Remove users module
rm -rf src/roles/                # Remove roles module
rm -rf src/statuses/             # Remove statuses module
rm -rf src/session/              # Remove session module
rm -rf src/files/                # Optional: Remove files module if not needed
```

### Or in Windows (PowerShell):
```powershell
Remove-Item -Recurse -Force src/users
Remove-Item -Recurse -Force src/roles
Remove-Item -Recurse -Force src/statuses
Remove-Item -Recurse -Force src/session
Remove-Item -Recurse -Force src/files  # Optional
```

---

## Step 6: Update AppModule

**File:** `src/app.module.ts`

**Remove these imports:**
```typescript
// DELETE THESE LINES
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { StatusesModule } from './statuses/statuses.module';
import { SessionModule } from './session/session.module';
// import { FilesModule } from './files/files.module'; // Optional
```

**Remove from imports array:**
```typescript
@Module({
  imports: [
    // ...existing imports...
    // DELETE THESE:
    // UsersModule,
    // RolesModule,
    // StatusesModule,
    // SessionModule,
    // FilesModule,
  ],
})
```

---

## Step 7: Update Auth Controller DTOs

**File:** `src/auth/dto/auth-register-login.dto.ts`

**Current DTO is fine, but you may want to add vaiTro field:**

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';

export class AuthRegisterLoginDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ 
    example: 'CUSTOMER', 
    enum: ['USER', 'CUSTOMER', 'DRIVER', 'ADMIN'],
    required: false 
  })
  @IsOptional()
  @IsIn(['USER', 'CUSTOMER', 'DRIVER', 'ADMIN'])
  vaiTro?: string;
}
```

---

## Step 8: TypeScript Errors to Fix

After deleting folders, you'll see errors in these files:

### 1. Auth Controller Imports
**File:** `src/auth/auth.controller.ts`

```typescript
// REMOVE THIS IMPORT:
// import { User } from '../users/domain/user';

// REPLACE with:
import { NguoiDung } from '../entities/nguoi-dung.entity';

// Update return types in controller methods:
// OLD: Promise<LoginResponseDto> with User object
// NEW: Returns NguoiDung-compatible object
```

### 2. Login Response DTO
**File:** `src/auth/dto/login-response.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty({ required: false })
  refreshToken?: string;

  @ApiProperty()
  tokenExpires: Date;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    hoTen: string;
    vaiTro: string;
  };
}
```

### 3. Remove JwtRefreshStrategy if not needed
**File:** `src/auth/strategies/jwt-refresh.strategy.ts`

If you're not using refresh tokens, you can delete this file and remove from auth.module.ts

---

## Step 9: Update NguoiDung Entity (if needed)

**File:** `src/entities/nguoi-dung.entity.ts`

Make sure it has these fields:
```typescript
@Entity({ name: 'nguoi_dung' })
export class NguoiDung {
  @PrimaryColumn({ name: 'ma_nguoi_dung', type: 'varchar', length: 50 })
  maNguoiDung!: string;

  @Column({ name: 'ho_ten', type: 'varchar', length: 255 })
  hoTen!: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true, unique: true })
  email?: string;

  @Column({ name: 'mat_khau', type: 'varchar', length: 255 })
  matKhau!: string;

  @Column({ name: 'vai_tro', type: 'varchar', length: 50 })
  vaiTro!: string; // ADMIN, USER, CUSTOMER, DRIVER

  @Column({ name: 'trang_thai', type: 'varchar', length: 50, default: 'ACTIVE' })
  trangThai!: string; // ACTIVE, INACTIVE, BANNED

  @CreateDateColumn({ name: 'ngay_tao', type: 'timestamptz' })
  ngayTao!: Date;

  // OneToOne relationships
  @OneToOne(() => KhachHang, (kh) => kh.nguoiDung, { nullable: true })
  khachHang?: KhachHang;

  @OneToOne(() => TaiXe, (tx) => tx.nguoiDung, { nullable: true })
  taiXe?: TaiXe;
}
```

---

## Step 10: Run Tests

After refactoring, run these commands:

```bash
# Install dependencies
npm install

# Run type checking
npm run build

# Run tests
npm run test

# Start dev server
npm run start:dev
```

### Test the auth flow:

**Register:**
```bash
curl -X POST http://localhost:3000/v1/auth/email/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "firstName": "John",
    "lastName": "Doe",
    "vaiTro": "CUSTOMER"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/v1/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }'
```

**Get Current User (with JWT token):**
```bash
curl -X GET http://localhost:3000/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Step 11: Update Other Modules

If other modules import from deleted modules, update them:

### Example: SimpleAuthModule
**File:** `src/api/simple-auth/simple-auth.service.ts`

Already uses custom entities, but verify it imports from correct paths:
```typescript
// ✅ CORRECT:
import { NguoiDung } from '../../entities/nguoi-dung.entity';
import { KhachHang } from '../../entities/khach-hang.entity';
import { TaiXe } from '../../entities/tai-xe.entity';

// ❌ WRONG (remove these):
// import { User } from '../../users/domain/user';
// import { Role } from '../../roles/domain/role';
```

---

## Troubleshooting

### Error: Cannot find module 'src/users/users.module'
**Solution:** Remove the import from `src/app.module.ts`

### Error: Type 'User' is not assigned
**Solution:** Replace with `NguoiDung` entity and use `maNguoiDung` instead of `id`

### Error: 'Role' does not export
**Solution:** Remove role imports, use string values for `vaiTro` field

### Error: SessionService not found
**Solution:** JWT is stateless, remove session-related code

---

## Summary of Changes

| Before | After |
|--------|-------|
| User entity from users module | NguoiDung entity |
| Role entity + RoleEnum | vaiTro: string |
| Status entity + StatusEnum | trangThai: string |
| UsersService | Repository<NguoiDung> |
| SessionService | JWT tokens (stateless) |
| User, Role, Status imports | NguoiDung, KhachHang, TaiXe imports |

---

## Files Created/Modified

✅ **Modified:**
- `src/auth/strategies/types/jwt-payload.type.ts`
- `src/auth/strategies/jwt.strategy.ts`
- `src/auth/auth.service.ts` (create new version)
- `src/auth/auth.module.ts`

❌ **To Delete:**
- `src/users/`
- `src/roles/`
- `src/statuses/`
- `src/session/`
- `src/files/` (optional)

---

## Next Steps

1. ✅ Backup current code
2. ✅ Replace `auth.service.ts` with new version
3. ✅ Update `auth.module.ts`
4. ✅ Update `app.module.ts`
5. ✅ Update `auth/dto/` files if needed
6. ✅ Delete deprecated folders
7. ✅ Fix any remaining TypeScript errors
8. ✅ Test auth flow
9. ✅ Update other modules that import from deleted modules
10. ✅ Run `npm run build` to verify no errors

---

**Last Updated:** May 22, 2024
**Status:** Ready for implementation
