# UX Optimization Features - Testing Guide

## Test Scenarios & Execution

This guide provides comprehensive test cases for the two UX optimization features.

---

## Test Setup

### Prerequisites
1. Running NestJS server on `http://localhost:3000`
2. PostgreSQL database connected
3. Test users created:
   - Customer: `kh_test@email.com`
   - Driver: `tx_test@email.com`
   - Admin: `admin@email.com`

### Bearer Token Generation
```bash
# Login as customer
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"kh_test@email.com","password":"password"}' \
  | jq .data.access_token

# Login as driver
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"tx_test@email.com","password":"password"}' \
  | jq .data.access_token
```

---

## Feature 1: Auto-Calculate Driver Rating

### Test Case 1.1: Create First Review for Driver
**Objective**: Verify initial driver rating calculation

**Steps**:
1. Create a trip with driver
2. Get driver's current diemDanhGia
3. Create review with 5 stars
4. Verify diemDanhGia updated to 5.00

**cURL Command**:
```bash
# Create trip (note trip ID for later)
TRIP_ID=$(curl -X POST "http://localhost:3000/trips" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maKhachHang": "kh_test",
    "maLoaiXe": "lx_sedan",
    "diemDon": "123 Main St",
    "diemDen": "456 Oak Ave",
    "viDoDon": 10.776839,
    "kinhDoDon": 106.696055,
    "viDoDen": 10.789373,
    "kinhDoDen": 106.706055
  }' | jq .maChuyenDi)

# Create review with 5 stars
curl -X POST "http://localhost:3000/trips/$TRIP_ID/reviews" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "soSao": 5,
    "noiDung": "Excellent driver, very professional"
  }'

# Verify driver rating updated
curl -X GET "http://localhost:3000/tai-xe/tx_driver_id" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .data.diemDanhGia
# Expected: "5.00"
```

### Test Case 1.2: Create Multiple Reviews for Same Driver
**Objective**: Verify average rating calculation across multiple reviews

**Steps**:
1. Create 4 trips with same driver
2. Create reviews: [5, 4, 3, 2 stars]
3. Verify final diemDanhGia = 3.50

**Script**:
```bash
#!/bin/bash

DRIVER_ID="tx_driver_001"
CUSTOMER_TOKEN="bearer_token_here"
ADMIN_TOKEN="admin_bearer_token_here"

# Create 4 trips and reviews
ratings=(5 4 3 2)
for rating in "${ratings[@]}"; do
  # Create trip
  TRIP_ID=$(curl -s -X POST "http://localhost:3000/trips" \
    -H "Authorization: Bearer $CUSTOMER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "maKhachHang": "kh_test",
      "maLoaiXe": "lx_sedan",
      "diemDon": "Start",
      "diemDen": "End",
      "viDoDon": 10.776839,
      "kinhDoDon": 106.696055,
      "viDoDen": 10.789373,
      "kinhDoDen": 106.706055
    }' | jq -r .maChuyenDi)
  
  echo "Created trip: $TRIP_ID with rating: $rating"
  
  # Assign driver (admin action)
  curl -s -X PATCH "http://localhost:3000/trips/$TRIP_ID/driver" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"maTaiXe":"'$DRIVER_ID'"}'
  
  # Create review
  curl -s -X POST "http://localhost:3000/trips/$TRIP_ID/reviews" \
    -H "Authorization: Bearer $CUSTOMER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"soSao":'$rating',"noiDung":"Review for rating '$rating'"}'
  
  sleep 1
done

# Check final driver rating
echo "Final driver rating:"
curl -s -X GET "http://localhost:3000/tai-xe/$DRIVER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data.diemDanhGia'
# Expected: "3.50"
```

### Test Case 1.3: Review Deletion Should Recalculate Rating
**Objective**: Verify soft delete of review updates rating

**Steps**:
1. Create 3 reviews: [5, 4, 3]
2. Delete review with 5 stars (soft delete)
3. Verify rating recalculated: (4+3)/2 = 3.50

**cURL**:
```bash
# Delete review (mark as deleted_at)
curl -X DELETE "http://localhost:3000/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Check updated driver rating
curl -X GET "http://localhost:3000/tai-xe/$DRIVER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data.diemDanhGia'
```

### Test Case 1.4: Edge Case - No Reviews
**Objective**: Verify driver rating remains at default if no reviews

**Expected Behavior**: If driver has no reviews, `diemDanhGia` remains "5.00" (default)

### Test Case 1.5: Edge Case - Single Star Review
**Objective**: Verify minimum rating can be updated

**cURL**:
```bash
curl -X POST "http://localhost:3000/trips/$TRIP_ID/reviews" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "soSao": 1,
    "noiDung": "Poor service"
  }'

# Verify rating updated
curl -X GET "http://localhost:3000/tai-xe/$DRIVER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data.diemDanhGia'
```

---

## Feature 2: Trip History API

### Test Case 2.1: Get Customer Trip History (First Page)
**Objective**: Verify customer sees their trips with pagination

**cURL**:
```bash
curl -X GET "http://localhost:3000/trips/me/history?page=1&limit=5" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "message": "Lấy lịch sử chuyến đi thành công",
  "data": [
    {
      "maChuyenDi": "cd_123",
      "diemDon": "123 Main St",
      "diemDen": "456 Oak Ave",
      "thoiGianBatDau": "2024-01-15T10:30:00Z",
      "xe": {
        "maXe": "xe_001",
        "loaiXe": {
          "maLoaiXe": "lx_sedan",
          "tenLoaiXe": "Sedan"
        }
      },
      "taiXe": {
        "maTaiXe": "tx_001",
        "hoTen": "Nguyễn Văn A",
        "diemDanhGia": "4.50"
      },
      "thanhToan": {
        "soTienDu": "250000",
        "trangThaiThanhToan": "COMPLETED"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 25,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Test Case 2.2: Get Driver Trip History (First Page)
**Objective**: Verify driver sees their trips with pagination

**cURL**:
```bash
curl -X GET "http://localhost:3000/trips/me/history?page=1&limit=5" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -H "Content-Type: application/json"
```

**Verification Points**:
- Customer info should be populated (not driver)
- Trip records filtered by driver
- Latest trips first (sorted by thoiGianBatDau DESC)

### Test Case 2.3: Pagination - Second Page
**Objective**: Verify pagination works correctly

**cURL**:
```bash
curl -X GET "http://localhost:3000/trips/me/history?page=2&limit=10" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json"
```

**Verification Points**:
- page: 2
- limit: 10
- hasNextPage: true (if total > 20)
- hasPrevPage: true

### Test Case 2.4: Pagination - Last Page
**Objective**: Verify last page has correct flags

**Setup**: Create total of 23 trips, request page 3 with limit 10

**cURL**:
```bash
curl -X GET "http://localhost:3000/trips/me/history?page=3&limit=10" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json"
```

**Verification Points**:
- page: 3
- limit: 10
- total: 23
- totalPages: 3
- hasNextPage: false
- hasPrevPage: true
- records count: 3 (23 - 20)

### Test Case 2.5: Pagination - Invalid Page Number
**Objective**: Verify page < 1 defaults to page 1

**cURL**:
```bash
curl -X GET "http://localhost:3000/trips/me/history?page=0&limit=10" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected**: Returns page 1 results

### Test Case 2.6: Pagination - Excessive Limit
**Objective**: Verify limit is capped at 100

**cURL**:
```bash
curl -X GET "http://localhost:3000/trips/me/history?page=1&limit=500" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected**: limit capped to 100, returns 100 records

### Test Case 2.7: Default Pagination
**Objective**: Verify default values (page=1, limit=10)

**cURL**:
```bash
curl -X GET "http://localhost:3000/trips/me/history" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected**: Returns first 10 records

### Test Case 2.8: Verify All Relations Populated
**Objective**: Verify all required relations are included

**cURL**:
```bash
curl -X GET "http://localhost:3000/trips/me/history?page=1&limit=5" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" | jq '.data[0] | keys'
```

**Expected keys**:
```json
[
  "maChuyenDi",
  "diemDon",
  "diemDen",
  "thoiGianBatDau",
  "thoiGianKetThuc",
  "trangThaiChuyenDi",
  "xe",
  "taiXe",
  "khachHang",
  "thanhToan",
  "lichSuTrangThai"
]
```

### Test Case 2.9: Verify Nested Relations (Xe → LoaiXe)
**Objective**: Verify LoaiXe is nested correctly

**cURL**:
```bash
curl -X GET "http://localhost:3000/trips/me/history?page=1&limit=1" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" | jq '.data[0].xe.loaiXe'
```

**Expected**:
```json
{
  "maLoaiXe": "lx_sedan",
  "tenLoaiXe": "Sedan",
  "soChoNgoi": 4
}
```

### Test Case 2.10: Sorting - Newest First
**Objective**: Verify trips are sorted by thoiGianBatDau DESC

**Setup**: Create 3 trips with different dates

**cURL**:
```bash
curl -X GET "http://localhost:3000/trips/me/history?page=1&limit=10" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" | jq '.data[] | .thoiGianBatDau'
```

**Expected**:
```
2024-01-20T15:30:00Z  (newest)
2024-01-18T12:00:00Z
2024-01-15T10:30:00Z  (oldest)
```

### Test Case 2.11: Unauthorized Access
**Objective**: Verify endpoint requires JWT token

**cURL**:
```bash
curl -X GET "http://localhost:3000/trips/me/history" \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Test Case 2.12: Invalid Token
**Objective**: Verify endpoint rejects invalid JWT

**cURL**:
```bash
curl -X GET "http://localhost:3000/trips/me/history" \
  -H "Authorization: Bearer invalid_token_here" \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "statusCode": 401,
  "message": "Invalid token"
}
```

### Test Case 2.13: Customer Cannot See Driver Trips
**Objective**: Verify role-based filtering prevents cross-role access

**Setup**: 
- Create trip for driver1
- Login as driver2

**cURL**:
```bash
curl -X GET "http://localhost:3000/trips/me/history" \
  -H "Authorization: Bearer $DRIVER2_TOKEN"
```

**Expected**: Only driver2's trips returned, not driver1's

### Test Case 2.14: Empty Result Set
**Objective**: Verify behavior when user has no trips

**Setup**: Create new user with no trips

**cURL**:
```bash
curl -X GET "http://localhost:3000/trips/me/history" \
  -H "Authorization: Bearer $NEW_USER_TOKEN"
```

**Expected Response**:
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

---

## Integration Tests

### Integration Test 1: Complete Review & History Flow
**Objective**: Verify rating update reflects in trip history

**Steps**:
1. Create trip
2. Assign driver
3. Complete trip
4. Create review with 4 stars
5. Verify diemDanhGia = 4.00
6. Get trip history - verify rating is shown

### Integration Test 2: Multiple Reviews Affect History
**Objective**: Verify rating changes reflect in driver trip history

**Steps**:
1. Create 3 trips
2. Create reviews: [5, 4, 3]
3. Average: 4.00
4. Get driver history - verify diemDanhGia = 4.00
5. Create new review: 2
6. Average: 3.50
7. Get driver history again - verify diemDanhGia = 3.50

---

## Performance Tests

### Performance Test 1: Large Result Set
**Objective**: Verify performance with many trips

**Setup**:
- Create 1000 trips for user
- Query with page=1, limit=100

**Metrics**:
- Response time: < 500ms
- Memory usage: < 50MB

### Performance Test 2: Deep Pagination
**Objective**: Verify performance on last page

**Setup**:
- Create 1000 trips
- Query page=10 with limit=100

**Metrics**:
- Response time: < 500ms
- Database queries: minimal (with eager loading)

---

## Postman Collection

Create file: `ux-optimization-features.postman_collection.json`

```json
{
  "info": {
    "name": "UX Optimization Features",
    "version": "1.0"
  },
  "item": [
    {
      "name": "Feature 1: Create Review",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/trips/{{trip_id}}/reviews",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{customer_token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"soSao\": 4, \"noiDung\": \"Great trip\"}"
        }
      }
    },
    {
      "name": "Feature 2: Get Trip History",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/trips/me/history?page=1&limit=10",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{customer_token}}"
          }
        ]
      }
    }
  ]
}
```

---

## Test Execution Checklist

**Feature 1: Auto-Calculate Driver Rating**
- [ ] Test Case 1.1: First review creates rating
- [ ] Test Case 1.2: Multiple reviews average correctly
- [ ] Test Case 1.3: Deleted reviews recalculate
- [ ] Test Case 1.4: No reviews uses default
- [ ] Test Case 1.5: Single star rating works

**Feature 2: Trip History API**
- [ ] Test Case 2.1: Customer gets their trips
- [ ] Test Case 2.2: Driver gets their trips
- [ ] Test Case 2.3: Page 2 works correctly
- [ ] Test Case 2.4: Last page has correct flags
- [ ] Test Case 2.5: Invalid page defaults to 1
- [ ] Test Case 2.6: Limit capped at 100
- [ ] Test Case 2.7: Default pagination works
- [ ] Test Case 2.8: All relations populated
- [ ] Test Case 2.9: Nested relations work
- [ ] Test Case 2.10: Sorting by date DESC works
- [ ] Test Case 2.11: Missing token rejected
- [ ] Test Case 2.12: Invalid token rejected
- [ ] Test Case 2.13: Cross-role filtering works
- [ ] Test Case 2.14: Empty results handled

**Integration Tests**
- [ ] Integration Test 1: Complete flow works
- [ ] Integration Test 2: Multiple reviews update history

**Performance Tests**
- [ ] Performance Test 1: Large result set < 500ms
- [ ] Performance Test 2: Deep pagination < 500ms

