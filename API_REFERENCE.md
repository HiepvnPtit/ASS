# API Reference - Tài Xế Hộ (Ride-Sharing System)

**Base URL:** `http://localhost:3000/api`  
**Version:** 1.0  
**Date:** May 23, 2026

---

## 📋 Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Vehicles APIs (Customer)](#vehicles-apis-customer)
3. [Trips APIs](#trips-apis)
4. [Drivers APIs](#drivers-apis)
5. [Admin APIs](#admin-apis)
6. [Vehicle Types (LoaiXe)](#vehicle-types-loaixe)
7. [Price List (BangGia)](#price-list-banggia)
8. [File Upload](#file-upload)
9. [Home](#home)

---

## 🔐 Authentication APIs

### 1. Register User
**Endpoint:** `POST /auth/register`

**Description:** Tạo tài khoản mới (Khách hàng, Tài xế, Admin)

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "vaiTro": "CUSTOMER"
}
```

**Response (201 Created):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "vaiTro": "CUSTOMER",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "refresh-token-string"
}
```

**Note:** `vaiTro` (Role) options: `CUSTOMER`, `DRIVER`, `ADMIN`

---

### 2. Login
**Endpoint:** `POST /auth/login`

**Description:** Đăng nhập bằng email và password

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "refresh-token-string",
  "expires_in": 3600,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "vaiTro": "CUSTOMER"
  }
}
```

**JWT Token Contents:**
- `sub` (Subject): User ID
- `email`: User email
- `vaiTro`: User role (CUSTOMER|DRIVER|ADMIN)
- `iat`: Issued at
- `exp`: Expiration (1 hour)

---

## 🚗 Vehicles APIs (Customer)

**Base Path:** `/vehicles`  
**Authentication:** Required (JWT Bearer Token)  
**Role:** `CUSTOMER` only

### 1. Create Vehicle
**Endpoint:** `POST /vehicles`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "soXe": "ABC-12345",
  "loaiXe": "loai-xe-uuid",
  "hangXe": "Toyota",
  "mauXe": "Trắng",
  "namSx": 2023
}
```

**Response (201 Created):**
```json
{
  "id": "vehicle-uuid",
  "soXe": "ABC-12345",
  "loaiXe": { "id": "...", "tenLoaiXe": "Xe 4 chỗ", "giaTheoKm": 50000 },
  "hangXe": "Toyota",
  "mauXe": "Trắng",
  "namSx": 2023,
  "khachHang": "customer-uuid",
  "createdAt": "2026-05-23T22:08:50Z"
}
```

---

### 2. Get My Vehicles
**Endpoint:** `GET /vehicles`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "id": "vehicle-uuid-1",
    "soXe": "ABC-12345",
    "loaiXe": { "id": "...", "tenLoaiXe": "Xe 4 chỗ" },
    "hangXe": "Toyota",
    "mauXe": "Trắng",
    "namSx": 2023
  },
  {
    "id": "vehicle-uuid-2",
    "soXe": "XYZ-67890",
    "loaiXe": { "id": "...", "tenLoaiXe": "Xe 7 chỗ" },
    "hangXe": "Honda",
    "mauXe": "Đen",
    "namSx": 2024
  }
]
```

---

### 3. Get Vehicle Detail
**Endpoint:** `GET /vehicles/:id`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters:**
- `id` (string, required): Vehicle ID

**Response (200 OK):**
```json
{
  "id": "vehicle-uuid",
  "soXe": "ABC-12345",
  "loaiXe": { "id": "...", "tenLoaiXe": "Xe 4 chỗ", "giaTheoKm": 50000 },
  "hangXe": "Toyota",
  "mauXe": "Trắng",
  "namSx": 2023,
  "khachHang": "customer-uuid",
  "createdAt": "2026-05-23T22:08:50Z"
}
```

---

### 4. Update Vehicle
**Endpoint:** `PUT /vehicles/:id`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**URL Parameters:**
- `id` (string, required): Vehicle ID

**Request Body:**
```json
{
  "soXe": "ABC-99999",
  "hangXe": "Toyota Vios",
  "mauXe": "Bạc",
  "namSx": 2024
}
```

**Response (200 OK):**
```json
{
  "id": "vehicle-uuid",
  "soXe": "ABC-99999",
  "hangXe": "Toyota Vios",
  "mauXe": "Bạc",
  "namSx": 2024,
  "updatedAt": "2026-05-23T23:00:00Z"
}
```

---

### 5. Delete Vehicle
**Endpoint:** `DELETE /vehicles/:id`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters:**
- `id` (string, required): Vehicle ID

**Response (200 OK):**
```json
{
  "message": "Xóa xe thành công",
  "id": "vehicle-uuid"
}
```

---

## 🚕 Trips APIs

**Base Path:** `/trips`  
**Authentication:** Required (JWT Bearer Token)

### 1. Create Trip (Booking)
**Endpoint:** `POST /trips`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "viTriDon": {
    "kinh_do": 20.9851,
    "vi_do": 105.7625,
    "dia_chi": "123 Nguyen Hue, District 1, HCMC"
  },
  "viTriTra": {
    "kinh_do": 20.9749,
    "vi_do": 105.7850,
    "dia_chi": "Saigon Center, District 1, HCMC"
  },
  "loaiXeMuonSuDung": "loai-xe-uuid",
  "quangDuongKm": 5,
  "soKhachNoi": 1,
  "ghiChu": "Hãy tới sớm 5 phút"
}
```

**Response (201 Created):**
```json
{
  "id": "trip-uuid",
  "khachHang": { "id": "...", "email": "customer@example.com" },
  "taiXe": null,
  "xe": null,
  "viTriDon": { "kinh_do": 20.9851, "vi_do": 105.7625, "dia_chi": "..." },
  "viTriTra": { "kinh_do": 20.9749, "vi_do": 105.7850, "dia_chi": "..." },
  "loaiXeMuonSuDung": { "id": "...", "tenLoaiXe": "Xe 4 chỗ" },
  "quangDuongKm": 5,
  "soKhachNoi": 1,
  "soTienChuyenDi": 250000,
  "trangThai": "PENDING_DRIVER",
  "createdAt": "2026-05-23T22:08:50Z"
}
```

---

### 2. Estimate Trip Price
**Endpoint:** `GET /trips/estimate`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN> (Optional for public access)
```

**Query Parameters:**
- `ma_loai_xe` (string, required): Vehicle Type ID
- `quang_duong_km` (number, optional): Distance in KM (default: 0)

**Example:**
```
GET /trips/estimate?ma_loai_xe=uuid-123&quang_duong_km=5
```

**Response (200 OK):**
```json
{
  "loaiXe": {
    "id": "uuid-123",
    "tenLoaiXe": "Xe 4 chỗ",
    "giaTheoKm": 50000
  },
  "quangDuongKm": 5,
  "giaThangTien": 250000,
  "currency": "VND"
}
```

---

### 3. Find Available Drivers
**Endpoint:** `GET /trips/matching`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `ma_loai_xe` (string, required): Vehicle Type ID

**Example:**
```
GET /trips/matching?ma_loai_xe=uuid-123
```

**Response (200 OK):**
```json
[
  {
    "id": "driver-uuid-1",
    "hoTen": "Nguyễn Văn A",
    "email": "driver1@example.com",
    "trangThaiLamViec": "ONLINE",
    "viTriHienTai": {
      "kinh_do": 20.9851,
      "vi_do": 105.7625
    },
    "xeCanLai": {
      "id": "xe-uuid-1",
      "soXe": "ABC-12345",
      "loaiXe": { "tenLoaiXe": "Xe 4 chỗ" }
    },
    "danhGiaHeartTB": 4.8
  }
]
```

---

### 4. Cancel Trip
**Endpoint:** `POST /trips/:id/cancel`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**URL Parameters:**
- `id` (string, required): Trip ID

**Request Body:**
```json
{
  "lyDoHuy": "Tôi thay đổi ý định"
}
```

**Response (200 OK):**
```json
{
  "id": "trip-uuid",
  "trangThai": "CANCELLED",
  "lyDoHuy": "Tôi thay đổi ý định",
  "cancelledAt": "2026-05-23T23:00:00Z"
}
```

---

### 5. Create Review (After Trip)
**Endpoint:** `POST /trips/:id/reviews`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**URL Parameters:**
- `id` (string, required): Trip ID

**Request Body:**
```json
{
  "soSao": 5,
  "noiDung": "Tài xế rất thân thiện, xe sạch sẽ"
}
```

**Response (201 Created):**
```json
{
  "id": "review-uuid",
  "chuyenDi": "trip-uuid",
  "khachHang": "customer-uuid",
  "soSao": 5,
  "noiDung": "Tài xế rất thân thiện, xe sạch sẽ",
  "createdAt": "2026-05-23T23:30:00Z"
}
```

---

### 6. Accept Trip (Driver)
**Endpoint:** `POST /trips/:id/accept`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters:**
- `id` (string, required): Trip ID

**Role:** `DRIVER` only

**Response (200 OK):**
```json
{
  "id": "trip-uuid",
  "taiXe": { "id": "driver-uuid", "hoTen": "Nguyễn Văn A" },
  "xe": { "id": "xe-uuid", "soXe": "ABC-12345" },
  "trangThai": "ACCEPTED",
  "acceptedAt": "2026-05-23T22:15:00Z"
}
```

---

### 7. Update Trip Status (Driver)
**Endpoint:** `PATCH /trips/:id/status`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**URL Parameters:**
- `id` (string, required): Trip ID

**Request Body:**
```json
{
  "trangThai": "ARRIVED"
}
```

**Status Options:**
- `PENDING_DRIVER` - Chờ tài xế chấp nhận
- `ACCEPTED` - Tài xế đã chấp nhận
- `ARRIVED` - Tài xế đã tới điểm đón
- `STARTED` - Chuyến đi đã bắt đầu
- `COMPLETED` - Chuyến đi hoàn thành
- `CANCELLED` - Chuyến đi bị hủy

**Response (200 OK):**
```json
{
  "id": "trip-uuid",
  "trangThai": "ARRIVED",
  "updatedAt": "2026-05-23T22:20:00Z"
}
```

---

### 8. Vehicle Handover (Delivery)
**Endpoint:** `POST /trips/handover`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "chuyenDiId": "trip-uuid",
  "mauXeThuc": "Trắng",
  "hangXeThuc": "Toyota",
  "soXeThuc": "ABC-12345",
  "hoTenNguoiNhan": "Khách hàng",
  "ghiChu": "Xe bị xước tại cánh cửa"
}
```

**Response (200 OK):**
```json
{
  "id": "handover-uuid",
  "chuyenDi": "trip-uuid",
  "hoTenNguoiNhan": "Khách hàng",
  "soXeThuc": "ABC-12345",
  "ghiChu": "Xe bị xước tại cánh cửa",
  "handoverAt": "2026-05-23T22:45:00Z"
}
```

---

## 🚗 Drivers APIs

**Base Path:** `/drivers`  
**Authentication:** Required (JWT Bearer Token)  
**Role:** `DRIVER` only

### 1. Get Driver Profile
**Endpoint:** `GET /drivers/me`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "id": "driver-uuid",
  "hoTen": "Nguyễn Văn A",
  "email": "driver@example.com",
  "sdt": "0901234567",
  "cccd": "123456789",
  "trangThai": "ACTIVE",
  "trangThaiLamViec": "OFFLINE",
  "xeCanLai": {
    "id": "xe-uuid",
    "soXe": "ABC-12345",
    "loaiXe": { "id": "...", "tenLoaiXe": "Xe 4 chỗ" }
  },
  "danhGiaHeartTB": 4.8,
  "createdAt": "2026-05-23T20:00:00Z"
}
```

---

### 2. Update Driver Status
**Endpoint:** `PATCH /drivers/me/status`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "trangThaiLamViec": "ONLINE"
}
```

**Status Options:**
- `ONLINE` - Tài xế sẵn sàng nhận cuốc
- `OFFLINE` - Tài xế ngưng làm việc

**Response (200 OK):**
```json
{
  "id": "driver-uuid",
  "trangThaiLamViec": "ONLINE",
  "updatedAt": "2026-05-23T23:00:00Z"
}
```

---

### 3. Update Driver Location (GPS)
**Endpoint:** `POST /drivers/me/locations`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "kinh_do": 20.9851,
  "vi_do": 105.7625,
  "huong": 180
}
```

**Response (201 Created):**
```json
{
  "id": "location-uuid",
  "taiXe": "driver-uuid",
  "kinh_do": 20.9851,
  "vi_do": 105.7625,
  "huong": 180,
  "recordedAt": "2026-05-23T23:05:00Z"
}
```

---

## 👮 Admin APIs

**Base Path:** `/admin`  
**Authentication:** Required (JWT Bearer Token)  
**Role:** `ADMIN` only

### 1. Get Pending Drivers
**Endpoint:** `GET /admin/drivers/pending`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Limit per page (default: 20)

**Example:**
```
GET /admin/drivers/pending?page=1&limit=20
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "driver-uuid-1",
      "hoTen": "Nguyễn Văn A",
      "email": "driver1@example.com",
      "sdt": "0901234567",
      "cccd": "123456789",
      "trangThai": "PENDING",
      "createdAt": "2026-05-23T20:00:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 2. Approve Driver
**Endpoint:** `POST /admin/drivers/:id/approve`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**URL Parameters:**
- `id` (string, required): Driver ID

**Request Body:**
```json
{
  "lyDo": "Hồ sơ hợp lệ"
}
```

**Response (200 OK):**
```json
{
  "id": "driver-uuid",
  "hoTen": "Nguyễn Văn A",
  "trangThai": "ACTIVE",
  "approvedAt": "2026-05-23T23:00:00Z"
}
```

---

### 3. Get Complaints List
**Endpoint:** `GET /admin/complaints`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Limit per page (default: 20)

**Example:**
```
GET /admin/complaints?page=1&limit=20
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "complaint-uuid-1",
      "tieuDe": "Tài xế không thân thiện",
      "noiDung": "Tài xế nói năng thô lỗ với khách hàng",
      "trangThai": "NEW",
      "chuyenDi": "trip-uuid",
      "khachHang": { "id": "...", "hoTen": "Khách A" },
      "createdAt": "2026-05-23T22:30:00Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 4. Get Dashboard Metrics
**Endpoint:** `GET /admin/dashboard/metrics`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "totalUsers": 150,
  "totalDrivers": 45,
  "totalCustomers": 105,
  "totalTrips": 320,
  "completedTrips": 300,
  "cancelledTrips": 20,
  "averageRating": 4.65,
  "totalRevenue": 48000000,
  "todayTrips": 12,
  "onlineDrivers": 8,
  "pendingComplaints": 3
}
```

---

## 🚙 Vehicle Types (LoaiXe)

**Base Path:** `/loai-xe`

### 1. Create Vehicle Type
**Endpoint:** `POST /loai-xe`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "tenLoaiXe": "Xe 4 chỗ",
  "giaTheoKm": 50000,
  "giaQuiDinh": 30000,
  "moTa": "Xe taxi 4 chỗ tiêu chuẩn"
}
```

**Response (201 Created):**
```json
{
  "id": "loai-xe-uuid",
  "tenLoaiXe": "Xe 4 chỗ",
  "giaTheoKm": 50000,
  "giaQuiDinh": 30000,
  "moTa": "Xe taxi 4 chỗ tiêu chuẩn",
  "createdAt": "2026-05-23T22:08:50Z"
}
```

---

### 2. Get All Vehicle Types
**Endpoint:** `GET /loai-xe`

**Headers:**
```
Content-Type: application/json
```

**Response (200 OK):**
```json
[
  {
    "id": "loai-xe-uuid-1",
    "tenLoaiXe": "Xe 4 chỗ",
    "giaTheoKm": 50000,
    "giaQuiDinh": 30000,
    "moTa": "Xe taxi 4 chỗ tiêu chuẩn"
  },
  {
    "id": "loai-xe-uuid-2",
    "tenLoaiXe": "Xe 7 chỗ",
    "giaTheoKm": 70000,
    "giaQuiDinh": 40000,
    "moTa": "Xe van 7 chỗ"
  }
]
```

---

### 3. Get Vehicle Type Detail
**Endpoint:** `GET /loai-xe/:id`

**URL Parameters:**
- `id` (string, required): Vehicle Type ID

**Response (200 OK):**
```json
{
  "id": "loai-xe-uuid",
  "tenLoaiXe": "Xe 4 chỗ",
  "giaTheoKm": 50000,
  "giaQuiDinh": 30000,
  "moTa": "Xe taxi 4 chỗ tiêu chuẩn"
}
```

---

### 4. Update Vehicle Type
**Endpoint:** `PUT /loai-xe/:id`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**URL Parameters:**
- `id` (string, required): Vehicle Type ID

**Request Body:**
```json
{
  "tenLoaiXe": "Xe 4 chỗ Deluxe",
  "giaTheoKm": 60000,
  "giaQuiDinh": 35000
}
```

**Response (200 OK):**
```json
{
  "id": "loai-xe-uuid",
  "tenLoaiXe": "Xe 4 chỗ Deluxe",
  "giaTheoKm": 60000,
  "giaQuiDinh": 35000,
  "updatedAt": "2026-05-23T23:00:00Z"
}
```

---

### 5. Delete Vehicle Type
**Endpoint:** `DELETE /loai-xe/:id`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters:**
- `id` (string, required): Vehicle Type ID

**Response (200 OK):**
```json
{
  "message": "Vehicle type deleted successfully",
  "id": "loai-xe-uuid"
}
```

---

## 💰 Price List (BangGia)

**Base Path:** `/bang-gia`

### 1. Create Price Entry
**Endpoint:** `POST /bang-gia`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "loaiXe": "loai-xe-uuid",
  "dienTichTu": 0,
  "dienTichDen": 5,
  "gia": 50000
}
```

**Response (201 Created):**
```json
{
  "id": "bang-gia-uuid",
  "loaiXe": { "id": "...", "tenLoaiXe": "Xe 4 chỗ" },
  "dienTichTu": 0,
  "dienTichDen": 5,
  "gia": 50000,
  "createdAt": "2026-05-23T22:08:50Z"
}
```

---

### 2. Get All Price Entries
**Endpoint:** `GET /bang-gia`

**Response (200 OK):**
```json
[
  {
    "id": "bang-gia-uuid-1",
    "loaiXe": { "id": "...", "tenLoaiXe": "Xe 4 chỗ" },
    "dienTichTu": 0,
    "dienTichDen": 5,
    "gia": 50000
  },
  {
    "id": "bang-gia-uuid-2",
    "loaiXe": { "id": "...", "tenLoaiXe": "Xe 4 chỗ" },
    "dienTichTu": 5,
    "dienTichDen": 10,
    "gia": 100000
  }
]
```

---

### 3. Get Price Entry Detail
**Endpoint:** `GET /bang-gia/:id`

**URL Parameters:**
- `id` (string, required): Price Entry ID

**Response (200 OK):**
```json
{
  "id": "bang-gia-uuid",
  "loaiXe": { "id": "...", "tenLoaiXe": "Xe 4 chỗ" },
  "dienTichTu": 0,
  "dienTichDen": 5,
  "gia": 50000
}
```

---

### 4. Update Price Entry
**Endpoint:** `PUT /bang-gia/:id`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**URL Parameters:**
- `id` (string, required): Price Entry ID

**Request Body:**
```json
{
  "gia": 55000
}
```

**Response (200 OK):**
```json
{
  "id": "bang-gia-uuid",
  "loaiXe": { "id": "...", "tenLoaiXe": "Xe 4 chỗ" },
  "dienTichTu": 0,
  "dienTichDen": 5,
  "gia": 55000,
  "updatedAt": "2026-05-23T23:00:00Z"
}
```

---

### 5. Delete Price Entry
**Endpoint:** `DELETE /bang-gia/:id`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters:**
- `id` (string, required): Price Entry ID

**Response (200 OK):**
```json
{
  "message": "Price entry deleted successfully",
  "id": "bang-gia-uuid"
}
```

---

## 📁 File Upload

**Base Path:** `/uploads`

### Upload Image File
**Endpoint:** `POST /uploads/files`

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (binary, required): Image file (jpg, jpeg, png, gif, webp)
  - Max size: 5MB
  - Allowed types: image/jpeg, image/png, image/gif, image/webp

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/uploads/files \
  -F "file=@/path/to/image.jpg"
```

**Response (201 Created):**
```json
{
  "message": "Upload file thành công",
  "filename": "file-1716520530123-a1b2c3d4.jpg",
  "originalName": "image.jpg",
  "url": "/uploads/file-1716520530123-a1b2c3d4.jpg",
  "size": 245678,
  "mimeType": "image/jpeg"
}
```

---

## 🏠 Home

### Get App Info
**Endpoint:** `GET /`

**Response (200 OK):**
```json
{
  "name": "Tài Xế Hộ - Ride Sharing System",
  "version": "1.0.0",
  "description": "A comprehensive ride-sharing application with customer, driver, and admin tiers",
  "environment": "development",
  "database": "PostgreSQL"
}
```

---

## 🔑 Authentication & Authorization

### JWT Token Format

All protected endpoints require a JWT Bearer token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Payload

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "vaiTro": "CUSTOMER",
  "iat": 1716520530,
  "exp": 1716524130
}
```

### Roles

- **CUSTOMER** - Khách hàng: Book trips, manage vehicles, review trips
- **DRIVER** - Tài xế: Accept trips, update location, view profile
- **ADMIN** - Quản trị viên: Manage drivers, view complaints, dashboard metrics

### Role-Based Access Control

Each endpoint is protected with specific role requirements. Attempting to access an endpoint without proper role returns `403 Forbidden`.

---

## 📊 Summary

| Module | Endpoints | Auth Required | Roles |
|--------|-----------|---------------|-------|
| Auth | 2 | No | None |
| Vehicles | 5 | Yes | CUSTOMER |
| Trips | 8 | Yes | CUSTOMER, DRIVER |
| Drivers | 3 | Yes | DRIVER |
| Admin | 4 | Yes | ADMIN |
| LoaiXe | 5 | Partial | Public (GET), Auth (POST/PUT/DELETE) |
| BangGia | 5 | Partial | Public (GET), Auth (POST/PUT/DELETE) |
| Uploads | 1 | No | None |
| Home | 1 | No | None |

**Total: 33 API Endpoints**

---

## Error Responses

All endpoints follow standard HTTP status codes and error format:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid request body",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "vaiTro": "CUSTOMER"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'

# Get vehicles with token
curl -X GET http://localhost:3000/api/vehicles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Import this API reference as OpenAPI 3.0 specification
2. Set `{{base_url}}` variable to `http://localhost:3000/api`
3. Set `{{token}}` variable to JWT token from login response
4. Use Authorization header: `Bearer {{token}}`

---

**Last Updated:** May 23, 2026  
**API Version:** 1.0
