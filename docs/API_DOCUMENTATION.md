# API Documentation - Designated Driver Platform

Đây là tài liệu hướng dẫn chi tiết cách hoạt động của các API trong hệ thống Designated Driver Platform.

---

## Mục Lục

1. [Authentication APIs](#authentication-apis)
2. [Users APIs](#users-apis)
3. [Vehicle Type APIs (Loại Xe)](#vehicle-type-apis)
4. [Price List APIs (Bảng Giá)](#price-list-apis)
5. [Trips APIs](#trips-apis)
6. [Social Authentication](#social-authentication)
7. [Response Format](#response-format)
8. [Authentication & Authorization](#authentication--authorization)

---

## Authentication APIs

Các API phục vụ cho quá trình xác thực người dùng.

### 1. Simple Auth Controller (`/auth`)

Đây là API đơn giản dành cho đăng ký và đăng nhập cơ bản.

#### Đăng Ký Người Dùng
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "maTaiXe?": "TX001",  // Optional: Mã tài xế (driver code)
  "soGiayPhepLaiXe?": "123456",  // Optional: License plate number
  "canCuocCongDan?": "012345678",  // Optional: Citizen ID
  "hanGiayPhepLaiXe?": "2025-12-31"  // Optional: License expiry date
}

Response (201): {
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "taiXe?": {  // Only if driver fields provided
    "maTaiXe": "TX001",
    "trangThaiHoatDong": "OFFLINE"
  }
}
```

#### Đăng Nhập
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response (200): {
  "user": { ... },
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

---

### 2. Main Auth Controller (`/v1/auth`)

API xác thực nâng cao hỗ trợ xác nhận email, đặt lại mật khẩu, v.v.

#### Đăng Nhập Bằng Email
```
POST /v1/auth/email/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response (200): LoginResponseDto {
  "user": { /* User object */ },
  "token": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### Đăng Ký Bằng Email
```
POST /v1/auth/email/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "firstName": "Jane",
  "lastName": "Smith"
}

Response (204): No Content
- Email xác nhận sẽ được gửi tới địa chỉ email của người dùng
```

#### Xác Nhận Email
```
POST /v1/auth/email/confirm
Content-Type: application/json

{
  "hash": "confirmation_hash_from_email"
}

Response (204): No Content
- Tài khoản sẽ được kích hoạt
```

#### Yêu Cầu Email Xác Nhận Mới
```
POST /v1/auth/email/confirm/new
Content-Type: application/json

{
  "hash": "new_confirmation_hash"
}

Response (204): No Content
```

#### Quên Mật Khẩu
```
POST /v1/auth/forgot/password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response (204): No Content
- Email với hướng dẫn đặt lại mật khẩu sẽ được gửi
```

#### Đặt Lại Mật Khẩu
```
POST /v1/auth/reset/password
Content-Type: application/json

{
  "hash": "reset_hash_from_email",
  "password": "newPassword123"
}

Response (204): No Content
- Mật khẩu sẽ được cập nhật
```

#### Lấy Thông Tin Người Dùng Hiện Tại
```
GET /v1/auth/me
Authorization: Bearer jwt_token

Response (200): User {
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-05-22T10:00:00Z"
}
```

---

## Users APIs

Quản lý thông tin người dùng trong hệ thống.

### Danh Sách Người Dùng
```
GET /v1/users?page=1&limit=10
Authorization: Bearer admin_jwt_token
Required Role: ADMIN

Response (200): {
  "data": [ /* User array */ ],
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

### Tạo Người Dùng Mới
```
POST /v1/users
Authorization: Bearer admin_jwt_token
Content-Type: application/json
Required Role: ADMIN

{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "New",
  "lastName": "User",
  "role": "USER",
  "status": "ACTIVE"
}

Response (201): User object
```

### Lấy Thông Tin Chi Tiết Người Dùng
```
GET /v1/users/:id
Authorization: Bearer admin_jwt_token
Required Role: ADMIN

Response (200): User {
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER",
  "status": "ACTIVE"
}
```

### Cập Nhật Thông Tin Người Dùng
```
PATCH /v1/users/:id
Authorization: Bearer admin_jwt_token
Content-Type: application/json
Required Role: ADMIN

{
  "firstName?": "Updated",
  "lastName?": "Name",
  "email?": "newemail@example.com"
}

Response (200): Updated User object
```

### Xóa Người Dùng
```
DELETE /v1/users/:id
Authorization: Bearer admin_jwt_token
Required Role: ADMIN

Response (204): No Content
```

---

## Vehicle Type APIs

Quản lý các loại xe có sẵn trong hệ thống.

### Lấy Danh Sách Loại Xe
```
GET /loai-xe

Response (200): [
  {
    "maLoaiXe": "LX001",
    "soCho": 4,
    "hopSo": "Tự động",
    "phanKhuc": "Xe du lịch"
  },
  ...
]
```

### Lấy Chi Tiết Loại Xe
```
GET /loai-xe/:id

Response (200): {
  "maLoaiXe": "LX001",
  "soCho": 4,
  "hopSo": "Tự động",
  "phanKhuc": "Xe du lịch"
}
```

### Tạo Loại Xe Mới
```
POST /loai-xe
Authorization: Bearer admin_jwt_token
Content-Type: application/json
Required Role: ADMIN

{
  "maLoaiXe": "LX002",
  "soCho": 7,
  "hopSo": "Tự động",
  "phanKhuc": "Xe 7 chỗ"
}

Response (201): Created LoaiXe object
```

### Cập Nhật Loại Xe
```
PUT /loai-xe/:id
Authorization: Bearer admin_jwt_token
Content-Type: application/json
Required Role: ADMIN

{
  "soCho?": 8,
  "hopSo?": "Tự động",
  "phanKhuc?": "Xe 8 chỗ"
}

Response (200): Updated LoaiXe object
```

### Xóa Loại Xe
```
DELETE /loai-xe/:id
Authorization: Bearer admin_jwt_token
Required Role: ADMIN

Response (204): No Content
```

---

## Price List APIs

Quản lý bảng giá cước dịch vụ.

### Lấy Danh Sách Bảng Giá
```
GET /bang-gia

Response (200): [
  {
    "maBangGia": "BG001",
    "maLoaiXe": "LX001",
    "giaCoban": 50000,
    "giaKmTiepTheo": 15000,
    "giaPhutCho": 2000
  },
  ...
]
```

### Lấy Chi Tiết Bảng Giá
```
GET /bang-gia/:id

Response (200): {
  "maBangGia": "BG001",
  "maLoaiXe": "LX001",
  "giaCoban": 50000,
  "giaKmTiepTheo": 15000,
  "giaPhutCho": 2000
}
```

### Tạo Bảng Giá Mới
```
POST /bang-gia
Authorization: Bearer admin_jwt_token
Content-Type: application/json
Required Role: ADMIN

{
  "maBangGia": "BG002",
  "maLoaiXe": "LX002",
  "giaCoban": 70000,
  "giaKmTiepTheo": 18000,
  "giaPhutCho": 2500
}

Response (201): Created BangGia object
```

### Cập Nhật Bảng Giá
```
PUT /bang-gia/:id
Authorization: Bearer admin_jwt_token
Content-Type: application/json
Required Role: ADMIN

{
  "giaCoban?": 75000,
  "giaKmTiepTheo?": 20000,
  "giaPhutCho?": 3000
}

Response (200): Updated BangGia object
```

### Xóa Bảng Giá
```
DELETE /bang-gia/:id
Authorization: Bearer admin_jwt_token
Required Role: ADMIN

Response (204): No Content
```

---

## Trips APIs

Quản lý các chuyến đi (booking) của khách hàng.

### Tạo Chuyến Đi (Booking)
```
POST /trips
Authorization: Bearer customer_jwt_token
Content-Type: application/json
Required Role: CUSTOMER

{
  "maLoaiXe": "LX001",
  "diemDon": "123 Main St",
  "diemDen": "456 Park Ave",
  "viDoDon": 10.7769,
  "kinhDoDon": 106.6966,
  "viDoDen": 10.8000,
  "kinhDoDen": 106.7000,
  "quangDuongKm": 5.2,
  "ghuChuAnhChup?": "some_notes"
}

Response (201): Trip {
  "maChuyenDi": "CD001",
  "maKhachHang": "KH001",
  "maXe": "XE001",
  "diemDon": "123 Main St",
  "diemDen": "456 Park Ave",
  "trangThaiChuyenDi": "PENDING",
  "thoiGianDat": "2024-05-22T10:30:00Z"
}
```

### Ước Tính Giá Cước
```
GET /trips/estimate?ma_loai_xe=LX001&quang_duong_km=5.2

Response (200): {
  "giaCoban": 50000,
  "giaQuangDuong": 15000,
  "tongCong": 65000,
  "maLoaiXe": "LX001",
  "quangDuongKm": 5.2
}
```

### Tìm Tài Xế Sẵn Sàng
```
GET /trips/matching?ma_loai_xe=LX001
Authorization: Bearer customer_jwt_token
Required Role: CUSTOMER

Response (200): [
  {
    "maTaiXe": "TX001",
    "ten": "Nguyễn Văn A",
    "diemDanhGia": 4.8,
    "soChuyenDi": 245,
    "trangThaiHoatDong": "ONLINE"
  },
  ...
]
```

### Bàn Giao Xe (Handover)
```
POST /trips/handover
Authorization: Bearer driver_jwt_token
Content-Type: application/json
Required Role: DRIVER

{
  "maChuyenDi": "CD001",
  "anhChungThucId?": "photo_id",
  "ghiChuBanGiao?": "Vehicle condition notes"
}

Response (200): {
  "maBienBan": "BB001",
  "maChuyenDi": "CD001",
  "maTaiXe": "TX001",
  "maKhachHang": "KH001",
  "trangThaiGiaoDich": "COMPLETED",
  "thoiGianBanGiao": "2024-05-22T11:00:00Z"
}
```

---

## Social Authentication

Hỗ trợ đăng nhập thông qua các nền tảng xã hội.

### Google Authentication
```
GET /v1/auth/google/login

Redirect: Google OAuth consent screen

Callback: /v1/auth/google/callback?code=...
Response (302 redirect): Redirect to app with JWT token
```

### Facebook Authentication
```
GET /v1/auth/facebook/login

Redirect: Facebook OAuth consent screen

Callback: /v1/auth/facebook/callback?code=...
Response (302 redirect): Redirect to app with JWT token
```

### Apple Authentication
```
GET /v1/auth/apple/login

Redirect: Apple OAuth consent screen

Callback: /v1/auth/apple/callback
Response (302 redirect): Redirect to app with JWT token
```

---

## Response Format

Tất cả API sử dụng format response chuẩn:

### Success Response
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Email must be valid"
    }
  ]
}
```

### Pagination Response
```json
{
  "data": [ /* Array of items */ ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## Authentication & Authorization

### JWT Token Structure

```
Header: Authorization: Bearer <jwt_token>
```

### Token Claims
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "ADMIN|USER|DRIVER|CUSTOMER",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Roles & Permissions

| Role | Permissions |
|------|-------------|
| **ADMIN** | Tất cả quyền - quản lý users, loại xe, bảng giá |
| **USER** | Cập nhật thông tin cá nhân |
| **DRIVER** | Xem chuyến đi được giao, bàn giao xe |
| **CUSTOMER** | Tạo booking, xem lịch sử chuyến đi |

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request thành công |
| 201 | Created - Resource được tạo thành công |
| 204 | No Content - Request thành công, không có dữ liệu trả về |
| 400 | Bad Request - Lỗi validation input |
| 401 | Unauthorized - Token không hợp lệ hoặc hết hạn |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Resource không tồn tại |
| 500 | Internal Server Error - Lỗi server |

---

## Environment Variables for API

```bash
# Auth
JWT_SECRET=your_jwt_secret_key
AUTH_JWT_TOKEN_EXPIRES_IN=1h
AUTH_REFRESH_TOKEN_EXPIRES_IN=7d

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=designated_driver_db

# Social Auth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_secret

# Mail
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

---

## Testing APIs with cURL

### Register a new user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### Get current user (with token)
```bash
curl -X GET http://localhost:3000/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### List vehicle types
```bash
curl -X GET http://localhost:3000/loai-xe
```

---

## Error Handling Examples

### Invalid Email Format
```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "BAD_REQUEST",
  "details": [
    {
      "field": "email",
      "message": "email must be an email"
    }
  ]
}
```

### User Not Found
```json
{
  "statusCode": 404,
  "message": "Not Found",
  "error": "USER_NOT_FOUND"
}
```

### Insufficient Permissions
```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "INSUFFICIENT_PERMISSIONS",
  "details": "Required role: ADMIN"
}
```

---

## Notes

- Tất cả timestamps được trả về ở định dạng ISO 8601 (UTC)
- Password phải tối thiểu 8 ký tự, chứa chữ hoa, chữ thường, số và ký tự đặc biệt
- Email phải duy nhất trong hệ thống
- JWT token hết hạn sau 1 giờ, dùng refresh token để lấy token mới
- Các API liên quan đến driver/customer yêu cầu xác thực JWT token

---

**Last Updated:** May 22, 2024
**API Version:** v1.0
