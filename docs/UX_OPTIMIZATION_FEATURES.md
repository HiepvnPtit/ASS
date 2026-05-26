# UX Optimization Features - Implementation Guide

## Overview

This document describes two new UX optimization features for the Trips system:
1. **Auto-Calculate Driver Rating** - Automatically updates driver rating after each review
2. **Trip History API** - Provides role-based trip history with pagination

---

## Feature 1: Auto-Calculate Driver Rating

### Purpose
After a customer creates a review for a completed trip, the driver's average rating (`diemDanhGia`) is automatically calculated and updated.

### Technical Implementation

#### ReviewsService Changes
Added new method: `updateDriverAverageRating(maTaiXe: string)`

```typescript
/**
 * Update driver's average rating (diemDanhGia) after a review is created
 * Calculates the average of all soSao from reviews for all trips by this driver
 * @param maTaiXe - Driver ID
 */
async updateDriverAverageRating(maTaiXe: string): Promise<void> {
  // Calculate average rating across all reviews for this driver's trips
  const result = await this.reviewsRepo
    .createQueryBuilder('review')
    .leftJoin('review.chuyenDi', 'trip')
    .select('AVG(review.soSao)', 'avgRating')
    .addSelect('COUNT(review.maDanhGia)', 'reviewCount')
    .where('trip.maTaiXe = :maTaiXe', { maTaiXe })
    .andWhere('review.deletedAt IS NULL')
    .getRawOne();

  if (result && result.avgRating) {
    // Round to 2 decimal places
    const diemDanhGia = parseFloat(result.avgRating).toFixed(2);
    await this.taiXeRepo.update(
      { maTaiXe },
      { diemDanhGia: diemDanhGia as any },
    );
  }
}
```

#### TripsService Integration
Modified `createReview()` method to call `updateDriverAverageRating()` after saving:

```typescript
// Auto-update driver's average rating if driver is assigned to this trip
if (trip.taiXe && trip.taiXe.maTaiXe) {
  await this.reviewsService.updateDriverAverageRating(trip.taiXe.maTaiXe);
}
```

### Workflow
1. Customer creates a review for a trip via `POST /trips/:id/reviews`
2. Review is saved to database (soSao: 1-5 stars)
3. ReviewsService calculates average of all reviews for that driver
4. TaiXe.diemDanhGia is updated with new average (rounded to 2 decimals)

### Data Flow
```
CreateReviewDto (soSao)
    ↓
TripsService.createReview()
    ↓
DanhGia saved to database
    ↓
ReviewsService.updateDriverAverageRating()
    ↓
Query: AVG(soSao) FROM danh_gia WHERE trip.ma_tai_xe = ?
    ↓
TaiXe.diemDanhGia = calculated average
    ↓
Driver profile updated with new rating
```

### Example Scenario
- Driver has 3 trips with reviews: [4 stars, 5 stars, 3 stars]
- Average: (4+5+3)/3 = 4.00
- diemDanhGia column updated to "4.00"
- New review created: 2 stars
- New average: (4+5+3+2)/4 = 3.50
- diemDanhGia updated to "3.50"

---

## Feature 2: Trip History API

### Purpose
Provides users (customers or drivers) with their complete trip history with pagination, sorting, and role-based filtering.

### Technical Implementation

#### Endpoint
```
GET /trips/me/history?page=1&limit=10
```

#### Authentication
- **Guard**: `AuthGuard('jwt')`
- **Role-based**: Automatically filters based on user's `vaiTro` (CUSTOMER or DRIVER)

#### Query Parameters
- `page` (optional, default: 1) - Page number (1-based)
- `limit` (optional, default: 10) - Records per page (max: 100)

#### TripsService Method: `getTripHistory()`

```typescript
async getTripHistory(
  maNguoiDung: string,
  vaiTro: string,
  page: number = 1,
  limit: number = 10,
)
```

### Features
1. **Role-Based Filtering**
   - CUSTOMER: Returns trips where user is the customer
   - DRIVER: Returns trips where user is the driver

2. **Populated Relations** (Mandatory Joins)
   - `xe` (Vehicle) with nested `loaiXe` (Vehicle Type)
   - `khachHang` (Customer) - only for DRIVER role
   - `taiXe` (Driver) - only for CUSTOMER role
   - `thanhToan` (Payment)
   - `lichSuTrangThai` (Trip Status History)

3. **Sorting**
   - Primary: `thoiGianBatDau` DESC (newest first)

4. **Pagination**
   - Skip: `(page - 1) * limit`
   - Take: `limit` records

### Response Structure

```json
{
  "message": "Lấy lịch sử chuyến đi thành công",
  "data": [
    {
      "maChuyenDi": "cd_123",
      "diemDon": "...",
      "diemDen": "...",
      "thoiGianBatDau": "2024-01-15T10:30:00Z",
      "thoiGianKetThuc": "2024-01-15T11:45:00Z",
      "trangThaiChuyenDi": "COMPLETED",
      "xe": {
        "maXe": "xe_001",
        "biensoDangKy": "...",
        "loaiXe": {
          "maLoaiXe": "lx_001",
          "tenLoaiXe": "Sedan"
        }
      },
      "taiXe": {
        "maTaiXe": "tx_001",
        "hoTen": "Nguyễn Văn A",
        "diemDanhGia": "4.50",
        "trangThaiHoatDong": "ONLINE"
      },
      "khachHang": {
        "maKhachHang": "kh_001",
        "hoTen": "Trần Thị B"
      },
      "thanhToan": {
        "maThanhToan": "tt_001",
        "soTienDu": "250000",
        "trangThaiThanhToan": "COMPLETED"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### SQL Query Overview

**For CUSTOMER role:**
```sql
SELECT trip.* 
FROM chuyen_di trip
LEFT JOIN xe ON trip.ma_xe = xe.ma_xe
LEFT JOIN loai_xe ON xe.ma_loai_xe = loai_xe.ma_loai_xe
LEFT JOIN thanh_toan ON trip.ma_chuyen_di = thanh_toan.ma_chuyen_di
LEFT JOIN khach_hang ON trip.ma_khach_hang = khach_hang.ma_khach_hang
LEFT JOIN nguoi_dung customer_user ON khach_hang.ma_nguoi_dung = customer_user.ma_nguoi_dung
WHERE customer_user.ma_nguoi_dung = ?
ORDER BY trip.thoi_gian_bat_dau DESC
LIMIT 10 OFFSET 0
```

**For DRIVER role:**
```sql
SELECT trip.* 
FROM chuyen_di trip
LEFT JOIN xe ON trip.ma_xe = xe.ma_xe
LEFT JOIN loai_xe ON xe.ma_loai_xe = loai_xe.ma_loai_xe
LEFT JOIN thanh_toan ON trip.ma_chuyen_di = thanh_toan.ma_chuyen_di
LEFT JOIN tai_xe ON trip.ma_tai_xe = tai_xe.ma_tai_xe
LEFT JOIN nguoi_dung driver_user ON tai_xe.ma_nguoi_dung = driver_user.ma_nguoi_dung
WHERE driver_user.ma_nguoi_dung = ?
ORDER BY trip.thoi_gian_bat_dau DESC
LIMIT 10 OFFSET 0
```

---

## API Usage Examples

### Example 1: Get Customer's Trip History (Page 1, 10 records)
```bash
curl -X GET "http://localhost:3000/trips/me/history?page=1&limit=10" \
  -H "Authorization: Bearer <customer_jwt_token>" \
  -H "Content-Type: application/json"
```

### Example 2: Get Driver's Trip History (Page 2, 20 records)
```bash
curl -X GET "http://localhost:3000/trips/me/history?page=2&limit=20" \
  -H "Authorization: Bearer <driver_jwt_token>" \
  -H "Content-Type: application/json"
```

### Example 3: Get Latest Trips (Default Pagination)
```bash
curl -X GET "http://localhost:3000/trips/me/history" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json"
```

---

## Validation & Error Handling

### Validation Rules
1. **Page**: Must be >= 1, defaults to 1
2. **Limit**: Must be 1-100, defaults to 10
3. **Role**: Must be CUSTOMER or DRIVER
4. **JWT Token**: Must be valid and contain `maNguoiDung` and `vaiTro`

### Error Responses

**Invalid Role:**
```json
{
  "statusCode": 400,
  "message": "Vai trò không hợp lệ"
}
```

**No Authorization Token:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Invalid JWT:**
```json
{
  "statusCode": 401,
  "message": "Invalid token"
}
```

---

## Database Schema Requirements

### Required Tables
- `chuyen_di` - Trip records
- `loai_xe` - Vehicle type
- `xe` - Vehicle instances
- `tai_xe` - Driver information
- `khach_hang` - Customer information
- `nguoi_dung` - User accounts
- `thanh_toan` - Payment records
- `lich_su_trang_thai` - Trip status history

### Required Relationships
- ChuyenDi → Xe (ManyToOne)
- Xe → LoaiXe (ManyToOne)
- ChuyenDi → TaiXe (ManyToOne, nullable)
- ChuyenDi → KhachHang (ManyToOne)
- KhachHang → NguoiDung (OneToOne)
- TaiXe → NguoiDung (OneToOne)
- ChuyenDi → ThanhToan (OneToMany)
- ChuyenDi → LichSuTrangThai (OneToMany)

---

## Integration Checklist

- [x] Added TaiXe import to ReviewsModule
- [x] Updated ReviewsService constructor with TaiXeRepo
- [x] Implemented updateDriverAverageRating() method
- [x] Modified createReview() to call updateDriverAverageRating()
- [x] Added ReviewsModule to TripsModule imports
- [x] Injected ReviewsService in TripsService
- [x] Implemented getTripHistory() method in TripsService
- [x] Added GET /trips/me/history endpoint in TripsController
- [x] Added necessary imports and decorators

---

## Performance Considerations

### Optimization Tips
1. **Database Indexes**
   - Create index on `chuyen_di.ma_tai_xe`
   - Create index on `chuyen_di.ma_khach_hang`
   - Create index on `chuyen_di.thoi_gian_bat_dau` (DESC)

2. **Query Optimization**
   - Use `leftJoinAndSelect` for eager loading
   - Apply pagination to avoid large result sets
   - Add soft delete filters if needed

3. **Caching Strategy**
   - Cache trip statistics (count, average rating)
   - Cache paginated results with TTL

---

## Testing Strategy

### Unit Tests
- ReviewsService.updateDriverAverageRating()
- TripsService.getTripHistory() with pagination
- Role-based filtering logic

### Integration Tests
- Full review creation flow with auto-rating update
- Trip history endpoint with various roles
- Pagination edge cases (page 1, last page, empty results)

### API Tests
- POST /trips/:id/reviews → Driver rating updated
- GET /trips/me/history (CUSTOMER) → Customer's trips
- GET /trips/me/history (DRIVER) → Driver's trips
- Pagination parameters validation

---

## Migration Notes

### No Database Migrations Required
- All required columns and relationships already exist
- `TaiXe.diemDanhGia` column pre-exists (numeric(3,2) default '5.00')

### Module Updates
- ReviewsModule now exports TaiXe repository
- TripsModule now imports ReviewsModule

---

## Rollback Plan

If issues occur:
1. Comment out updateDriverAverageRating() call in createReview()
2. Revert ReviewsModule and TripsModule imports
3. Review creation will continue to work without auto-rating
4. Trip history endpoint can be removed and re-implemented

---

## Future Enhancements

1. **Advanced Filtering**
   - Filter by trip status (COMPLETED, CANCELLED, etc.)
   - Filter by date range
   - Filter by payment status

2. **Analytics**
   - Trip statistics dashboard
   - Driver rating trends
   - Revenue reports

3. **Export**
   - Export trip history to CSV/PDF
   - Generate trip reports

4. **Notifications**
   - Notify drivers when rating is updated
   - Alert users of historical trends

