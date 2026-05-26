# Self-Service Profile Update - Quick Reference

## Endpoint

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/auth/me` | JWT Bearer | Cập nhật hồ sơ người dùng hiện tại |

## Quick Test

```bash
# 1. Lấy JWT Token
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","matKhau":"password123"}' \
  | jq -r '.token')

# 2. Cập nhật hồ sơ
curl -X PATCH http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hoTen": "Tên Mới",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

## Request Fields

| Field | Type | Required | Validation | Example |
|-------|------|----------|-----------|---------|
| hoTen | string | No | 2-255 chars | "Nguyễn Văn A" |
| soDienThoai | string | No | Format: ^0\d{9}$ | "0912345678" |
| email | string | No | Valid email | "user@example.com" |
| matKhau | string | No | 6-255 chars | "newPassword123" |
| avatar | string | No | Max 500 chars | "https://..." |

## Response Fields

```json
{
  "maNguoiDung": "DR001",
  "hoTen": "Nguyễn Văn A",
  "soDienThoai": "0912345678",
  "email": "user@example.com",
  "vaiTro": "DRIVER",
  "trangThai": "ACTIVE",
  "avatar": "https://example.com/avatar.jpg",
  "ngayTao": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-05-24T15:45:00Z"
}
```

## Status Codes

| Code | Message | Cause |
|------|---------|-------|
| 200 | Success | Cập nhật thành công |
| 400 | Bad Request | Validation failed hoặc duplicate email/phone |
| 401 | Unauthorized | JWT token invalid/expired |

## Common Errors

```
❌ "Email already in use" 
→ Thử email khác hoặc kiểm tra email đó có user khác không

❌ "Phone number already in use"
→ Thử số điện thoại khác

❌ "Invalid credentials"
→ JWT token hết hạn, lấy token mới

❌ "soDienThoai must match /^0\d{9}$/"
→ Số điện thoại phải là 10 chữ số, bắt đầu với 0

❌ "matKhau must be longer than or equal to 6 characters"
→ Mật khẩu tối thiểu 6 ký tự
```

## JavaScript/TypeScript

```typescript
// Fetch API
async function updateProfile(updates: Partial<UpdateProfileDto>) {
  const token = localStorage.getItem('jwt_token');
  const response = await fetch('/auth/me', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  return response.json();
}

// Usage
await updateProfile({
  hoTen: 'Tên Mới',
  avatar: 'https://example.com/avatar.jpg',
});

// React Hook
const { data: user, error, isLoading } = useSWR(
  `/auth/me?token=${token}`,
  (url) => fetch(url, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
  }).then(r => r.json())
);
```

## Security Notes

✅ Mật khẩu được hash với bcryptjs trước khi lưu
✅ Mật khẩu không được trả về trong response
✅ Email/phone phải duy nhất trong database
✅ User chỉ có thể cập nhật hồ sơ của mình (auto từ JWT token)
✅ Tất cả inputs được validate

## Important Files

- Controller: `src/api/simple-auth/simple-auth.controller.ts`
- Service: `src/api/simple-auth/simple-auth.service.ts`
- DTO: `src/api/simple-auth/dto/update-profile.dto.ts`
- Entity: `src/entities/nguoi-dung.entity.ts`
- Docs: `docs/SELF_SERVICE_PROFILE_UPDATE.md`
- Tests: `docs/SELF_SERVICE_PROFILE_UPDATE_TESTING.md`

## Database Migration

```sql
-- Add avatar column if not exists
ALTER TABLE nguoi_dung 
ADD COLUMN avatar VARCHAR(500) NULL;
```
