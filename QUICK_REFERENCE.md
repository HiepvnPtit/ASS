# 🚀 Quick Reference - Auth & Users APIs

## GET /auth/me
**Get Current User Profile**
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer JWT_TOKEN"
```
✅ Returns: User info (without password)

---

## POST /users/me/device-tokens
**Save FCM Device Token**
```bash
curl -X POST http://localhost:3000/users/me/device-tokens \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "FCM_TOKEN_HERE",
    "platform": "android",
    "deviceName": "Samsung Galaxy"
  }'
```
✅ Returns: Device token record (created or updated)

---

## GET /users/me/device-tokens
**Get All Device Tokens**
```bash
curl -X GET http://localhost:3000/users/me/device-tokens \
  -H "Authorization: Bearer JWT_TOKEN"
```
✅ Returns: Array of device tokens (sorted by lastUsedAt DESC)

---

## DELETE /users/me/device-tokens/:tokenId
**Remove Specific Device Token**
```bash
curl -X DELETE http://localhost:3000/users/me/device-tokens/UUID_HERE \
  -H "Authorization: Bearer JWT_TOKEN"
```
✅ Returns: 204 No Content

---

## DELETE /users/me/device-tokens
**Logout from All Devices**
```bash
curl -X DELETE http://localhost:3000/users/me/device-tokens \
  -H "Authorization: Bearer JWT_TOKEN"
```
✅ Returns: 204 No Content (removes all tokens for this user)

---

## Frontend Integration Example

### On Login:
```javascript
// 1. Register user
const registerResponse = await fetch('/auth/register', {...})

// 2. Login user
const loginResponse = await fetch('/auth/login', {...})
const { token } = await loginResponse.json()

// 3. Save device token (for push notifications)
await fetch('/users/me/device-tokens', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: fcmToken,  // From Firebase Cloud Messaging
    platform: 'android', // or 'ios', 'web'
    deviceName: 'Samsung Galaxy S21'
  })
})
```

### On Logout:
```javascript
// Option 1: Remove only current device token
await fetch(`/users/me/device-tokens/${tokenId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
})

// Option 2: Logout from all devices
await fetch('/users/me/device-tokens', {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### Get User Profile:
```javascript
const response = await fetch('/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const user = await response.json()
console.log(user) // { maNguoiDung, hoTen, soDienThoai, ... }
```

---

## SQL Migration

Run this to create the device_token table:
```bash
psql -U postgres -d your_database -f database.device-token.sql
```

Or manually:
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
```

---

## Environment Variables
Ensure these are set in `.env`:
```
JWT_SECRET=your_secret_key
```

---

## 🔗 Related Files
- `src/entities/device-token.entity.ts` - Device Token Entity
- `src/api/users/users.service.ts` - Users Service
- `src/api/users/users.controller.ts` - Users Controller
- `src/api/simple-auth/simple-auth.service.ts` - Auth Service (getProfile method)
- `src/api/simple-auth/simple-auth.controller.ts` - Auth Controller (GET /auth/me)
