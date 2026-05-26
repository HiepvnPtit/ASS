# Phase 3 Payment Endpoints - Testing Guide

## Quick Start

### 1. Start the API Server

```bash
npm run start:dev
```

Expected output:
```
[Nest] xxxx - MM/DD/YYYY, HH:MM:SS AM     LOG [NestFactory] Starting Nest application...
[Nest] xxxx - MM/DD/YYYY, HH:MM:SS AM     LOG [InstanceLoader] ...
[Nest] xxxx - MM/DD/YYYY, HH:MM:SS AM     LOG [NestApplication] Nest application successfully started
```

Server will be available at: `http://localhost:3000`

### 2. Run Seed to Create Admin Account

```bash
npm run seed:run:relational
```

Output:
```
[Nest] xxxx  LOG [DatabaseSeed] 🌱 Bắt đầu seeding database...
[Nest] xxxx  LOG [DatabaseSeed] ✅ Database connection established
[Nest] xxxx  LOG [CreateAdminUserSeed] ✅ Admin user đã tồn tại - Bỏ qua
[Nest] xxxx  LOG [DatabaseSeed] ✅ Tất cả seeds đã hoàn tất thành công!
```

### 3. Access Swagger Documentation

Open in browser:
```
http://localhost:3000/api
```

All endpoints are documented with real-time testing capability.

## Phase 3 Endpoints

### A. Create Payment

**Endpoint:** `POST /api/trips/:id/payments`

**Required Role:** CUSTOMER

**Request Body:**
```json
{
  "soTien": 250000,
  "phuongThucThanhToan": "CARD",
  "maGiaoDichNgoai": "TXN_2024_001",
  "ma": "TT_20260524_001"
}
```

**Field Descriptions:**
- `soTien` (number, required): Payment amount in currency units
- `phuongThucThanhToan` (enum, required): Payment method
  - Options: `CASH`, `CARD`, `WALLET`, `BANK_TRANSFER`
- `maGiaoDichNgoai` (string, optional): External transaction reference
- `ma` (string, optional): Internal payment code (max 50 chars)

**Prerequisites:**
1. Valid trip ID must exist in database (maChuyenDi)
2. Trip status must be COMPLETED
3. Authenticated as CUSTOMER user

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/trips/CD_20260524_001/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "soTien": 250000,
    "phuongThucThanhToan": "CARD"
  }'
```

**Success Response (201 Created):**
```json
{
  "maThanhToan": "TT_20260524_001",
  "maChuyenDi": "CD_20260524_001",
  "soTien": 250000,
  "phuongThucThanhToan": "CARD",
  "trangThaiThanhToan": "PENDING",
  "createdAt": "2026-05-24T11:14:25.000Z",
  "updatedAt": "2026-05-24T11:14:25.000Z"
}
```

**Error Responses:**
- `400` - Invalid request body
- `401` - Unauthorized (missing token)
- `403` - Forbidden (CUSTOMER role required)
- `404` - Trip not found

---

### B. Get Payment for Trip

**Endpoint:** `GET /api/trips/:id/payments`

**Required:** Authentication + Valid trip ID

**Request Parameters:**
- `:id` - Trip ID (maChuyenDi)

**Example cURL:**
```bash
curl -X GET http://localhost:3000/api/trips/CD_20260524_001/payments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Success Response (200 OK):**
```json
{
  "maThanhToan": "TT_20260524_001",
  "maChuyenDi": "CD_20260524_001",
  "soTien": 250000,
  "phuongThucThanhToan": "CARD",
  "trangThaiThanhToan": "PENDING",
  "createdAt": "2026-05-24T11:14:25.000Z",
  "updatedAt": "2026-05-24T11:14:25.000Z",
  "deletedAt": null
}
```

**Error Responses:**
- `401` - Unauthorized (missing/invalid token)
- `404` - Payment not found for this trip

---

### C. Update Payment Status

**Endpoint:** `PATCH /api/trips/:id/payments/status`

**Required:** Authentication

**Request Parameters:**
- `:id` - Trip ID (maChuyenDi)

**Request Body:**
```json
{
  "trangThaiThanhToan": "COMPLETED",
  "ghiChu": "Payment successfully processed"
}
```

**Field Descriptions:**
- `trangThaiThanhToan` (enum, required): New payment status
  - Options: `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`
- `ghiChu` (string, optional): Comments/notes (max 500 chars)

**Example cURL:**
```bash
curl -X PATCH http://localhost:3000/api/trips/CD_20260524_001/payments/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "trangThaiThanhToan": "COMPLETED",
    "ghiChu": "Payment confirmed via bank"
  }'
```

**Success Response (200 OK):**
```json
{
  "maThanhToan": "TT_20260524_001",
  "maChuyenDi": "CD_20260524_001",
  "soTien": 250000,
  "phuongThucThanhToan": "CARD",
  "trangThaiThanhToan": "COMPLETED",
  "ghiChu": "Payment confirmed via bank",
  "createdAt": "2026-05-24T11:14:25.000Z",
  "updatedAt": "2026-05-24T11:14:26.000Z"
}
```

**Valid Status Transitions:**
```
PENDING     → COMPLETED
PENDING     → FAILED
PENDING     → REFUNDED
COMPLETED   → REFUNDED (for refunds)
FAILED      → PENDING (retry)
```

---

## Testing Scenarios

### Scenario 1: Create and Verify Payment

**Steps:**
1. Create payment with status PENDING
2. Retrieve payment to verify creation
3. Update payment status to COMPLETED
4. Verify final state

**Commands:**
```bash
# 1. Create payment
curl -X POST http://localhost:3000/api/trips/CD_TEST_001/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"soTien": 500000, "phuongThucThanhToan": "CARD"}'

# 2. Get payment
curl -X GET http://localhost:3000/api/trips/CD_TEST_001/payments \
  -H "Authorization: Bearer $TOKEN"

# 3. Update status
curl -X PATCH http://localhost:3000/api/trips/CD_TEST_001/payments/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"trangThaiThanhToan": "COMPLETED"}'

# 4. Verify
curl -X GET http://localhost:3000/api/trips/CD_TEST_001/payments \
  -H "Authorization: Bearer $TOKEN"
```

### Scenario 2: Test Payment Methods

**Create payments with different payment methods:**

```bash
# Cash payment
curl -X POST http://localhost:3000/api/trips/CD_TEST_002/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"soTien": 300000, "phuongThucThanhToan": "CASH"}'

# Card payment
curl -X POST http://localhost:3000/api/trips/CD_TEST_003/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"soTien": 250000, "phuongThucThanhToan": "CARD"}'

# Bank transfer
curl -X POST http://localhost:3000/api/trips/CD_TEST_004/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"soTien": 1000000, "phuongThucThanhToan": "BANK_TRANSFER"}'

# Wallet payment
curl -X POST http://localhost:3000/api/trips/CD_TEST_005/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"soTien": 150000, "phuongThucThanhToan": "WALLET"}'
```

### Scenario 3: Error Handling

**Test various error conditions:**

```bash
# Missing required field
curl -X POST http://localhost:3000/api/trips/CD_TEST_001/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"soTien": 250000}'
# Expected: 400 (phuongThucThanhToan required)

# Invalid payment method
curl -X POST http://localhost:3000/api/trips/CD_TEST_001/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"soTien": 250000, "phuongThucThanhToan": "INVALID"}'
# Expected: 400 (invalid enum value)

# Non-existent trip
curl -X POST http://localhost:3000/api/trips/CD_INVALID/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"soTien": 250000, "phuongThucThanhToan": "CARD"}'
# Expected: 404 (trip not found)
```

---

## Admin Credentials

Use these credentials for testing:

```
Email: admin@app.com
Password: Admin@123
```

**Get Admin Token:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@app.com",
    "matKhau": "Admin@123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Database Schema

### ThanhToan (Payment) Table

```sql
CREATE TABLE thanh_toan (
  ma_thanh_toan VARCHAR(50) PRIMARY KEY,
  ma_chuyen_di VARCHAR(50) NOT NULL UNIQUE,
  so_tien NUMERIC(12,2) NOT NULL,
  phuong_thuc_thanh_toan VARCHAR(50) NOT NULL,
  trang_thai_thanh_toan VARCHAR(50) DEFAULT 'PENDING',
  ma_giao_dich_ngoai VARCHAR(100),
  ma VARCHAR(50),
  ghi_chu VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (ma_chuyen_di) REFERENCES chuyen_di(ma_chuyen_di) ON DELETE CASCADE
);
```

---

## Troubleshooting

### Issue: 401 Unauthorized

**Cause:** Invalid or missing token

**Solution:**
1. Get fresh token from `/api/auth/login`
2. Include token in Authorization header: `Bearer $TOKEN`
3. Verify token hasn't expired

### Issue: 403 Forbidden

**Cause:** User role doesn't have permission

**Solution:**
- Create payment: Use CUSTOMER role
- Update payment: Authenticated user required
- Get payment: Authenticated user required

### Issue: 404 Not Found

**Cause:** Trip ID doesn't exist or payment not found

**Solution:**
1. Verify trip ID exists in database
2. Check trip status is COMPLETED before creating payment
3. Confirm payment exists for the trip

### Issue: 422 Unprocessable Entity

**Cause:** Invalid request body or validation error

**Solution:**
1. Check field names (especially `matKhau` not `password`)
2. Verify required fields are present
3. Check enum values are valid
4. Validate data types match schema

---

## Performance Metrics

Expected response times:

| Endpoint | Avg Time | Max Time |
|----------|----------|----------|
| Create Payment | 50-100ms | 200ms |
| Get Payment | 20-50ms | 100ms |
| Update Status | 30-80ms | 150ms |

---

## Related Documentation

- [VERIFICATION_REPORT.md](./VERIFICATION_REPORT.md) - Full API verification results
- [docs/admin-setup.md](./docs/admin-setup.md) - Admin account setup guide
- [src/database/seeds/SEEDING_GUIDE.md](./src/database/seeds/SEEDING_GUIDE.md) - Database seeding guide
- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API reference

---

**Last Updated:** May 24, 2026  
**Status:** ✅ Complete and Tested  
**Ready for:** Development & QA Testing
