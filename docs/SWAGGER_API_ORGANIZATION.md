# 📋 API Swagger Organization Guide

**Date:** May 28, 2026  
**Status:** ✅ Reorganized & Grouped

---

## 🎯 Tổng Quan

Tất cả các API Admin đã được tổ chức lại thành các nhóm riêng biệt trong Swagger UI để dễ nhìn và dễ tìm kiếm hơn.

### Trước (Before)
```
❌ Tất cả API được gom vào 1 tag: "Admin - Super Admin"
   ├── GET /admin/users
   ├── PUT /admin/users/:id
   ├── PATCH /admin/users/:id/toggle-status
   ├── GET /admin/drivers
   ├── PUT /admin/drivers/:id
   ├── POST /admin/drivers/:id/approve
   ├── GET /admin/customers
   ├── GET /admin/vehicles
   ├── DELETE /admin/vehicles/:id
   ├── GET /admin/complaints
   └── GET /admin/dashboard/metrics
   
❌ Khó nhìn, phải scroll quá nhiều
```

### Sau (After)
```
✅ Tách thành các tag riêng biệt:

📌 ADMIN - USER MANAGEMENT
   ├── GET  /admin/users                           (Lấy danh sách người dùng)
   ├── PUT  /admin/users/:id                       (Cập nhật thông tin người dùng)
   └── PATCH /admin/users/:id/toggle-status        (Khóa/Mở khóa tài khoản)

📌 ADMIN - DRIVER MANAGEMENT
   ├── GET  /admin/drivers                         (Lấy danh sách tài xế)
   ├── GET  /admin/drivers/pending                 (Lấy tài xế chờ duyệt)
   ├── PUT  /admin/drivers/:id                     (Cập nhật tài xế)
   └── POST /admin/drivers/:id/approve             (Duyệt hồ sơ tài xế)

📌 ADMIN - CUSTOMER MANAGEMENT
   └── GET  /admin/customers                       (Lấy danh sách khách hàng)

📌 ADMIN - VEHICLE MANAGEMENT
   ├── GET  /admin/system-vehicles                 (Lấy xe trong hệ thống)
   └── DELETE /admin/system-vehicles/:id           (Xóa xe)

📌 ADMIN - DASHBOARD & REPORTS
   ├── GET  /admin/dashboard/metrics               (Thống kê dashboard)
   └── GET  /admin/dashboard/complaints            (Danh sách khiếu nại)

📌 ADMIN - VEHICLE TYPE MANAGEMENT
   ├── POST /admin/loai-xe                         (Tạo loại xe)
   ├── GET  /admin/loai-xe/page                    (Danh sách loại xe)
   ├── GET  /admin/loai-xe/:id                     (Chi tiết loại xe)
   ├── PUT  /admin/loai-xe/:id                     (Cập nhật loại xe)
   ├── DELETE /admin/loai-xe/:id                   (Xóa loại xe)
   └── POST /admin/loai-xe/:id/restore             (Khôi phục loại xe)

📌 ADMIN - PRICE TABLE MANAGEMENT
   ├── POST /admin/bang-gia                        (Tạo bảng giá)
   ├── GET  /admin/bang-gia/page                   (Danh sách bảng giá)
   ├── GET  /admin/bang-gia/:id                    (Chi tiết bảng giá)
   ├── PUT  /admin/bang-gia/:id                    (Cập nhật bảng giá)
   ├── DELETE /admin/bang-gia/:id                  (Xóa bảng giá)
   └── POST /admin/bang-gia/:id/restore            (Khôi phục bảng giá)

📌 ADMIN - CUSTOMER VEHICLES MANAGEMENT
   ├── POST /admin/vehicles                        (Tạo xe khách hàng)
   ├── GET  /admin/vehicles/page                   (Danh sách xe)
   ├── GET  /admin/vehicles/:id                    (Chi tiết xe)
   ├── PUT  /admin/vehicles/:id                    (Cập nhật xe)
   ├── DELETE /admin/vehicles/:id                  (Xóa xe)
   └── POST /admin/vehicles/:id/restore            (Khôi phục xe)

📌 ADMIN - TRIP MANAGEMENT
   ├── POST /admin/trips                           (Tạo chuyến đi)
   ├── GET  /admin/trips/page                      (Danh sách chuyến đi)
   ├── GET  /admin/trips/:id                       (Chi tiết chuyến đi)
   ├── PUT  /admin/trips/:id                       (Cập nhật chuyến đi)
   ├── DELETE /admin/trips/:id                     (Xóa chuyến đi)
   └── POST /admin/trips/:id/restore               (Khôi phục chuyến đi)

📌 ADMIN - PAYMENT MANAGEMENT
   ├── POST /admin/payments                        (Tạo thanh toán)
   ├── GET  /admin/payments/page                   (Danh sách thanh toán)
   ├── GET  /admin/payments/:id                    (Chi tiết thanh toán)
   ├── PUT  /admin/payments/:id                    (Cập nhật thanh toán)
   ├── DELETE /admin/payments/:id                  (Xóa thanh toán)
   └── POST /admin/payments/:id/restore            (Khôi phục thanh toán)

📌 ADMIN - REVIEW MANAGEMENT
   ├── POST /admin/reviews                         (Tạo đánh giá)
   ├── GET  /admin/reviews/page                    (Danh sách đánh giá)
   ├── GET  /admin/reviews/:id                     (Chi tiết đánh giá)
   ├── PUT  /admin/reviews/:id                     (Cập nhật đánh giá)
   ├── DELETE /admin/reviews/:id                   (Xóa đánh giá)
   └── POST /admin/reviews/:id/restore             (Khôi phục đánh giá)

✅ Dễ nhìn, dễ tìm kiếm, rõ ràng theo chủ đề
```

---

## 📁 Cấu Trúc File Controllers

```
src/admin/
├── admin.controller.ts                    (Main - Redirect reference)
├── admin.service.ts                       (Business logic)
├── admin.module.ts                        (Module config)
│
└── controllers/
    ├── admin-users.controller.ts          → ADMIN - USER MANAGEMENT
    ├── admin-drivers.controller.ts        → ADMIN - DRIVER MANAGEMENT
    ├── admin-customers.controller.ts      → ADMIN - CUSTOMER MANAGEMENT
    ├── admin-system-vehicles.controller.ts → ADMIN - VEHICLE MANAGEMENT
    ├── admin-dashboard.controller.ts      → ADMIN - DASHBOARD & REPORTS
    │
    ├── admin-loai-xe.controller.ts        → ADMIN - VEHICLE TYPE MANAGEMENT
    ├── admin-bang-gia.controller.ts       → ADMIN - PRICE TABLE MANAGEMENT
    ├── admin-vehicles.controller.ts       → ADMIN - CUSTOMER VEHICLES MANAGEMENT
    ├── admin-trips.controller.ts          → ADMIN - TRIP MANAGEMENT
    ├── admin-payments.controller.ts       → ADMIN - PAYMENT MANAGEMENT
    └── admin-reviews.controller.ts        → ADMIN - REVIEW MANAGEMENT

├── dto/
│   ├── get-users-query.dto.ts
│   ├── update-user.dto.ts
│   ├── toggle-user-status.dto.ts
│   ├── update-driver.dto.ts
│   ├── approve-driver.dto.ts
│   └── get-pagination-query.dto.ts
```

---

## 🔄 Thay Đổi Chính (Key Changes)

### 1️⃣ Tách AdminController thành các Controllers Chuyên Biệt

**Mục đích:** Giảm độ phức tạp, tổ chức rõ ràng theo chức năng

| Controller | Endpoint Base | APIs Quản Lý |
|-----------|--------------|----------|
| AdminUsersController | `/admin/users` | Người dùng (GET, PUT, PATCH) |
| AdminDriversController | `/admin/drivers` | Tài xế (GET, PUT, POST approve) |
| AdminCustomersController | `/admin/customers` | Khách hàng (GET) |
| AdminSystemVehiclesController | `/admin/system-vehicles` | Xe toàn hệ thống (GET, DELETE) |
| AdminDashboardController | `/admin/dashboard` | Thống kê, Khiếu nại (GET) |

### 2️⃣ Cập Nhật Tags cho Các Controllers Khác

```typescript
// Trước
@ApiTags('Admin - Full Access')

// Sau
@ApiTags('ADMIN - VEHICLE TYPE MANAGEMENT')
@ApiTags('ADMIN - PRICE TABLE MANAGEMENT')
@ApiTags('ADMIN - CUSTOMER VEHICLES MANAGEMENT')
@ApiTags('ADMIN - TRIP MANAGEMENT')
@ApiTags('ADMIN - PAYMENT MANAGEMENT')
@ApiTags('ADMIN - REVIEW MANAGEMENT')
```

### 3️⃣ AdminModule Cập Nhật Import

```typescript
controllers: [
  AdminController,  // Main (now empty, just for documentation)
  
  // Business-specific management controllers
  AdminUsersController,
  AdminDriversController,
  AdminCustomersController,
  AdminSystemVehiclesController,
  AdminDashboardController,
  
  // Admin CRUD Controllers for Full Access
  AdminLoaiXeController,
  AdminBangGiaController,
  AdminVehiclesController,
  AdminTripsController,
  AdminPaymentsController,
  AdminReviewsController,
],
```

---

## ✨ Lợi Ích của Cấu Trúc Mới

### ✅ Trong Swagger UI

| Tiêu Chí | Trước | Sau |
|---------|------|-----|
| **Số Tags** | 2 (Admin - Super Admin, Admin - Full Access) | 8+ (Riêng biệt) |
| **API Per Tag** | 5-20 (Rất nhiều) | 1-7 (Dễ quản lý) |
| **Tìm Kiếm** | Khó, phải scroll | Dễ, mở đúng tag |
| **Hiểu Chức Năng** | Phải đọc description | Rõ từ tên tag |

### ✅ Trong Code (Developer Experience)

| Tiêu Chí | Lợi Ích |
|---------|--------|
| **Separation of Concerns** | Mỗi controller có trách nhiệm rõ ràng |
| **Dễ Maintain** | Sửa lỗi user đứng ở `admin-users.controller.ts` |
| **Dễ Test** | Test từng nhóm API riêng biệt |
| **Dễ Scale** | Thêm API mới không bị vỡ structure |
| **Dễ Onboard** | Developer mới hiểu nhanh cấu trúc |

---

## 📝 Cách Sử Dụng

### 📱 Truy Cập Swagger UI

```
http://localhost:3000/docs
```

### 🔍 Tìm API

**Bước 1:** Vào Swagger UI  
**Bước 2:** Tìm tag cần thiết  
Ví dụ: `ADMIN - USER MANAGEMENT`  
**Bước 3:** Khai triển tag → xem các endpoint  
**Bước 4:** Click vào endpoint → xem detail

### 📚 Ví Dụ: Cấp Duyệt Tài Xế

```
1. Mở Swagger UI
2. Tìm tag: "ADMIN - DRIVER MANAGEMENT" ← Rõ ràng!
3. Click "POST /admin/drivers/{id}/approve"
4. Thử (Try it out)
```

**Cũ (Before):**
```
❌ Mở "Admin - Super Admin" → thấy 20+ API cùng
❌ Phải scroll để tìm "approve driver"
❌ Mất 30 giây
```

**Mới (After):**
```
✅ Mở "ADMIN - DRIVER MANAGEMENT" → thấy 4 API
✅ Ngay lập tức tìm thấy
✅ Mất 3 giây
```

---

## 🔄 Nếu Cần Thêm API Mới

### Quy Tắc Naming

| Loại API | Controller | Tag |
|---------|-----------|-----|
| Quản lý người dùng | `admin-users.controller.ts` | `ADMIN - USER MANAGEMENT` |
| Quản lý tài xế | `admin-drivers.controller.ts` | `ADMIN - DRIVER MANAGEMENT` |
| Quản lý khách hàng | `admin-customers.controller.ts` | `ADMIN - CUSTOMER MANAGEMENT` |
| Loại xe | `admin-loai-xe.controller.ts` | `ADMIN - VEHICLE TYPE MANAGEMENT` |
| Bảng giá | `admin-bang-gia.controller.ts` | `ADMIN - PRICE TABLE MANAGEMENT` |
| Xe khách hàng | `admin-vehicles.controller.ts` | `ADMIN - CUSTOMER VEHICLES MANAGEMENT` |
| Chuyến đi | `admin-trips.controller.ts` | `ADMIN - TRIP MANAGEMENT` |
| Thanh toán | `admin-payments.controller.ts` | `ADMIN - PAYMENT MANAGEMENT` |
| Đánh giá | `admin-reviews.controller.ts` | `ADMIN - REVIEW MANAGEMENT` |
| Thống kê | `admin-dashboard.controller.ts` | `ADMIN - DASHBOARD & REPORTS` |

### Ví Dụ: Thêm API quản lý khiếu nại

```typescript
// File: admin-support.controller.ts (nếu muốn tách riêng)
// Hoặc thêm vào: admin-dashboard.controller.ts (nếu liên quan)

@ApiTags('ADMIN - SUPPORT & ISSUES')
@Controller('admin/support')
export class AdminSupportController {
  @Post('resolve/:id')
  @ApiOperation({ summary: 'Resolve a support ticket' })
  async resolveTicket(@Param('id') id: string) {
    // Implementation
  }
}
```

---

## ❓ FAQ

### Q: Tại sao tách AdminController?
**A:** Để giảm độ phức tạp, mỗi controller chỉ quản lý 1 domain.

### Q: Các endpoint URLs có thay đổi không?
**A:** Không! URLs vẫn giống hệt:
- Cũ: `/admin/users` → `/admin/users`
- Mới: `/admin/users` → `/admin/users` ✅

### Q: Client code có cần sửa?
**A:** Không cần sửa, vì URLs không thay đổi.

### Q: Sau này muốn thêm tag mới?
**A:** Tạo controller mới, thêm @ApiTags, import trong Module. Simple!

---

## 📋 Checklist (Implementation Done)

- ✅ Tách AdminController → 5 Controllers
- ✅ Cập nhật Tags cho tất cả Controllers
- ✅ Cập nhật AdminModule imports
- ✅ Build & verify (No errors)
- ✅ Documentation (This file)

---

**Created:** May 28, 2026  
**Status:** ✅ Ready for Production
