# NestJS Boilerplate - Complete Module Overview
## Users, Customers & Drivers Modules

**Generated**: May 24, 2026

---

## TABLE OF CONTENTS
1. [Users/Admin Module](#1-usersadmin-module)
2. [Customers (Khach Hang) Module](#2-customers-module)
3. [Drivers (Tai Xe) Module](#3-drivers-module)
4. [Relationships & Architecture](#relationships--architecture)
5. [Endpoint Summary](#endpoint-summary)

---

# 1. USERS/ADMIN MODULE

## File Paths
| Component | Path |
|-----------|------|
| Module | `src/admin/admin.module.ts` |
| Service | `src/admin/admin.service.ts` |
| Controller | `src/admin/admin.controller.ts` |
| Entity | `src/entities/nguoi-dung.entity.ts` |

## Entity: NguoiDung (User)
**Location**: `src/entities/nguoi-dung.entity.ts`  
**Database Table**: `nguoi_dung`

### Fields & Decorators
```typescript
@Entity({ name: 'nguoi_dung' })
export class NguoiDung {
  @PrimaryColumn({ name: 'ma_nguoi_dung', type: 'varchar', length: 50 })
  maNguoiDung!: string;                    // User ID (Primary Key)

  @Column({ name: 'ho_ten', type: 'varchar', length: 255 })
  hoTen!: string;                          // Full name

  @Column({ name: 'so_dien_thoai', type: 'varchar', length: 20, unique: true })
  soDienThoai!: string;                    // Phone (unique)

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true, unique: true })
  email?: string;                          // Email (optional, unique)

  @Column({ name: 'mat_khau', type: 'varchar', length: 255 })
  matKhau!: string;                        // Password (hashed)

  @Column({ name: 'vai_tro', type: 'varchar', length: 50 })
  vaiTro!: string;                         // Role: CUSTOMER | DRIVER | ADMIN

  @Column({ name: 'trang_thai', type: 'varchar', length: 50, default: 'ACTIVE' })
  trangThai!: string;                      // Status: ACTIVE | BANNED (default: ACTIVE)

  @CreateDateColumn({ name: 'ngay_tao', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  ngayTao!: Date;                          // Creation timestamp
}
```

### Relationships
| Relation | Type | Target | Eager Load | Description |
|----------|------|--------|-----------|-------------|
| `khachHang` | OneToOne | KhachHang | NO | Customer profile (if role = CUSTOMER) |
| `taiXe` | OneToOne | TaiXe | NO | Driver profile (if role = DRIVER) |
| `khieuNaisHandled` | OneToMany | KhieuNai[] | NO | Complaints this user has handled |

## Module Configuration
**File**: `src/admin/admin.module.ts`
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([
      NguoiDung,
      TaiXe,
      KhachHang,
      Xe,
      KhieuNai,
      ChuyenDi,
    ]),
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
```

## Service: AdminService
**File**: `src/admin/admin.service.ts`

### User Management Methods
| Method | Parameters | Returns | Purpose |
|--------|-----------|---------|---------|
| `getAllUsers(query)` | GetUsersQueryDto (page, limit, vaiTro, trangThai, search) | Paginated user list with filter | Fetch users with search & filter by role/status |
| `updateUser(userId, updateDto)` | userId: string, UpdateUserDto | Updated user object | Update user name and phone number |
| `toggleUserStatus(userId, toggleDto)` | userId: string, ToggleUserStatusDto | Status change confirmation | Enable/disable (ACTIVE/BANNED) user account |

**GetUsersQueryDto supports**:
- Filtering by role: `CUSTOMER`, `DRIVER`, `ADMIN`
- Filtering by status: `ACTIVE`, `BANNED`
- Search by: email, phone, or name
- Pagination: page (default 1), limit (default 20)

### Driver Management Methods
| Method | Parameters | Returns | Purpose |
|--------|-----------|---------|---------|
| `getPendingDrivers(page, limit)` | page: number, limit: number | Paginated pending driver list | Get drivers waiting for verification |
| `approveDriver(maTaiXe, approveDto)` | maTaiXe: string, ApproveDriverDto | Approval confirmation | Verify/approve driver registration (PENDING → VERIFIED) |
| `getAllDrivers(query)` | GetPaginationQueryDto | Paginated driver list with relations | Get all drivers joined with user info |
| `updateDriver(driverId, updateDto)` | driverId: string, UpdateDriverDto | Updated driver object | Admin update license, ID card, rating |

**UpdateDriverDto fields**:
- `soGiayPhepLaiXe` - License number
- `canCuocCongDan` - ID card number
- `diemDanhGia` - Rating (numeric)
- `hanGiayPhepLaiXe` - License expiration date
- `ghiChu` - Notes (optional)

### Customer Management Methods
| Method | Parameters | Returns | Purpose |
|--------|-----------|---------|---------|
| `getAllCustomers(query)` | GetPaginationQueryDto | Paginated customer list | Get customers with user & vehicle info |

**Response includes**:
- Customer ID, name, email, phone, status
- Default address
- Vehicle count

### Vehicle Management Methods
| Method | Parameters | Returns | Purpose |
|--------|-----------|---------|---------|
| `getAllVehicles(query)` | GetPaginationQueryDto | Paginated vehicle list | Get all vehicles in system |
| `deleteVehicle(vehicleId, reason)` | vehicleId: string, reason?: string | Deletion confirmation | Hard delete vehicle (must have no active trips) |

**Error**: Throws BadRequestException if vehicle has active trips

### Other Methods
| Method | Parameters | Returns | Purpose |
|--------|-----------|---------|---------|
| `getComplaints(page, limit)` | page: number, limit: number | Paginated complaint list | Get user complaints with trip & driver info |
| `getDashboardMetrics()` | None | Dashboard statistics object | Get real-time metrics (drivers online, pending approvals, complaints, etc.) |

## Controller: AdminController
**File**: `src/admin/admin.controller.ts`  
**Base Path**: `/admin`  
**Auth**: Requires JWT token + ADMIN role

### User Management Endpoints
```
GET    /admin/users
        Query params: page, limit, vaiTro, trangThai, search
        Returns: Paginated user list with filter support

PUT    /admin/users/:id
        Body: UpdateUserDto { hoTen?, soDienThoai? }
        Returns: Updated user object

PATCH  /admin/users/:id/toggle-status
        Body: ToggleUserStatusDto { trangThai, lyDo? }
        Returns: Status change confirmation with old/new status
```

### Driver Management Endpoints
```
GET    /admin/drivers
        Query params: page, limit
        Returns: Paginated driver list with user relations

PUT    /admin/drivers/:id
        Body: UpdateDriverDto { soGiayPhepLaiXe?, canCuocCongDan?, diemDanhGia?, hanGiayPhepLaiXe?, ghiChu? }
        Returns: Updated driver object

GET    /admin/drivers/pending
        Query params: page, limit
        Returns: Drivers with trangThaiXacThuc = PENDING

POST   /admin/drivers/:id/approve
        Body: ApproveDriverDto { ghiChu? }
        Returns: Approval confirmation (changes status to VERIFIED)
```

### Customer Endpoints
```
GET    /admin/customers
        Query params: page, limit
        Returns: Paginated customer list with user info & vehicle count
```

### Vehicle Endpoints
```
GET    /admin/vehicles
        Query params: page, limit
        Returns: All vehicles with owner (customer) info, plate, brand, type

DELETE /admin/vehicles/:id
        Body: { reason?: string }
        Returns: Deletion confirmation
```

### Other Endpoints
```
GET    /admin/complaints
        Query params: page, limit
        Returns: Paginated complaint list with trip, driver, customer info

GET    /admin/dashboard/metrics
        Returns: {
          timestamp: Date,
          trips: { today: number },
          drivers: { online: number, verified: number, pending: number },
          complaints: { total: number, pending: number }
        }
```

---

# 2. CUSTOMERS MODULE (Khach Hang)

## File Paths
| Component | Path |
|-----------|------|
| Entity | `src/entities/khach-hang.entity.ts` |
| Service Methods | `src/admin/admin.service.ts` (getAllCustomers) |
| Controller | `src/admin/admin.controller.ts` (GET /admin/customers) |

## Entity: KhachHang (Customer)
**Location**: `src/entities/khach-hang.entity.ts`  
**Database Table**: `khach_hang`

### Fields & Decorators
```typescript
@Entity({ name: 'khach_hang' })
export class KhachHang {
  @PrimaryColumn({ name: 'ma_khach_hang', type: 'varchar', length: 50 })
  maKhachHang!: string;                      // Customer ID (Primary Key)

  @OneToOne(() => NguoiDung, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ma_nguoi_dung' })
  nguoiDung!: NguoiDung;                     // User info (CASCADE delete)

  @Column({ name: 'dia_chi_mac_dinh', type: 'text', nullable: true })
  diaChiMacDinh?: string;                    // Default address

  @Column({ name: 'ghi_chu', type: 'text', nullable: true })
  ghiChu?: string;                           // Notes
}
```

### Relationships (OneToMany)
| Relation | Target | Foreign Key | Description |
|----------|--------|------------|-------------|
| `xe` | Xe[] | khachHang | Vehicles owned by customer |
| `diaChis` | DiaChiKhachHang[] | khachHang | Saved delivery addresses |
| `chuyenDis` | ChuyenDi[] | khachHang | Trips/journeys booked by customer |
| `bienBansConfirmed` | BienBanBanGiaoXe[] | khachHangXacNhan | Vehicle handover documents confirmed |

## Management via Admin Module
**Service Method**: `AdminService.getAllCustomers(query: GetPaginationQueryDto)`

### Response Structure
```typescript
{
  data: [
    {
      id: string;                 // maKhachHang
      hoTen: string;              // From NguoiDung.hoTen
      email: string;              // From NguoiDung.email
      soDienThoai: string;        // From NguoiDung.soDienThoai
      trangThai: string;          // From NguoiDung.trangThai
      diaChiMacDinh: string;      // Default address
      soXe: number;               // Count of vehicles
    }
  ],
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}
```

## Controller Endpoint
```
GET    /admin/customers
       Query params: page, limit
       Auth: JWT + ADMIN role
       Returns: Paginated customer list
```

---

# 3. DRIVERS MODULE (Tai Xe)

## File Paths
| Component | Path |
|-----------|------|
| Module | `src/drivers/drivers.module.ts` |
| Service | `src/drivers/drivers.service.ts` |
| Controller | `src/drivers/drivers.controller.ts` |
| Entity | `src/entities/tai-xe.entity.ts` |

## Entity: TaiXe (Driver)
**Location**: `src/entities/tai-xe.entity.ts`  
**Database Table**: `tai_xe`

### Fields & Decorators
```typescript
@Entity({ name: 'tai_xe' })
export class TaiXe {
  @PrimaryColumn({ name: 'ma_tai_xe', type: 'varchar', length: 50 })
  maTaiXe!: string;                          // Driver ID (Primary Key)

  @OneToOne(() => NguoiDung, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ma_nguoi_dung' })
  nguoiDung!: NguoiDung;                     // User info (CASCADE delete)

  @Column({ name: 'so_giay_phep_lai_xe', type: 'varchar', length: 50, unique: true })
  soGiayPhepLaiXe!: string;                  // License number (unique)

  @Column({ name: 'can_cuoc_cong_dan', type: 'varchar', length: 20, unique: true })
  canCuocCongDan!: string;                   // ID card number (unique)

  @Column({ name: 'diem_danh_gia', type: 'numeric', precision: 3, scale: 2, default: '5.00' })
  diemDanhGia!: string;                      // Rating score (0-5, default: 5.00)

  @Column({ name: 'trang_thai_hoat_dong', type: 'varchar', length: 50, default: 'OFFLINE' })
  trangThaiHoatDong!: string;                // Activity: ONLINE | OFFLINE (default: OFFLINE)

  @Column({ name: 'trang_thai_xac_thuc', type: 'varchar', length: 50, default: 'PENDING' })
  trangThaiXacThuc!: string;                 // Verification: PENDING | VERIFIED (default: PENDING)

  @Column({ name: 'han_giay_phep_lai_xe', type: 'date' })
  hanGiayPhepLaiXe!: Date;                   // License expiration date
}
```

### Relationships (OneToMany)
| Relation | Target | Foreign Key | Description |
|----------|--------|------------|-------------|
| `kiNangs` | KiNangTaiXe[] | taiXe | Driver skills/certifications |
| `chuyenDis` | ChuyenDi[] | taiXe | Trips/journeys driven |
| `bienBansConfirmed` | BienBanBanGiaoXe[] | taiXeXacNhan | Vehicle handover docs confirmed |

## Module Configuration
**File**: `src/drivers/drivers.module.ts`
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([TaiXe, ViTri, ChuyenDi]),
    AuthModule,
  ],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
```

## Service: DriversService
**File**: `src/drivers/drivers.service.ts`

| Method | Parameters | Returns | Purpose |
|--------|-----------|---------|---------|
| `getProfile(maTaiXe)` | maTaiXe: string | Driver profile object | Get current driver info with user relation |
| `updateStatus(maTaiXe, updateStatusDto)` | maTaiXe: string, UpdateDriverStatusDto { trangThaiHoatDong } | Status update confirmation | Switch driver online/offline status |
| `updateLocation(maTaiXe, createLocationDto)` | maTaiXe: string, CreateLocationDto { viDo, kinhDo } | Location update response | Update GPS position (linked to active trip) |

### Location Update Logic
- Checks if driver has an active trip (trangThai = 'STARTED')
- If active trip exists, saves location with `loaiDoiTuong = 'DRIVER'`
- Returns trip status (tripActive: boolean, maChuyenDi: string | null)

## Controller: DriversController
**File**: `src/drivers/drivers.controller.ts`  
**Base Path**: `/drivers`  
**Auth**: Requires JWT token + DRIVER role (except where noted)

### All Endpoints (Self-Service for Drivers)

```
GET    /drivers/me
       Auth: JWT + DRIVER role
       Returns: {
         maTaiXe: string,
         soGiayPhepLaiXe: string,
         canCuocCongDan: string,
         diemDanhGia: string,
         trangThaiHoatDong: string (ONLINE/OFFLINE),
         trangThaiXacThuc: string (PENDING/VERIFIED),
         hanGiayPhepLaiXe: Date,
         nguoiDung: NguoiDung
       }

PATCH  /drivers/me/status
       Auth: JWT + DRIVER role
       Body: UpdateDriverStatusDto { trangThaiHoatDong }
       Returns: {
         message: string,
         trangThaiHoatDong: string
       }

POST   /drivers/me/locations
       Auth: JWT + DRIVER role
       Body: CreateLocationDto { viDo: number, kinhDo: number }
       Returns: {
         message: string,
         viDo: number,
         kinhDo: number,
         tripActive: boolean,
         maChuyenDi: string | null
       }
```

### Special Features
- **Extracted from JWT**: Driver ID (`maTaiXe`) is extracted from `req.user.id` automatically
- **No Admin Routes**: All driver routes are self-service (drivers can only update their own profile)
- **Location Tracking**: Locations are tied to active trips; driver must have an active trip to log locations

---

# RELATIONSHIPS & ARCHITECTURE

## Entity Relationship Diagram

```
┌─────────────────┐
│   NguoiDung     │  (User - Core)
│  (nguoi_dung)   │
├─────────────────┤
│ maNguoiDung (PK)│
│ hoTen           │
│ soDienThoai     │
│ email           │
│ matKhau         │
│ vaiTro          │
│ trangThai       │
│ ngayTao         │
└────┬────────┬───┘
     │        │
     │ 1:1    │ 1:1
     ▼        ▼
  ┌──────────────────┐      ┌──────────────┐
  │  KhachHang       │      │   TaiXe      │
  │ (khach_hang)     │      │  (tai_xe)    │
  ├──────────────────┤      ├──────────────┤
  │ maKhachHang (PK) │      │maTaiXe (PK)  │
  │ diaChiMacDinh    │      │soGiayPhepLai │
  │ ghiChu           │      │canCuocCongDan│
  └────┬─────────────┘      │diemDanhGia   │
       │ 1:N                │trangThaiH... │
       │                    │trangThaiXac..│
       ▼                    │hanGiayPhep   │
    ┌──────────┐            └────┬─────────┘
    │   Xe     │                 │ 1:N
    │  (xe)    │                 │
    └──────────┘          ┌──────▼───────┐
                           │  KiNangTaiXe │
                           │ (ki_nang)    │
                           └──────────────┘

  Both KhachHang & TaiXe:
    1:N → ChuyenDi (Trips)
    1:N → BienBanBanGiao (Handover docs)
```

## Role-Based Access

| Role | Users Module | Drivers Module | Customers Module |
|------|--------------|----------------|------------------|
| ADMIN | Full CRUD + Dashboard | View all (via admin) | View all (via admin) |
| DRIVER | Read own profile (via auth) | GET /me, PATCH /me/status, POST /me/locations | N/A |
| CUSTOMER | Read own profile (via auth) | N/A | Read own profile (via auth) |

---

# ENDPOINT SUMMARY

## Admin Routes (Protected: JWT + ADMIN role)

### Users Management
- `GET /admin/users` - List all users (filter by role, status, search)
- `PUT /admin/users/:id` - Update user info
- `PATCH /admin/users/:id/toggle-status` - Enable/disable account

### Drivers Management  
- `GET /admin/drivers` - List all drivers
- `PUT /admin/drivers/:id` - Update driver credentials
- `GET /admin/drivers/pending` - Pending approvals
- `POST /admin/drivers/:id/approve` - Approve driver registration

### Customers Management
- `GET /admin/customers` - List all customers

### Vehicles Management
- `GET /admin/vehicles` - List all vehicles
- `DELETE /admin/vehicles/:id` - Delete vehicle

### Other
- `GET /admin/complaints` - List complaints
- `GET /admin/dashboard/metrics` - Dashboard statistics

## Driver Routes (Protected: JWT + DRIVER role)

### Self-Service Endpoints
- `GET /drivers/me` - Get own profile
- `PATCH /drivers/me/status` - Update status (ONLINE/OFFLINE)
- `POST /drivers/me/locations` - Update current location (GPS)

---

## Key Insights

### Users Module
- **Multitenant Design**: Single NguoiDung entity handles CUSTOMER, DRIVER, and ADMIN roles
- **Relationships**: OneToOne links to either KhachHang or TaiXe based on role
- **Search**: Full-text search across email, phone, and name fields

### Customers Module
- **Ownership**: No standalone customer endpoints; managed through Admin module
- **Linked Data**: Customer info pulled from NguoiDung entity
- **Relationships**: Connected to Vehicles, Addresses, and Trips

### Drivers Module
- **Self-Service**: Drivers manage their own status and location
- **Verification Flow**: PENDING → VERIFIED by admin
- **Location Tracking**: Real-time GPS updates linked to active trips
- **No Mutual Admin Edit**: Drivers cannot see/manage other drivers

### Database Design
- All IDs use string VARCHAR(50) for flexibility
- Timestamps use PostgreSQL timestamptz (timezone-aware)
- Status fields are varchar enums (could be migrated to proper ENUM type)
- Cascading deletes: User deletion removes related Customer/Driver records

