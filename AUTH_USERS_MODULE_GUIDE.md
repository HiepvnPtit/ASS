# Auth & Users Module Implementation Guide

## 📋 Tóm tắt các thay đổi

Đã hoàn thiện module Auth và Users với các tính năng sau:

### 1. ✅ API `GET /auth/me` 
- **Endpoint**: `GET /auth/me`
- **Guard**: `@UseGuards(AuthGuard('jwt'))`
- **Header**: `Authorization: Bearer <JWT_TOKEN>`
- **Response**: 
  ```json
  {
    "maNguoiDung": "ND-xxx",
    "hoTen": "Nguyen Van A",
    "soDienThoai": "+84901234567",
    "email": "user@example.com",
    "vaiTro": "CUSTOMER",
    "trangThai": "ACTIVE",
    "avatar": "https://...",
    "createdAt": "2026-05-24T10:30:00Z",
    "updatedAt": "2026-05-24T15:45:00Z",
    "ngayTao": "2026-05-24T10:30:00Z"
  }
  ```
- **Note**: Mật khẩu được loại bỏ trước khi trả về

### 2. ✅ Device Token Management (Push Notification)

#### New Entity: `DeviceToken` 
- **File**: `src/entities/device-token.entity.ts`
- **Bảng**: `device_token`
- **Columns**:
  - `id` (UUID, PK)
  - `ma_nguoi_dung` (FK to NguoiDung)
  - `token` (text) - FCM token
  - `platform` (ios/android/web, nullable)
  - `device_name` (varchar 255, nullable)
  - `is_active` (boolean, default: true)
  - `last_used_at` (timestamptz, nullable)
  - `created_at`, `updated_at`, `deleted_at`
- **Unique Constraint**: `(ma_nguoi_dung, token)` - Không lưu trùng lặp

#### APIs:

##### 1️⃣ POST /users/me/device-tokens
- **Mô tả**: Lưu FCM token của thiết bị
- **Guard**: JWT Required
- **Request Body**:
  ```json
  {
    "token": "eJxYL0ixUsisSS0p0klIzEkpysxL...",
    "platform": "android",
    "deviceName": "Samsung Galaxy S21"
  }
  ```
- **Response (201)**:
  ```json
  {
    "id": "uuid",
    "maNguoiDung": "ND-xxx",
    "token": "eJxYL0ixUsisSS0p0klIzEkpysxL...",
    "platform": "android",
    "deviceName": "Samsung Galaxy S21",
    "isActive": true,
    "lastUsedAt": "2026-05-25T12:30:00Z",
    "createdAt": "2026-05-25T12:30:00Z"
  }
  ```
- **Logic**:
  - Nếu token đã tồn tại cho user này → Update `lastUsedAt` và `isActive`
  - Nếu token mới → Tạo bản ghi mới
  - Không thể lưu trùng token cho cùng user

##### 2️⃣ GET /users/me/device-tokens
- **Mô tả**: Lấy tất cả device tokens của user
- **Guard**: JWT Required
- **Response (200)**:
  ```json
  [
    {
      "id": "uuid",
      "token": "...",
      "platform": "android",
      "deviceName": "Samsung Galaxy S21",
      "isActive": true,
      "lastUsedAt": "2026-05-25T12:30:00Z",
      "createdAt": "2026-05-25T12:30:00Z"
    },
    {
      "id": "uuid2",
      "token": "...",
      "platform": "ios",
      "deviceName": "iPhone 12",
      "isActive": true,
      "lastUsedAt": "2026-05-25T10:15:00Z",
      "createdAt": "2026-05-25T09:00:00Z"
    }
  ]
  ```
- **Order**: Sắp xếp theo `lastUsedAt` giảm dần (mới nhất trước)

##### 3️⃣ DELETE /users/me/device-tokens/:tokenId
- **Mô tả**: Xóa một device token cụ thể (logout từ một thiết bị)
- **Guard**: JWT Required
- **Parameter**: `tokenId` (UUID)
- **Response (204)**: No Content
- **Error (400)**: Token not found or unauthorized

##### 4️⃣ DELETE /users/me/device-tokens
- **Mô tả**: Xóa tất cả device tokens (logout từ tất cả thiết bị)
- **Guard**: JWT Required
- **Response (204)**: No Content
- **Use Case**: Người dùng muốn logout khỏi tất cả thiết bị

---

## 📁 Files Được Tạo/Sửa

### New Files:
```
src/entities/device-token.entity.ts
src/api/users/
  ├── users.module.ts
  ├── users.service.ts
  ├── users.controller.ts
  └── dto/
      └── create-device-token.dto.ts
```

### Modified Files:
```
src/api/simple-auth/
  ├── simple-auth.controller.ts        (+ GET /auth/me endpoint)
  ├── simple-auth.service.ts          (+ getProfile method)
  └── simple-auth.module.ts           (+ DeviceToken import)

src/app.module.ts                      (+ UsersModule import)
```

---

## 🔧 Database Migration

Bạn cần tạo migration hoặc chạy lệnh sau để tạo bảng `device_token`:

```sql
CREATE TABLE device_token (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ma_nguoi_dung VARCHAR(50) NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform VARCHAR(20),
  device_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  UNIQUE(ma_nguoi_dung, token)
);

CREATE INDEX idx_device_token_user_active ON device_token(ma_nguoi_dung, is_active);
```

Hoặc nếu dùng TypeORM migration:

```bash
npm run typeorm migration:generate src/database/migrations/CreateDeviceTokenTable
npm run typeorm migration:run
```

---

## 🧪 Test API (Cách Sử Dụng)

### 1. Get Current User Profile
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 2. Add Device Token (Khi Login)
```bash
curl -X POST http://localhost:3000/users/me/device-tokens \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eJxYL0ixUsisSS0p0klIzEkpysxL...",
    "platform": "android",
    "deviceName": "Samsung Galaxy S21"
  }'
```

### 3. Get All Device Tokens
```bash
curl -X GET http://localhost:3000/users/me/device-tokens \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 4. Remove Specific Token
```bash
curl -X DELETE http://localhost:3000/users/me/device-tokens/<tokenId> \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 5. Remove All Tokens (Logout từ tất cả thiết bị)
```bash
curl -X DELETE http://localhost:3000/users/me/device-tokens \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## 📌 Key Features

✅ **GET /auth/me**:
- Lấy thông tin user hiện tại từ JWT token
- Password không được trả về
- Có timestamp createdAt, updatedAt, ngayTao

✅ **Device Token Management**:
- FCM tokens được lưu an toàn trong database
- Không lưu trùng token cho cùng user
- Tự động cập nhật `lastUsedAt` khi add token
- Hỗ trợ delete single token hoặc delete all tokens
- Có `isActive` flag để mark token không dùng
- Hỗ trợ multiple platforms (iOS, Android, Web)

✅ **Security**:
- Tất cả endpoints yêu cầu JWT token
- User chỉ có thể quản lý tokens của chính mình
- Soft delete support (deletedAt column)

---

## 🚀 Next Steps

1. **Run database migration** để tạo bảng `device_token`
2. **Test APIs** với curl hoặc Postman
3. **Integrate frontend** để gửi device token khi login
4. **Setup push notification service** (Firebase Cloud Messaging)
5. **Use device tokens** để gửi push notification từ backend

---

## 📚 References

- JWT Guard: `AuthGuard('jwt')` từ `@nestjs/passport`
- Device Token DTO: `CreateDeviceTokenDto`
- Entity: `DeviceToken`, `NguoiDung`
- Service: `UsersService`, `SimpleAuthService`
