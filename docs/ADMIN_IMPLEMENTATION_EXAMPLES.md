# Admin Full CRUD Controllers - Implementation Examples

This document provides complete, ready-to-use code examples for all 6 Admin Controllers.

## Example 1: AdminLoaiXeController

**File**: `src/admin/controllers/admin-loai-xe.controller.ts`

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseControllerFactory } from '../../common/base';
import { LoaiXeService } from '../../loai-xe/loai-xe.service';
import { LoaiXe } from '../../entities/loai-xe.entity';
import { CreateLoaiXeDto } from '../../loai-xe/dto/create-loai-xe.dto';
import { UpdateLoaiXeDto } from '../../loai-xe/dto/update-loai-xe.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Admin Loai Xe Controller - Full CRUD for Vehicle Types
 *
 * All endpoints:
 * - Require JWT authentication
 * - Require ADMIN role
 * - Support soft delete & restore
 */
@ApiTags('Admin - Full Access')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Controller('admin/loai-xe')
export class AdminLoaiXeController extends BaseControllerFactory(
  LoaiXe,
  CreateLoaiXeDto,
  UpdateLoaiXeDto,
) {
  constructor(private readonly service: LoaiXeService) {
    super(service);
  }
}
```

**Auto-Generated Endpoints**:
- `POST /admin/loai-xe` - Create
- `GET /admin/loai-xe/page` - List paginated
- `GET /admin/loai-xe/all` - All records
- `GET /admin/loai-xe/:id` - Get by ID
- `PUT /admin/loai-xe/:id` - Update
- `DELETE /admin/loai-xe/:id` - Soft delete
- `POST /admin/loai-xe/:id/restore` - Restore

---

## Example 2: AdminBangGiaController

**File**: `src/admin/controllers/admin-bang-gia.controller.ts`

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseControllerFactory } from '../../common/base';
import { BangGiaService } from '../../bang-gia/bang-gia.service';
import { BangGia } from '../../entities/bang-gia.entity';
import { CreateBangGiaDto } from '../../bang-gia/dto/create-bang-gia.dto';
import { UpdateBangGiaDto } from '../../bang-gia/dto/update-bang-gia.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Admin Bang Gia Controller - Full CRUD for Price Tables
 */
@ApiTags('Admin - Full Access')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Controller('admin/bang-gia')
export class AdminBangGiaController extends BaseControllerFactory(
  BangGia,
  CreateBangGiaDto,
  UpdateBangGiaDto,
) {
  constructor(private readonly service: BangGiaService) {
    super(service);
  }
}
```

---

## Example 3: AdminVehiclesController

**File**: `src/admin/controllers/admin-vehicles.controller.ts`

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseControllerFactory } from '../../common/base';
import { VehiclesService } from '../../vehicles/vehicles.service';
import { Xe } from '../../entities/xe.entity';
import { CreateVehicleDto } from '../../vehicles/dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../../vehicles/dto/update-vehicle.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Admin Vehicles Controller - Full CRUD for Vehicles
 */
@ApiTags('Admin - Full Access')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Controller('admin/vehicles')
export class AdminVehiclesController extends BaseControllerFactory(
  Xe,
  CreateVehicleDto,
  UpdateVehicleDto,
) {
  constructor(private readonly service: VehiclesService) {
    super(service);
  }
}
```

---

## Example 4: AdminTripsController

**File**: `src/admin/controllers/admin-trips.controller.ts`

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseControllerFactory } from '../../common/base';
import { TripsService } from '../../trips/trips.service';
import { ChuyenDi } from '../../entities/chuyen-di.entity';
import { CreateTripDto } from '../../trips/dto/create-trip.dto';
import { UpdateTripDto } from '../../trips/dto/update-trip.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Admin Trips Controller - Full CRUD for Trips
 */
@ApiTags('Admin - Full Access')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Controller('admin/trips')
export class AdminTripsController extends BaseControllerFactory(
  ChuyenDi,
  CreateTripDto,
  UpdateTripDto,
) {
  constructor(private readonly service: TripsService) {
    super(service);
  }
}
```

---

## Example 5: AdminPaymentsController

**File**: `src/admin/controllers/admin-payments.controller.ts`

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseControllerFactory } from '../../common/base';
import { PaymentsService } from '../../payments/payments.service';
import { ThanhToan } from '../../entities/thanh-toan.entity';
import { CreatePaymentDto } from '../../trips/dto/create-payment.dto';
import { UpdatePaymentStatusDto } from '../../trips/dto/update-payment-status.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Admin Payments Controller - Full CRUD for Payments
 */
@ApiTags('Admin - Full Access')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Controller('admin/payments')
export class AdminPaymentsController extends BaseControllerFactory(
  ThanhToan,
  CreatePaymentDto,
  UpdatePaymentStatusDto,
) {
  constructor(private readonly service: PaymentsService) {
    super(service);
  }
}
```

---

## Example 6: AdminReviewsController

**File**: `src/admin/controllers/admin-reviews.controller.ts`

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseControllerFactory } from '../../common/base';
import { ReviewsService } from '../../reviews/reviews.service';
import { DanhGia } from '../../entities/danh-gia.entity';
import { CreateReviewDto } from '../../trips/dto/create-review.dto';
import { UpdateReviewDto } from '../../trips/dto/update-review.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Admin Reviews Controller - Full CRUD for Reviews
 */
@ApiTags('Admin - Full Access')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Controller('admin/reviews')
export class AdminReviewsController extends BaseControllerFactory(
  DanhGia,
  CreateReviewDto,
  UpdateReviewDto,
) {
  constructor(private readonly service: ReviewsService) {
    super(service);
  }
}
```

---

## AdminModule Updated

**File**: `src/admin/admin.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { LoaiXeModule } from '../loai-xe/loai-xe.module';
import { BangGiaModule } from '../bang-gia/bang-gia.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { TripsModule } from '../trips/trips.module';
import { PaymentsModule } from '../payments/payments.module';
import { ReviewsModule } from '../reviews/reviews.module';

import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminLoaiXeController } from './controllers/admin-loai-xe.controller';
import { AdminBangGiaController } from './controllers/admin-bang-gia.controller';
import { AdminVehiclesController } from './controllers/admin-vehicles.controller';
import { AdminTripsController } from './controllers/admin-trips.controller';
import { AdminPaymentsController } from './controllers/admin-payments.controller';
import { AdminReviewsController } from './controllers/admin-reviews.controller';

import { NguoiDung } from '../entities/nguoi-dung.entity';
import { TaiXe } from '../entities/tai-xe.entity';
import { KhachHang } from '../entities/khach-hang.entity';
import { Xe } from '../entities/xe.entity';
import { KhieuNai } from '../entities/khieu-nai.entity';
import { ChuyenDi } from '../entities/chuyen-di.entity';

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
    LoaiXeModule,
    BangGiaModule,
    VehiclesModule,
    TripsModule,
    PaymentsModule,
    ReviewsModule,
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
  exports: [AdminService],
})
export class AdminModule {}
```

---

## New Services Created

### PaymentsService

**File**: `src/payments/payments.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../common/base/base.service';
import { ThanhToan } from '../entities/thanh-toan.entity';
import { CreatePaymentDto } from '../trips/dto/create-payment.dto';
import { UpdatePaymentStatusDto } from '../trips/dto/update-payment-status.dto';

@Injectable()
export class PaymentsService extends BaseService<ThanhToan> {
  constructor(
    @InjectRepository(ThanhToan)
    private readonly paymentsRepo: Repository<ThanhToan>,
  ) {
    super(paymentsRepo);
  }

  async create(dto: CreatePaymentDto): Promise<ThanhToan> {
    return super.create(dto as any);
  }

  async findAllWithRelations(relations?: string[]): Promise<ThanhToan[]> {
    return super.findAll({
      relations,
      order: { createdAt: 'DESC' } as any,
    });
  }

  async updatePaymentStatus(
    id: string,
    dto: UpdatePaymentStatusDto,
  ): Promise<ThanhToan> {
    return super.update(id, dto as any);
  }

  async findPaymentsByTrip(tripId: string): Promise<ThanhToan[]> {
    return this.paymentsRepo.find({
      where: { maChuyenDi: tripId },
      order: { createdAt: 'DESC' },
    });
  }
}
```

### PaymentsModule

**File**: `src/payments/payments.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThanhToan } from '../entities/thanh-toan.entity';
import { PaymentsService } from './payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([ThanhToan])],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
```

### ReviewsService

**File**: `src/reviews/reviews.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../common/base/base.service';
import { DanhGia } from '../entities/danh-gia.entity';
import { CreateReviewDto } from '../trips/dto/create-review.dto';

@Injectable()
export class ReviewsService extends BaseService<DanhGia> {
  constructor(
    @InjectRepository(DanhGia)
    private readonly reviewsRepo: Repository<DanhGia>,
  ) {
    super(reviewsRepo);
  }

  async create(dto: CreateReviewDto): Promise<DanhGia> {
    return super.create(dto as any);
  }

  async findAllWithRelations(relations?: string[]): Promise<DanhGia[]> {
    return super.findAll({
      relations,
      order: { createdAt: 'DESC' } as any,
    });
  }

  async findReviewsByTrip(tripId: string): Promise<DanhGia[]> {
    return this.reviewsRepo.find({
      where: { maChuyenDi: tripId },
      order: { createdAt: 'DESC' },
    });
  }

  async findReviewsByRating(rating: number): Promise<DanhGia[]> {
    return this.reviewsRepo.find({
      where: { soSao: rating },
      order: { createdAt: 'DESC' },
    });
  }

  async getAverageRatingForTrip(tripId: string): Promise<number> {
    const result = await this.reviewsRepo
      .createQueryBuilder('review')
      .select('AVG(review.soSao)', 'avgRating')
      .where('review.maChuyenDi = :tripId', { tripId })
      .getRawOne();

    return result?.avgRating || 0;
  }
}
```

### ReviewsModule

**File**: `src/reviews/reviews.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DanhGia } from '../entities/danh-gia.entity';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [TypeOrmModule.forFeature([DanhGia])],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
```

---

## Additional DTOs Created

### UpdateTripDto

**File**: `src/trips/dto/update-trip.dto.ts`

```typescript
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTripDto {
  @ApiPropertyOptional({ example: 'CD123', description: 'Mã chuyến đi' })
  @IsOptional()
  @IsString()
  maChuyenDi?: string;

  @ApiPropertyOptional({ example: 'KH123', description: 'Mã khách hàng' })
  @IsOptional()
  @IsString()
  maKhachHang?: string;

  // ... other optional fields
}
```

### UpdateReviewDto

**File**: `src/trips/dto/update-review.dto.ts`

```typescript
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    example: 4,
    description: 'Số sao đánh giá (1-5)',
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  soSao?: number;

  @ApiPropertyOptional({
    example: 'Tài xế rất chuyên nghiệp',
    description: 'Nội dung đánh giá',
  })
  @IsOptional()
  @IsString()
  noiDung?: string;
}
```

---

## API Usage Examples

### 1. Create LoaiXe
```bash
curl -X POST http://localhost:3000/admin/loai-xe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maLoaiXe": "LX001",
    "soCho": 4
  }'
```

### 2. List Loai Xe (Paginated)
```bash
curl http://localhost:3000/admin/loai-xe/page?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Update Bang Gia
```bash
curl -X PUT http://localhost:3000/admin/bang-gia/:id \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maBangGia": "BG002",
    "khuVuc": "HCM"
  }'
```

### 4. Soft Delete Trip
```bash
curl -X DELETE http://localhost:3000/admin/trips/:id \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Restore Deleted Trip
```bash
curl -X POST http://localhost:3000/admin/trips/:id/restore \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Swagger Documentation

All endpoints are automatically documented in Swagger UI:
- URL: `http://localhost:3000/api/docs`
- Tag: **Admin - Full Access**
- All endpoints show:
  - Request/Response schemas
  - Example values
  - Required fields
  - Authentication requirements
  - Error responses
