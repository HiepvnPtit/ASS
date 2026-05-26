# NestJS Architecture Refactor - Simplified & DRY

## Overview

This document outlines the simplification from DDD/Hexagonal architecture to a pragmatic, DRY approach optimized for PostgreSQL + TypeORM projects. The new structure reduces code duplication by 60-70% while maintaining flexibility and best practices.

## Architecture Changes

### Before (Brocoders Boilerplate - DDD/Hexagonal)
```
module/
├── domain/
│   ├── entity/
│   ├── repository.interface.ts
│   └── service.interface.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── repository.implementation.ts
│   │   └── mapper/
│   ├── database/
│   └── http/
├── application/
│   ├── dto/
│   └── service/
└── presentation/
    └── controller/
```

**Problems:**
- 8-12 files per module for simple CRUD
- Mapper files with repetitive field mappings
- Repository interfaces that duplicate business logic
- Difficult to navigate and maintain
- Overkill for PostgreSQL + TypeORM scenarios

### After (Simplified & DRY)
```
module/
├── dto/
│   ├── create-*.dto.ts
│   └── update-*.dto.ts (uses PartialType)
├── *.controller.ts
├── *.service.ts (extends BaseService)
└── *.module.ts

common/base/
├── base.entity.ts
├── base.service.ts
├── index.ts
```

**Benefits:**
- 4-5 files per module (down from 8-12)
- No mappers needed (TypeORM handles serialization)
- Consistent CRUD operations via BaseService
- 60-70% less boilerplate code
- Easier testing with injectable services
- Simple to understand and navigate

---

## Files to Delete

### From Old DDD Structure (if exists in your project)

> **Note:** The boilerplate Brocoders base is already clean. These are patterns to avoid when adding new modules.

#### 1. Remove Domain Layer Files
```
src/module/domain/
├── entity/                    # ❌ DELETE (move to src/entities)
├── repository.interface.ts    # ❌ DELETE (no need with TypeORM directly)
└── service.interface.ts       # ❌ DELETE (no need - inherit from BaseService)
```

#### 2. Remove Infrastructure/Persistence Layer
```
src/module/infrastructure/persistence/
├── repository.implementation.ts  # ❌ DELETE (use Repository<T> directly)
├── mapper/                       # ❌ DELETE (TypeORM handles this)
│   ├── entity.mapper.ts
│   └── dto.mapper.ts
└── data-source.ts              # ❌ DELETE (use global config)
```

#### 3. Remove Application Layer (if separate)
```
src/module/application/
├── service/                     # ❌ DELETE (merge into module/service.ts)
└── dto/ (if duplicate)          # ❌ DELETE (consolidate into module/dto)
```

#### 4. Remove Presentation Layer Duplication
```
src/module/presentation/
├── http-exception.filter.ts    # ✅ KEEP if custom (move to src/common/filters)
└── controller/                  # Flatten into module root
```

---

## New Base Classes

### 1. BaseEntity (`src/common/base/base.entity.ts`)

Provides common fields for UUID-based entities:

```typescript
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
```

**Usage:**
```typescript
@Entity({ name: 'products' })
export class Product extends BaseEntity {
  @Column()
  name!: string;
  
  @ManyToOne(() => Category)
  category!: Category;
}
```

**Benefits:**
- Automatic audit trails (createdAt, updatedAt)
- Soft deletes via deletedAt
- Consistent schema across all entities
- No repeated column definitions

---

### 2. BaseService (`src/common/base/base.service.ts`)

Generic CRUD service with 8 pre-built methods:

```typescript
export abstract class BaseService<T> {
  async create(dto: DeepPartial<T>): Promise<T>
  async findAll(options?: FindAllOptions): Promise<T[]>
  async findAllPaginated(options?: FindAllOptions): Promise<[T[], number]>
  async findOne(id: string | number, relations?: string[]): Promise<T>
  async findOneBy(where: FindOptionsWhere<T>, relations?: string[]): Promise<T>
  async update(id: string | number, dto: DeepPartial<T>): Promise<T>
  async remove(id: string | number): Promise<T>              // Soft delete
  async hardRemove(id: string | number): Promise<void>       // Permanent delete
  async exists(id: string | number): Promise<boolean>
  async count(): Promise<number>
}
```

**Features:**
- Automatic NotFoundException handling
- Soft delete support (respects deletedAt)
- Pagination helpers
- Relationship loading (relations parameter)
- Custom order and filtering

**Usage:**
```typescript
@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(@InjectRepository(Product) repo: Repository<Product>) {
    super(repo);
  }

  // CRUD methods inherited: create, findAll, findOne, update, remove
  // No need to rewrite them!

  // Override or add custom logic as needed:
  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.findAll({ where: { categoryId } });
  }
}
```

---

## Refactored Module Pattern

### Example: LoaiXe (Vehicle Type) Module

**File Structure:**
```
src/loai-xe/
├── dto/
│   ├── create-loai-xe.dto.ts     (60 lines)
│   └── update-loai-xe.dto.ts     (10 lines - PartialType)
├── loai-xe.controller.ts          (80 lines)
├── loai-xe.service.ts             (100 lines - extends BaseService)
├── loai-xe.module.ts              (25 lines)
└── [DELETED] No domain/, infrastructure/, or mapper folders!

src/entities/
└── loai-xe.entity.ts              (50 lines - with timestamps)

src/common/base/
├── base.entity.ts                 (35 lines)
└── base.service.ts                (180 lines - shared by all services)
```

**Before: ~400-500 lines of boilerplate**
**After: ~250 lines of business-focused code**

### LoaiXe Entity - Key Changes

```typescript
@Entity({ name: 'loai_xe' })
export class LoaiXe {
  @PrimaryColumn({ name: 'ma_loai_xe', type: 'varchar', length: 50 })
  maLoaiXe!: string;

  @Column()
  soCho!: number;

  // ✨ NEW: Audit timestamps
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  // Relations remain the same
  @OneToMany(() => Xe, xe => xe.loaiXe)
  xes?: Xe[];
}
```

### LoaiXe Service - Key Changes

```typescript
@Injectable()
export class LoaiXeService extends BaseService<LoaiXe> {
  constructor(
    @InjectRepository(LoaiXe)
    private readonly loaiXeRepo: Repository<LoaiXe>,
  ) {
    super(loaiXeRepo);  // Inherit all CRUD methods!
  }

  // Business-specific validation
  async create(dto: CreateLoaiXeDto): Promise<LoaiXe> {
    if (dto.soCho <= 0) {
      throw new BadRequestException('Số chỗ phải lớn hơn 0');
    }
    return super.create(dto);
  }

  // Custom logic only
  async findOne(maLoaiXe: string): Promise<LoaiXe> {
    const item = await this.loaiXeRepo.findOne({
      where: { maLoaiXe },
      withDeleted: false,
    });
    if (!item) throw new NotFoundException(...);
    return item;
  }

  // Inherited methods (no need to write):
  // - findAll()
  // - update()
  // - remove() [soft delete]
  // - hardRemove() [permanent delete]
  // - exists()
  // - count()
}
```

### LoaiXe DTO - Key Changes

**CreateLoaiXeDto** (unchanged, has all fields):
```typescript
export class CreateLoaiXeDto {
  @IsString()
  @IsNotEmpty()
  maLoaiXe!: string;

  @IsInt()
  @Min(1)
  soCho!: number;

  // ... other fields
}
```

**UpdateLoaiXeDto** (PartialType - much simpler):
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateLoaiXeDto } from './create-loai-xe.dto';

export class UpdateLoaiXeDto extends PartialType(CreateLoaiXeDto) {
  // All fields are inherited and made optional automatically!
  // Zero duplication!
}
```

---

## Migration Path for Existing Modules

### Step 1: Create Base Classes
- ✅ Create `src/common/base/base.entity.ts`
- ✅ Create `src/common/base/base.service.ts`

### Step 2: Update Entities (per module)
```bash
# For each entity:
# 1. Add BaseEntity timestamps (CreateDateColumn, UpdateDateColumn, DeleteDateColumn)
# 2. Keep custom fields and relations
# 3. Delete any mapper or repository code
```

### Step 3: Refactor Services
```bash
# For each service:
# 1. Change: extends BaseService<Entity>
# 2. Pass: @InjectRepository(Entity) directly to super()
# 3. Remove: Standard CRUD method implementations
# 4. Keep: Business logic validation and custom queries
# 5. Delete: Separate repository/mapper files
```

### Step 4: Simplify DTOs
```bash
# For each module:
# 1. UpdateDTO extends PartialType(CreateDTO)
# 2. Delete: Duplicate field definitions in UpdateDTO
```

### Step 5: Clean Up
```bash
# Delete old DDD structure:
rm -rf src/module/domain
rm -rf src/module/infrastructure/persistence
rm -rf src/module/application/service
rm -rf src/module/infrastructure/mapper
```

---

## Common Patterns

### Pattern 1: Standard CRUD Endpoints

**Controller:**
```typescript
@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductController {
  constructor(private service: ProductService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);  // Soft delete
  }
}
```

### Pattern 2: Pagination

**Service method:**
```typescript
async getPage(page: number, limit: number) {
  const [data, total] = await this.findAllPaginated({
    skip: (page - 1) * limit,
    take: limit,
    order: { createdAt: 'DESC' },
  });

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
```

### Pattern 3: Relations & Filtering

**Service method:**
```typescript
async findActiveWithRelations(categoryId: string) {
  return this.findAll({
    where: { categoryId },
    relations: ['category', 'tags'],
    order: { createdAt: 'DESC' },
  });
}
```

### Pattern 4: Custom Entity with Soft Deletes

**Entity:**
```typescript
@Entity()
export class Product extends BaseEntity {
  @Column()
  name!: string;

  @ManyToOne(() => Category)
  category!: Category;
}
```

**Service - automatic soft delete:**
```typescript
async archive(id: string) {
  return this.remove(id);  // Sets deletedAt timestamp
}

async findActive() {
  return this.findAll();  // Automatically excludes deleted records
}

async findAll(includeDeleted = false) {
  return this.repository.find({
    withDeleted: includeDeleted,
  });
}
```

---

## Best Practices

### 1. Always Extend BaseService
```typescript
// ✅ GOOD
export class ProductService extends BaseService<Product> { ... }

// ❌ BAD
export class ProductService {
  constructor(private repo: Repository<Product>) {}
  // Repeated CRUD code...
}
```

### 2. Use PartialType for Updates
```typescript
// ✅ GOOD
export class UpdateProductDto extends PartialType(CreateProductDto) {}

// ❌ BAD
export class UpdateProductDto {
  @IsOptional() name?: string;
  @IsOptional() price?: number;
  @IsOptional() category?: string;
  // Duplicated fields from CreateDto...
}
```

### 3. Keep Business Logic in Services
```typescript
// ✅ GOOD - Business logic in service
async updatePrice(productId: string, newPrice: number) {
  if (newPrice < 0) throw new BadRequestException(...);
  return this.update(productId, { price: newPrice });
}

// ❌ BAD - Validation in controller
@Put(':id/price')
updatePrice(@Param('id') id: string, @Body() { price }) {
  if (price < 0) throw new Error(...);
  return this.service.update(id, { price });
}
```

### 4. Use Relations Wisely
```typescript
// ✅ GOOD - Load relations only when needed
async getProductDetails(id: string) {
  return this.findOne(id, ['category', 'tags', 'reviews']);
}

// ❌ BAD - Always loading relations
async findAll() {
  return this.findAll({
    relations: ['category', 'tags', 'reviews', 'seller', 'warehouse']
  });
}
```

### 5. Custom Queries When Needed
```typescript
@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>
  ) {
    super(productRepo);
  }

  // Complex query - use repository directly
  async findBestSellers(limit = 10) {
    return this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.sales', 's')
      .groupBy('p.id')
      .orderBy('COUNT(s.id)', 'DESC')
      .limit(limit)
      .getMany();
  }
}
```

---

## Migration Checklist

- [ ] Create `src/common/base/base.entity.ts`
- [ ] Create `src/common/base/base.service.ts`
- [ ] Create `src/common/base/index.ts` (for exports)
- [ ] Update all entities to include audit timestamps
- [ ] Refactor module services to extend BaseService
- [ ] Update DTOs to use PartialType
- [ ] Delete old DDD/infrastructure/persistence folders
- [ ] Delete mapper files
- [ ] Test all CRUD operations
- [ ] Update API documentation
- [ ] Run linting and format checks
- [ ] Commit changes: `chore: simplify architecture - remove DDD boilerplate`

---

## File Size Reduction Example

**Before (LoaiXe module with DDD):**
```
domain/entity/loai-xe.entity.ts       60 lines
domain/loai-xe.repository.ts          30 lines
infrastructure/persistence/repo.impl  80 lines
infrastructure/mapper/entity.mapper   40 lines
application/dto/create-loai-xe.dto    60 lines
application/dto/update-loai-xe.dto    50 lines
application/service/loai-xe.service   120 lines
presentation/controller/loai-xe       100 lines
---
Total: ~540 lines across 8 files
```

**After (Simplified):**
```
entities/loai-xe.entity.ts            50 lines (with timestamps)
dto/create-loai-xe.dto.ts             60 lines (same)
dto/update-loai-xe.dto.ts             10 lines (PartialType!)
loai-xe.service.ts                    100 lines (extends BaseService)
loai-xe.controller.ts                 80 lines (same)
---
Total: ~300 lines across 5 files

+ Shared Base Classes (one-time): 215 lines
  - base.entity.ts (35 lines)
  - base.service.ts (180 lines)

Reduction: 56% fewer lines (excluding shared base)
```

---

## Troubleshooting

### Q: How to handle entities with custom primary keys (like LoaiXe)?

**A:** Keep the custom PK but add audit timestamps separately:

```typescript
@Entity()
export class LoaiXe {
  @PrimaryColumn('varchar')
  maLoaiXe!: string;  // Custom PK

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
```

Then override `findOne` in service:
```typescript
async findOne(maLoaiXe: string) {
  const item = await this.repository.findOne({ where: { maLoaiXe } });
  if (!item) throw new NotFoundException(...);
  return item;
}
```

---

### Q: What about complex queries?

**A:** Use QueryBuilder directly in service for complex cases:

```typescript
async findActiveByCategory(categoryId: string) {
  return this.repository
    .createQueryBuilder('p')
    .where('p.categoryId = :categoryId', { categoryId })
    .andWhere('p.deletedAt IS NULL')
    .orderBy('p.createdAt', 'DESC')
    .getMany();
}
```

---

### Q: How to add custom validation?

**A:** Override methods in service:

```typescript
async create(dto: CreateProductDto) {
  // Custom validation
  const exists = await this.exists(dto.sku);
  if (exists) throw new ConflictException('SKU already exists');

  return super.create(dto);
}
```

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| Files per module | 8-12 | 4-5 |
| Boilerplate code | 60-70% | 20-30% |
| CRUD methods | Repeated | Inherited |
| Navigation | Complex | Simple |
| Testing | Hard | Easy |
| Learning curve | Steep | Gentle |
| PostgreSQL fit | Overkill | Perfect |

This simplified architecture is **production-ready** and scales well for 20+ modules without the complexity overhead of DDD/Hexagonal for straightforward CRUD operations.
