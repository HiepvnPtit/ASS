# Admin Full CRUD Controllers - Complete Implementation Guide

## Overview

This guide explains how to implement Full CRUD access for Admin on all database tables using the powerful `BaseControllerFactory` pattern.

## Architecture

### Components

1. **BaseControllerFactory** - Factory function that generates dynamic controllers with all CRUD endpoints
2. **BaseService** - Abstract service class providing standard CRUD operations
3. **Admin Controllers** - Specific controllers extending BaseControllerFactory for each entity
4. **Roles-based Security** - JWT authentication + Role-based access control (RBAC)

## Implementation Pattern

### Basic Structure

```typescript
// Step 1: Create Admin Controller by extending BaseControllerFactory
@ApiTags('Admin - Full Access')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Controller('admin/entity-name')
export class AdminEntityController extends BaseControllerFactory(
  Entity,
  CreateDto,
  UpdateDto,
) {
  constructor(private readonly service: EntityService) {
    super(service);
  }
}
```

### Key Requirements

1. **API Path Prefix**: `/admin/` (e.g., `/admin/loai-xe`, `/admin/trips`)
2. **Security Decorators**:
   - `@ApiBearerAuth('JWT')` - Swagger documentation
   - `@UseGuards(AuthGuard('jwt'), RolesGuard)` - Enforce authentication & roles
   - `@Roles('ADMIN')` - Restrict to ADMIN role only
3. **Service**: Must extend `BaseService<Entity>`
4. **DTOs**: Create and Update DTOs for validation

## Implemented Admin Controllers

### 1. AdminLoaiXeController (`src/admin/controllers/admin-loai-xe.controller.ts`)

**Entity**: `LoaiXe` (Vehicle Types)
**Endpoints**:
- `POST /admin/loai-xe` - Create new vehicle type
- `GET /admin/loai-xe/page?page=1&limit=10` - Paginated list
- `GET /admin/loai-xe/all` - All records
- `GET /admin/loai-xe/:id` - Get by ID
- `PUT /admin/loai-xe/:id` - Update
- `DELETE /admin/loai-xe/:id` - Soft delete
- `POST /admin/loai-xe/:id/restore` - Restore deleted

**Service**: `LoaiXeService` (existing)

### 2. AdminBangGiaController (`src/admin/controllers/admin-bang-gia.controller.ts`)

**Entity**: `BangGia` (Price Tables)
**Endpoints**: Same pattern as above, path `/admin/bang-gia`
**Service**: `BangGiaService` (existing)

### 3. AdminVehiclesController (`src/admin/controllers/admin-vehicles.controller.ts`)

**Entity**: `Xe` (Vehicles)
**Endpoints**: Same pattern as above, path `/admin/vehicles`
**Service**: `VehiclesService` (existing)

### 4. AdminTripsController (`src/admin/controllers/admin-trips.controller.ts`)

**Entity**: `ChuyenDi` (Trips)
**Endpoints**: Same pattern as above, path `/admin/trips`
**Service**: `TripsService` (existing)

### 5. AdminPaymentsController (`src/admin/controllers/admin-payments.controller.ts`)

**Entity**: `ThanhToan` (Payments)
**Endpoints**: Same pattern as above, path `/admin/payments`
**Service**: `PaymentsService` (newly created in `src/payments/`)

### 6. AdminReviewsController (`src/admin/controllers/admin-reviews.controller.ts`)

**Entity**: `DanhGia` (Reviews)
**Endpoints**: Same pattern as above, path `/admin/reviews`
**Service**: `ReviewsService` (newly created in `src/reviews/`)

## Auto-Generated Endpoints by BaseControllerFactory

All Admin Controllers automatically include these CRUD endpoints:

### 1. Create
```
POST /admin/{resource}
Body: CreateDto (validated)
Returns: 201 Created (entity)
Guards: JWT + ADMIN role
```

### 2. Read (List Paginated)
```
GET /admin/{resource}/page?page=1&limit=10
Query: page (default 1), limit (default 10)
Returns: { data: Entity[], meta: { total, page, limit, totalPages } }
```

### 3. Read (All Records)
```
GET /admin/{resource}/all
Returns: Entity[]
⚠️ Use with caution for large datasets
```

### 4. Read (Single)
```
GET /admin/{resource}/:id
Returns: Entity
```

### 5. Update
```
PUT /admin/{resource}/:id
Body: UpdateDto (partial, all fields optional)
Returns: 200 OK (updated entity)
```

### 6. Delete (Soft)
```
DELETE /admin/{resource}/:id
Returns: 200 OK (soft-deleted entity)
Note: Sets deletedAt timestamp, doesn't remove from DB
```

### 7. Restore (Soft Delete)
```
POST /admin/{resource}/:id/restore
Returns: 200 OK (restored entity)
Note: Clears deletedAt timestamp
```

## Security Architecture

### Authentication
- **Guard**: `AuthGuard('jwt')` from @nestjs/passport
- **Source**: JWT token from Authorization header
- **Payload**: User object with `vaiTro` field

### Authorization
- **Guard**: `RolesGuard` from `src/auth/guards/roles.guard`
- **Role Check**: User `vaiTro` must match `@Roles('ADMIN')`
- **Guard Chain**: `@UseGuards(AuthGuard('jwt'), RolesGuard)`

### Example JWT Payload
```json
{
  "id": "uuid-here",
  "email": "admin@example.com",
  "vaiTro": "ADMIN",
  "iat": 1234567890,
  "exp": 1234571490
}
```

## Module Integration

### AdminModule Setup
```typescript
// src/admin/admin.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([...]),
    AuthModule,
    // Entity-specific modules
    LoaiXeModule,
    BangGiaModule,
    VehiclesModule,
    TripsModule,
    PaymentsModule,      // New
    ReviewsModule,       // New
  ],
  controllers: [
    AdminController,
    AdminLoaiXeController,
    AdminBangGiaController,
    AdminVehiclesController,
    AdminTripsController,
    AdminPaymentsController,
    AdminReviewsController,
  ],
  providers: [AdminService],
})
export class AdminModule {}
```

## Creating Custom Admin Controllers

To add an Admin Controller for a new entity:

### Step 1: Ensure Service Extends BaseService

```typescript
@Injectable()
export class MyEntityService extends BaseService<MyEntity> {
  constructor(
    @InjectRepository(MyEntity)
    private readonly repo: Repository<MyEntity>,
  ) {
    super(repo);
  }
}
```

### Step 2: Create Admin Controller

```typescript
// src/admin/controllers/admin-my-entity.controller.ts
import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseControllerFactory } from '../../common/base';
import { MyEntityService } from '../../my-entity/my-entity.service';
import { MyEntity } from '../../entities/my-entity.entity';
import { CreateMyEntityDto } from '../../my-entity/dto/create-my-entity.dto';
import { UpdateMyEntityDto } from '../../my-entity/dto/update-my-entity.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Admin - Full Access')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Controller('admin/my-entity')
export class AdminMyEntityController extends BaseControllerFactory(
  MyEntity,
  CreateMyEntityDto,
  UpdateMyEntityDto,
) {
  constructor(private readonly service: MyEntityService) {
    super(service);
  }
}
```

### Step 3: Register in AdminModule

```typescript
// src/admin/admin.module.ts
@Module({
  imports: [
    // ... other imports
    MyEntityModule,
  ],
  controllers: [
    // ... other controllers
    AdminMyEntityController,
  ],
})
export class AdminModule {}
```

## Testing Admin Endpoints

### Example API Call (cURL)

```bash
# Get JWT Token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Response:
# { "accessToken": "eyJhbGc..." }

# Create LoaiXe
curl -X POST http://localhost:3000/admin/loai-xe \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"maLoaiXe":"LX001","soCho":4}'

# Get Paginated List
curl http://localhost:3000/admin/loai-xe/page?page=1&limit=10 \
  -H "Authorization: Bearer eyJhbGc..."

# Get Single
curl http://localhost:3000/admin/loai-xe/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGc..."

# Update
curl -X PUT http://localhost:3000/admin/loai-xe/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"soCho":5}'

# Soft Delete
curl -X DELETE http://localhost:3000/admin/loai-xe/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGc..."

# Restore
curl -X POST http://localhost:3000/admin/loai-xe/550e8400-e29b-41d4-a716-446655440000/restore \
  -H "Authorization: Bearer eyJhbGc..."
```

## BaseControllerFactory Features

### Auto-Generated Features
✅ All 7 CRUD endpoints (Create, Read, Read-Paginated, Read-All, Update, Soft Delete, Restore)
✅ Full Swagger documentation with examples
✅ Input validation via DTOs and ValidationPipe
✅ Error handling (404 NotFoundException, 400 BadRequestException)
✅ Soft delete & restore support
✅ Pagination with metadata
✅ JWT authentication on all endpoints
✅ Role-based access control

### Manual Overrides (if needed)
```typescript
export class AdminMyEntityController extends BaseControllerFactory(...) {
  constructor(private readonly service: MyEntityService) {
    super(service);
  }

  // Override if custom logic needed
  async findOne(@Param('id') id: string): Promise<MyEntity> {
    // Custom logic here
    return super.findOne(id);
  }
}
```

## Best Practices

1. **Use baseControllerFactory for CRUD** - No need to write endpoints manually
2. **Always extend BaseService** - Provides standard CRUD operations
3. **Create/Update DTOs for validation** - Use class-validator decorators
4. **Export services from modules** - Allow other modules to use them
5. **Role check on class** - Use `@Roles('ADMIN')` on class, not individual methods
6. **Soft delete best practice** - Always use soft delete, hard delete rarely
7. **Pagination for large data** - Use `/page` endpoint, not `/all`
8. **Monitor API usage** - Log admin actions for audit trails

## File Structure

```
src/
├── admin/
│   ├── controllers/
│   │   ├── admin-loai-xe.controller.ts
│   │   ├── admin-bang-gia.controller.ts
│   │   ├── admin-vehicles.controller.ts
│   │   ├── admin-trips.controller.ts
│   │   ├── admin-payments.controller.ts
│   │   └── admin-reviews.controller.ts
│   ├── admin.controller.ts        (User management)
│   ├── admin.service.ts
│   └── admin.module.ts
├── payments/
│   ├── payments.service.ts        (extends BaseService)
│   └── payments.module.ts         (New)
├── reviews/
│   ├── reviews.service.ts         (extends BaseService)
│   └── reviews.module.ts          (New)
└── ...
```

## Summary

The implementation provides:
- ✅ Complete CRUD admin access to all database tables
- ✅ Automatic endpoint generation via BaseControllerFactory
- ✅ Security through JWT + Role-based access control
- ✅ Soft delete with restore capability
- ✅ Full Swagger documentation
- ✅ Input validation & error handling
- ✅ DRY (Don't Repeat Yourself) architecture

All with minimal code! Each Admin Controller is just 20-30 lines of code.
