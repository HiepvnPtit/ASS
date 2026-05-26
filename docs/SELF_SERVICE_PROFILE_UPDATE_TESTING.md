# Self-Service Profile Update - Testing Guide

## Quick Start Testing

### Step 1: Get JWT Token

**Register or Login first:**
```bash
# Login để lấy JWT token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "matKhau": "password123"
  }'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkRSMDAxIiwibWFOZ3VvaURVbmciOiJEUjAwMSIsInNlc3Npb25JZCI6IkRSMDAxIiwidmFpVHJvIjoiRFJJVkVSIiwicm9sZSI6eyJpZCI6IkRSSVZFUiIsIm5hbWUiOiJEUklWRVIifSwiaWF0IjoxNzE2NTU3NzEwLCJleHAiOjE3MTY1NjEzMTB9.abc..."
# }
```

Save token to environment variable:
```bash
# Bash/Linux/Mac
export JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# PowerShell
$env:JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 2: Test Update Profile

#### Test 2.1: Update Single Field (Name)
```bash
curl -X PATCH http://localhost:3000/auth/me \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hoTen": "Nguyễn Văn Updated Name"
  }'

# Expected Response (200):
# {
#   "maNguoiDung": "DR001",
#   "hoTen": "Nguyễn Văn Updated Name",
#   "soDienThoai": "0987654321",
#   "email": "user@example.com",
#   "vaiTro": "DRIVER",
#   "trangThai": "ACTIVE",
#   "avatar": null,
#   "ngayTao": "2026-01-15T10:30:00.000Z",
#   "updatedAt": "2026-05-24T15:50:00.000Z"
# }
```

#### Test 2.2: Update Multiple Fields
```bash
curl -X PATCH http://localhost:3000/auth/me \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hoTen": "Nguyễn Văn New",
    "avatar": "https://example.com/avatar.jpg",
    "email": "newemail@example.com"
  }'
```

#### Test 2.3: Update Password
```bash
curl -X PATCH http://localhost:3000/auth/me \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "matKhau": "newPassword123"
  }'

# Expected: Mật khẩu được hash, không xuất hiện trong response
```

#### Test 2.4: Update Phone Number
```bash
curl -X PATCH http://localhost:3000/auth/me \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "soDienThoai": "0912345679"
  }'
```

## Error Testing

### Test 3.1: Missing Authorization Header
```bash
curl -X PATCH http://localhost:3000/auth/me \
  -H "Content-Type: application/json" \
  -d '{"hoTen": "Test"}'

# Expected Response (401):
# {
#   "statusCode": 401,
#   "message": "Unauthorized"
# }
```

### Test 3.2: Invalid JWT Token
```bash
curl -X PATCH http://localhost:3000/auth/me \
  -H "Authorization: Bearer invalid.token.here" \
  -H "Content-Type: application/json" \
  -d '{"hoTen": "Test"}'

# Expected Response (401):
# {
#   "statusCode": 401,
#   "message": "Unauthorized"
# }
```

### Test 3.3: Email Already in Use
```bash
# Assume user1@example.com exists for another user
curl -X PATCH http://localhost:3000/auth/me \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com"
  }'

# Expected Response (400):
# {
#   "statusCode": 400,
#   "message": "Email already in use"
# }
```

### Test 3.4: Phone Number Already in Use
```bash
# Assume 0912345678 exists for another user
curl -X PATCH http://localhost:3000/auth/me \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "soDienThoai": "0912345678"
  }'

# Expected Response (400):
# {
#   "statusCode": 400,
#   "message": "Phone number already in use"
# }
```

### Test 3.5: Invalid Phone Number Format
```bash
curl -X PATCH http://localhost:3000/auth/me \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "soDienThoai": "123"
  }'

# Expected Response (400):
# {
#   "statusCode": 400,
#   "message": [
#     "soDienThoai must match /^0\\d{9}$/ regular expression"
#   ],
#   "error": "Bad Request"
# }
```

### Test 3.6: Invalid Email Format
```bash
curl -X PATCH http://localhost:3000/auth/me \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid.email"
  }'

# Expected Response (400):
# {
#   "statusCode": 400,
#   "message": [
#     "email must be an email"
#   ],
#   "error": "Bad Request"
# }
```

### Test 3.7: Password Too Short
```bash
curl -X PATCH http://localhost:3000/auth/me \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "matKhau": "123"
  }'

# Expected Response (400):
# {
#   "statusCode": 400,
#   "message": [
#     "matKhau must be longer than or equal to 6 characters"
#   ],
#   "error": "Bad Request"
# }
```

### Test 3.8: Name Too Short
```bash
curl -X PATCH http://localhost:3000/auth/me \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hoTen": "A"
  }'

# Expected Response (400):
# {
#   "statusCode": 400,
#   "message": [
#     "hoTen must be longer than or equal to 2 characters"
#   ],
#   "error": "Bad Request"
# }
```

## Testing with Swagger UI

1. Open Swagger UI: `http://localhost:3000/api/docs`
2. Find endpoint: `PATCH /auth/me`
3. Click "Try it out"
4. Click the lock icon and enter JWT token
5. Fill in request body with test data
6. Click "Execute"

## Testing with Postman

### Import Collection
```json
{
  "info": {
    "name": "Profile Update Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Update Profile - Single Field",
      "request": {
        "method": "PATCH",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"hoTen\": \"Updated Name\"}"
        },
        "url": {
          "raw": "{{base_url}}/auth/me",
          "host": ["{{base_url}}"],
          "path": ["auth", "me"]
        }
      }
    },
    {
      "name": "Update Profile - Multiple Fields",
      "request": {
        "method": "PATCH",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"hoTen\": \"New Name\", \"soDienThoai\": \"0912345679\", \"avatar\": \"https://example.com/avatar.jpg\"}"
        },
        "url": {
          "raw": "{{base_url}}/auth/me",
          "host": ["{{base_url}}"],
          "path": ["auth", "me"]
        }
      }
    }
  ]
}
```

## Testing with Insomnia

1. Create new Request: `PATCH`
2. URL: `http://localhost:3000/auth/me`
3. Headers tab:
   - Add `Authorization: Bearer {JWT_TOKEN}`
   - Add `Content-Type: application/json`
4. Body tab (Raw JSON):
   ```json
   {
     "hoTen": "Updated Name",
     "avatar": "https://example.com/avatar.jpg"
   }
   ```
5. Send request

## Database Verification

### Check Updated User in Database
```sql
SELECT 
  ma_nguoi_dung,
  ho_ten,
  so_dien_thoai,
  email,
  avatar,
  updated_at
FROM nguoi_dung
WHERE ma_nguoi_dung = 'DR001';
```

### Verify Password was Hashed
```sql
SELECT 
  ma_nguoi_dung,
  mat_khau,
  LENGTH(mat_khau) as password_hash_length
FROM nguoi_dung
WHERE ma_nguoi_dung = 'DR001';

-- Expected: password_hash_length = 60 (bcrypt hash length)
```

## Test Coverage Checklist

### ✅ Basic Functionality
- [ ] Update single field (name)
- [ ] Update single field (phone)
- [ ] Update single field (email)
- [ ] Update single field (avatar)
- [ ] Update single field (password)
- [ ] Update multiple fields together
- [ ] Response excludes password field

### ✅ Validation
- [ ] Reject invalid email format
- [ ] Reject invalid phone format (not 0XXXXXXXXX)
- [ ] Reject password < 6 characters
- [ ] Reject name < 2 characters
- [ ] Reject avatar > 500 characters
- [ ] Reject empty body (should pass, no updates)

### ✅ Uniqueness Constraints
- [ ] Reject duplicate email
- [ ] Reject duplicate phone number
- [ ] Allow updating to same email (current user)
- [ ] Allow updating to same phone (current user)

### ✅ Security
- [ ] Reject request without Authorization header
- [ ] Reject request with invalid token
- [ ] Reject request with expired token
- [ ] Password returned hashed, not plaintext
- [ ] User can only update their own profile

### ✅ Database
- [ ] Changes persisted to database
- [ ] Updated timestamp (updatedAt) changed
- [ ] Password hash format correct (bcrypt)

### ✅ Edge Cases
- [ ] Empty object `{}` - no error, no changes
- [ ] Whitespace in name `"  "` - allowed (validation doesn't trim)
- [ ] Very long avatar URL (< 500 chars) - allowed
- [ ] Special characters in name - allowed
- [ ] Update same value multiple times - allowed

## Performance Testing

### Load Test (Optional)
```bash
# Using Apache Bench
ab -n 100 -c 10 \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -p update-payload.json \
  http://localhost:3000/auth/me

# using-payload.json:
# {
#   "hoTen": "Load Test User"
# }
```

## Notes

- Tất cả tests giả định rằng server đang chạy trên `localhost:3000`
- JWT token có thể hết hạn - lấy token mới nếu nhận 401
- Database phải được migrate với avatar column
- Email và phone phải duy nhất trong database
