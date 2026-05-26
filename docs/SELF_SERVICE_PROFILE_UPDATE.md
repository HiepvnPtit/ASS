# Self-Service Profile Update API

## Overview

Người dùng hiện có thể tự cập nhật hồ sơ của mình thông qua endpoint `PATCH /auth/me`. Endpoint này cho phép cập nhật các trường:
- **hoTen**: Tên đầy đủ
- **soDienThoai**: Số điện thoại (phải duy nhất)
- **email**: Email (phải duy nhất)
- **matKhau**: Mật khẩu (sẽ được mã hóa bằng bcryptjs)
- **avatar**: URL hoặc base64 của ảnh đại diện

## Feature Details

### Endpoint
```http
PATCH /auth/me
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Authentication
- **Required**: JWT Bearer Token (lấy từ `POST /auth/login`)
- **Guard**: `AuthGuard('jwt')`
- **User ID**: Tự động trích xuất từ JWT token, không cần URL params

### Request Body (UpdateProfileDto)
Tất cả các trường đều **optional** - chỉ gửi các trường bạn muốn cập nhật:

```json
{
  "hoTen": "Nguyễn Văn B",
  "soDienThoai": "0912345679",
  "email": "user2@example.com",
  "matKhau": "newPassword123",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

### Response (Success - 200 OK)
```json
{
  "maNguoiDung": "ND001",
  "hoTen": "Nguyễn Văn B",
  "soDienThoai": "0912345679",
  "email": "user2@example.com",
  "vaiTro": "CUSTOMER",
  "trangThai": "ACTIVE",
  "avatar": "https://example.com/new-avatar.jpg",
  "ngayTao": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-05-24T15:45:00Z"
}
```

**Note**: Mật khẩu **KHÔNG** được trả về trong response (bảo mật)

### Error Responses

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Nguyên nhân**: JWT token không hợp lệ hoặc hết hạn

#### 400 Bad Request - User Not Found
```json
{
  "statusCode": 400,
  "message": "User not found"
}
```
**Nguyên nhân**: User không tồn tại trong database

#### 400 Bad Request - Email Already in Use
```json
{
  "statusCode": 400,
  "message": "Email already in use"
}
```
**Nguyên nhân**: Email được cập nhật đã được sử dụng bởi user khác

#### 400 Bad Request - Phone Number Already in Use
```json
{
  "statusCode": 400,
  "message": "Phone number already in use"
}
```
**Nguyên nhân**: Số điện thoại được cập nhật đã được sử dụng bởi user khác

#### 400 Bad Request - Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "hoTen must be a string",
    "soDienThoai must match /^0\\d{9}$/ regular expression",
    "email must be an email",
    "matKhau must be longer than or equal to 6 characters",
    "avatar must be shorter than or equal to 500 characters"
  ],
  "error": "Bad Request"
}
```
**Nguyên nhân**: Dữ liệu gửi lên không hợp lệ

## Implementation Details

### Files Modified/Created

1. **src/api/simple-auth/dto/update-profile.dto.ts** (NEW)
   - UpdateProfileDto class với validation rules
   - Swagger documentation

2. **src/api/simple-auth/strategies/jwt.strategy.ts** (MODIFIED)
   - Cập nhật JWT strategy để hỗ trợ `maNguoiDung` field
   - Fallback: `payload.id` hoặc `payload.maNguoiDung` hoặc `payload.sub`

3. **src/api/simple-auth/simple-auth.controller.ts** (MODIFIED)
   - Thêm `@Patch('/me')` endpoint
   - Swagger decorators cho API documentation
   - JWT auth guard

4. **src/api/simple-auth/simple-auth.service.ts** (MODIFIED)
   - Thêm `updateProfile()` method
   - Email/phone uniqueness check (excluding current user)
   - Password hashing bằng bcryptjs
   - Trả về user object mà không có mật khẩu

5. **src/entities/nguoi-dung.entity.ts** (MODIFIED)
   - Thêm `avatar` column (varchar 500, nullable)

### Security Features

1. **Password Hashing**
   - Mật khẩu được hash bằng bcryptjs với salt rounds = 10
   - Mật khẩu không bao giờ được trả về trong response

2. **Uniqueness Validation**
   - Email phải duy nhất trên hệ thống
   - Số điện thoại phải duy nhất trên hệ thống
   - Check tự động loại trừ user hiện tại

3. **JWT Authentication**
   - Endpoint yêu cầu JWT token hợp lệ
   - User ID tự động trích xuất từ JWT, không thể bypass

4. **Input Validation**
   - Tất cả fields được validate bằng class-validator
   - Phone number format: `^0\d{9}$` (10 chữ số bắt đầu với 0)
   - Email format: RFC 5322

### Database Changes

Migration cần thêm `avatar` column vào `nguoi_dung` table:

```sql
ALTER TABLE nguoi_dung ADD COLUMN avatar VARCHAR(500) NULL;
```

Hoặc nếu dùng TypeORM migrations:

```typescript
export class AddAvatarToNguoiDung1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'nguoi_dung',
      new TableColumn({
        name: 'avatar',
        type: 'varchar',
        length: '500',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('nguoi_dung', 'avatar');
  }
}
```

## Usage Examples

### 1. Update tên và avatar
```bash
curl -X PATCH http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "hoTen": "Nguyễn Văn B",
    "avatar": "https://example.com/new-avatar.jpg"
  }'
```

### 2. Đổi mật khẩu
```bash
curl -X PATCH http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "matKhau": "newSecurePassword123"
  }'
```

### 3. Cập nhật email và số điện thoại
```bash
curl -X PATCH http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com",
    "soDienThoai": "0987654321"
  }'
```

### 4. JavaScript/TypeScript Client
```typescript
async function updateProfile(token: string, updates: UpdateProfileDto) {
  const response = await fetch('http://localhost:3000/auth/me', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

// Usage
const updatedUser = await updateProfile(jwtToken, {
  hoTen: 'Nguyễn Văn B',
  soDienThoai: '0912345679',
  avatar: 'https://example.com/avatar.jpg',
});
```

### 5. React Hook Example
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const updateProfile = async (updates: UpdateProfileDto) => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch('/auth/me', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const user = await response.json();
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
};
```

## Testing Checklist

- [ ] Endpoint accessible chỉ với JWT token hợp lệ
- [ ] Cập nhật single field thành công
- [ ] Cập nhật multiple fields cùng lúc thành công
- [ ] Mật khẩu được hash trước khi lưu
- [ ] Mật khẩu không được trả về trong response
- [ ] Email duplicate check hoạt động (ngoại trừ user hiện tại)
- [ ] Phone number duplicate check hoạt động (ngoại trừ user hiện tại)
- [ ] Validation errors trả về đúng format
- [ ] 401 Unauthorized khi token không hợp lệ
- [ ] 404 hoặc 400 khi user không tồn tại

## Swagger Documentation

Endpoint được tự động document trong Swagger UI tại `/api/docs`:
- Method: `PATCH`
- Path: `/auth/me`
- Tags: `Auth`
- Security: `Bearer (JWT)`
- Parameters: Request body (UpdateProfileDto)
- Responses: 200, 400, 401

## Integration with NestJS Modules

**Module**: `SimpleAuthModule` (src/api/simple-auth/simple-auth.module.ts)
**Controller**: `SimpleAuthController`
**Service**: `SimpleAuthService`
**Entity**: `NguoiDung` (src/entities/nguoi-dung.entity.ts)

## Notes

- JWT strategy được cập nhật để hỗ trợ `maNguoiDung` field từ JWT payload
- Email và phone number là unique trong database
- Avatar field tùy chọn, có thể là URL hoặc base64
- Tất cả fields được whitelist bởi class-validator
- Response không bao gồm mật khẩu hoặc sensitive data
