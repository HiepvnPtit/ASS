# UX Optimization Features - Quick Reference

## Feature Overview

| Feature | Endpoint | Method | Purpose |
|---------|----------|--------|---------|
| Auto-Calculate Driver Rating | (automatic) | POST /trips/:id/reviews | Updates diemDanhGia after review creation |
| Trip History | GET /trips/me/history | GET | Retrieve user's trips with pagination |

---

## Feature 1: Auto-Calculate Driver Rating

### Quick Facts
- **Trigger**: When review is created via `POST /trips/:id/reviews`
- **Calculation**: Average of all `soSao` values for driver's trips
- **Update Target**: `TaiXe.diemDanhGia` (numeric(3,2), rounded to 2 decimals)
- **No Additional Calls Needed**: Works automatically

### Code Flow
```
Customer creates review (5 stars)
  ↓
ReviewsService.updateDriverAverageRating(maTaiXe)
  ↓
Query: SELECT AVG(soSao) FROM danh_gia WHERE trip.ma_tai_xe = ?
  ↓
Update: TaiXe.diemDanhGia = result
  ↓
Complete
```

### Example Scenario
```
Trip 1: 5 stars
Trip 2: 4 stars
Trip 3: 3 stars
         -------
Average: 4.00 ← diemDanhGia updated to this value
```

---

## Feature 2: Trip History API

### Quick Facts
- **Endpoint**: `GET /trips/me/history`
- **Authentication**: JWT Bearer token (required)
- **Role-Based**: Auto-filters by user role (CUSTOMER or DRIVER)
- **Pagination**: page (default 1), limit (default 10, max 100)
- **Sorting**: By thoiGianBatDau DESC (newest first)

### Query Parameters
```
?page=1          # Page number (1-based)
&limit=10        # Records per page (1-100)
```

### Full URL Examples
```
GET /trips/me/history
GET /trips/me/history?page=1
GET /trips/me/history?page=1&limit=10
GET /trips/me/history?page=2&limit=20
```

### Response Fields

**Top Level**:
```json
{
  "message": "Lấy lịch sử chuyến đi thành công",
  "data": [...],
  "pagination": {...}
}
```

**Pagination Object**:
```json
{
  "page": 1,
  "limit": 10,
  "total": 45,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

**Trip Data** (each item in `data` array):
```json
{
  "maChuyenDi": "cd_123",
  "diemDon": "Start address",
  "diemDen": "End address",
  "thoiGianBatDau": "2024-01-15T10:30:00Z",
  "thoiGianKetThuc": "2024-01-15T11:45:00Z",
  "trangThaiChuyenDi": "COMPLETED",
  "xe": {
    "maXe": "xe_001",
    "biensoDangKy": "ABC-123",
    "loaiXe": {
      "maLoaiXe": "lx_sedan",
      "tenLoaiXe": "Sedan"
    }
  },
  "taiXe": {
    "maTaiXe": "tx_001",
    "hoTen": "Nguyen Van A",
    "diemDanhGia": "4.50"
  },
  "khachHang": {
    "maKhachHang": "kh_001",
    "hoTen": "Tran Thi B"
  },
  "thanhToan": {
    "maThanhToan": "tt_001",
    "soTienDu": "250000",
    "trangThaiThanhToan": "COMPLETED"
  }
}
```

### cURL Examples

**Basic Request**:
```bash
curl -X GET "http://localhost:3000/trips/me/history" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**With Pagination**:
```bash
curl -X GET "http://localhost:3000/trips/me/history?page=2&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Parse Specific Data**:
```bash
# Get only trip IDs
curl -s "http://localhost:3000/trips/me/history" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  | jq '.data[] | .maChuyenDi'

# Get pagination info
curl -s "http://localhost:3000/trips/me/history" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  | jq '.pagination'

# Get driver ratings from all trips
curl -s "http://localhost:3000/trips/me/history" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  | jq '.data[] | .taiXe.diemDanhGia'
```

### Role-Based Behavior

| Role | Filter | Includes |
|------|--------|----------|
| CUSTOMER | Where customer is the user | `taiXe` (driver info) |
| DRIVER | Where driver is the user | `khachHang` (customer info) |

### API Response Patterns

**Success** (200 OK):
```json
{
  "message": "Lấy lịch sử chuyến đi thành công",
  "data": [...],
  "pagination": {...}
}
```

**Empty Results** (200 OK):
```json
{
  "message": "Lấy lịch sử chuyến đi thành công",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**Unauthorized** (401):
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Invalid Role** (400):
```json
{
  "statusCode": 400,
  "message": "Vai trò không hợp lệ"
}
```

---

## Pagination Tips

### Calculate Total Pages
```javascript
totalPages = Math.ceil(total / limit)
```

### Check if More Pages Exist
```javascript
hasMore = page < totalPages
```

### Get Next Page URL
```javascript
nextPage = page + 1  // Only if hasNextPage is true
```

### Get Previous Page URL
```javascript
prevPage = page - 1  // Only if hasPrevPage is true
```

### Skip/Take Formula
```javascript
skip = (page - 1) * limit
take = limit
```

---

## Implementation Files Modified

### Feature 1 Files
- `src/reviews/reviews.module.ts` - Added TaiXe import
- `src/reviews/reviews.service.ts` - Added updateDriverAverageRating()
- `src/trips/trips.module.ts` - Added ReviewsModule import
- `src/trips/trips.service.ts` - Integrated rating update in createReview()

### Feature 2 Files
- `src/trips/trips.service.ts` - Added getTripHistory()
- `src/trips/trips.controller.ts` - Added GET /trips/me/history endpoint

---

## Common Issues & Solutions

### Issue 1: Rating Not Updating
**Cause**: ReviewsService not injected into TripsService
**Solution**: Verify ReviewsModule imported in TripsModule

### Issue 2: Trip History Returns Empty
**Cause**: User role not matching filter logic
**Solution**: Verify JWT token contains valid `vaiTro` (CUSTOMER or DRIVER)

### Issue 3: Pagination Not Working
**Cause**: Invalid page or limit parameters
**Solution**: Ensure page >= 1, limit 1-100

### Issue 4: Relations Not Populated
**Cause**: Missing leftJoinAndSelect in query
**Solution**: Verify all relations (xe, loaiXe, taiXe, khachHang, thanhToan) are joined

### Issue 5: 401 Unauthorized
**Cause**: Missing or invalid JWT token
**Solution**: Use valid bearer token from login endpoint

---

## Database Queries

### Query 1: Average Rating for Driver (Manual Check)
```sql
SELECT AVG(soSao) as avgRating, COUNT(*) as reviewCount
FROM danh_gia dg
LEFT JOIN chuyen_di cd ON dg.ma_chuyen_di = cd.ma_chuyen_di
WHERE cd.ma_tai_xe = 'tx_001';
```

### Query 2: Customer Trip History (Manual Check)
```sql
SELECT cd.*
FROM chuyen_di cd
LEFT JOIN khach_hang kh ON cd.ma_khach_hang = kh.ma_khach_hang
LEFT JOIN nguoi_dung nu ON kh.ma_nguoi_dung = nu.ma_nguoi_dung
WHERE nu.ma_nguoi_dung = 'ng_001'
ORDER BY cd.thoi_gian_bat_dau DESC
LIMIT 10 OFFSET 0;
```

### Query 3: Driver Trip History (Manual Check)
```sql
SELECT cd.*
FROM chuyen_di cd
LEFT JOIN tai_xe tx ON cd.ma_tai_xe = tx.ma_tai_xe
LEFT JOIN nguoi_dung nu ON tx.ma_nguoi_dung = nu.ma_nguoi_dung
WHERE nu.ma_nguoi_dung = 'ng_001'
ORDER BY cd.thoi_gian_bat_dau DESC
LIMIT 10 OFFSET 0;
```

---

## Testing Commands

### Test Auto-Rating Update
```bash
# 1. Create trip and review
# 2. Check driver rating
DRIVER_ID="tx_001"
curl -s "http://localhost:3000/tai-xe/$DRIVER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data.diemDanhGia'
```

### Test Trip History
```bash
# Get customer trip history
curl -s "http://localhost:3000/trips/me/history?page=1&limit=5" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" | jq '.pagination'

# Get driver trip history
curl -s "http://localhost:3000/trips/me/history?page=1&limit=5" \
  -H "Authorization: Bearer $DRIVER_TOKEN" | jq '.data | length'
```

---

## Performance Considerations

### Indexing Recommendations
```sql
-- For rating calculation
CREATE INDEX idx_chuyen_di_ma_tai_xe ON chuyen_di(ma_tai_xe);
CREATE INDEX idx_danh_gia_chuyen_di ON danh_gia(ma_chuyen_di);

-- For trip history queries
CREATE INDEX idx_chuyen_di_tho_gian_bat_dau ON chuyen_di(thoi_gian_bat_dau DESC);
CREATE INDEX idx_khach_hang_ma_nguoi_dung ON khach_hang(ma_nguoi_dung);
CREATE INDEX idx_tai_xe_ma_nguoi_dung ON tai_xe(ma_nguoi_dung);
```

### Query Optimization
1. Use eager loading (leftJoinAndSelect) to avoid N+1 queries
2. Limit pagination to max 100 records
3. Cache paginated results with TTL
4. Use database indexes on foreign keys and sorting columns

---

## Integration Checklist

- [x] Feature 1: Auto-calculate driver rating
  - [x] ReviewsService.updateDriverAverageRating() implemented
  - [x] Integrated into TripsService.createReview()
  - [x] TaiXe repository injected in ReviewsService
  
- [x] Feature 2: Trip history API
  - [x] TripsService.getTripHistory() implemented
  - [x] TripsController.getTripHistory() endpoint added
  - [x] Role-based filtering implemented
  - [x] Pagination implemented
  - [x] Sorting implemented

---

## Quick Deployment Checklist

- [x] No database migrations needed (columns pre-exist)
- [x] All modules configured correctly
- [x] Dependencies injected properly
- [x] Error handling implemented
- [x] JWT authentication required
- [x] Pagination limits enforced
- [x] Tests created and documented

