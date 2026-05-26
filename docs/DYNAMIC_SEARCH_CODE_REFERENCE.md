# 📄 Dynamic Search - Code Reference

## Complete Updated Files

### File 1: `src/admin/dto/get-users-query.dto.ts`

```typescript
import { IsOptional, IsString, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN',
}

export enum UserStatusFilter {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
}

export class GetUsersQueryDto {
  @ApiProperty({
    example: 1,
    description: 'Trang (từ 1 trở lên)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    example: 20,
    description: 'Số lượng kết quả trên trang',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    enum: UserRole,
    example: 'CUSTOMER',
    description: 'Lọc theo vai trò',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  vaiTro?: UserRole;

  @ApiProperty({
    enum: UserStatusFilter,
    example: 'ACTIVE',
    description: 'Lọc theo trạng thái',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatusFilter)
  trangThai?: UserStatusFilter;

  @ApiProperty({
    example: '{"hoTen":"John","email":"john"}',
    description:
      'Tìm kiếm động theo các trường. Có thể truyền JSON string hoặc object. ' +
      'Các trường được phép: hoTen, email, soDienThoai. ' +
      'Ví dụ: ?search={"hoTen":"John"} hoặc ?search=john@example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
```

---

### File 2: `src/admin/admin.service.ts` (Key Methods)

```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { NguoiDung } from '../entities/nguoi-dung.entity';
import { TaiXe } from '../entities/tai-xe.entity';
import { KhachHang } from '../entities/khach-hang.entity';
import { Xe } from '../entities/xe.entity';
import { KhieuNai } from '../entities/khieu-nai.entity';
import { ChuyenDi } from '../entities/chuyen-di.entity';
import { ApproveDriverDto } from './dto/approve-driver.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ToggleUserStatusDto } from './dto/toggle-user-status.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { GetPaginationQueryDto } from './dto/get-pagination-query.dto';

@Injectable()
export class AdminService {
  // ============ SECURITY: Whitelist allowed search fields ============
  private readonly ALLOWED_SEARCH_FIELDS: Set<string> = new Set([
    'hoTen',
    'email',
    'soDienThoai',
  ]);

  constructor(
    @InjectRepository(NguoiDung)
    private readonly nguoiDungRepo: Repository<NguoiDung>,
    @InjectRepository(TaiXe)
    private readonly taiXeRepo: Repository<TaiXe>,
    @InjectRepository(KhachHang)
    private readonly khachHangRepo: Repository<KhachHang>,
    @InjectRepository(Xe)
    private readonly xeRepo: Repository<Xe>,
    @InjectRepository(KhieuNai)
    private readonly khieuNaiRepo: Repository<KhieuNai>,
    @InjectRepository(ChuyenDi)
    private readonly chuyenDiRepo: Repository<ChuyenDi>,
  ) {}

  /**
   * Parse search parameter từ query string
   * Hỗ trợ: JSON string hoặc plain string
   * @param search - Search parameter
   * @returns Record<string, string> hoặc null
   */
  private parseSearchParameter(search?: string): Record<string, string> | null {
    if (!search) return null;

    try {
      // Thử parse như JSON trước
      const parsed = JSON.parse(search);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    } catch {
      // Không phải JSON, tạo object search mặc định
      // Nếu là plain string, tìm kiếm trong các trường chính
    }

    // Nếu là plain string, tìm kiếm trong tất cả các trường được phép
    // Cách này hỗ trợ backward compatibility với search cũ
    return {
      _global: search,
    };
  }

  /**
   * Validate search fields và chỉ giữ lại các trường được phép
   * @param searchObject - Raw search object
   * @returns Validated search object
   */
  private validateAndFilterSearchFields(
    searchObject: Record<string, string>,
  ): Record<string, string> {
    const validated: Record<string, string> = {};

    for (const [key, value] of Object.entries(searchObject)) {
      // Cho phép _global để tìm kiếm trên tất cả các trường
      if (key === '_global') {
        validated[key] = value;
      } else if (this.ALLOWED_SEARCH_FIELDS.has(key)) {
        validated[key] = value;
      } else {
        throw new BadRequestException(
          `Trường tìm kiếm "${key}" không được phép. ` +
            `Các trường được phép: ${Array.from(this.ALLOWED_SEARCH_FIELDS).join(', ')}`,
        );
      }
    }

    return validated;
  }

  /**
   * Lấy danh sách tất cả người dùng với filter, phân trang, tìm kiếm động
   */
  async getAllUsers(query: GetUsersQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Parse search parameter
    const rawSearch = this.parseSearchParameter(query.search);
    const searchObject = rawSearch
      ? this.validateAndFilterSearchFields(rawSearch)
      : null;

    // Khởi tạo QueryBuilder
    const queryBuilder = this.nguoiDungRepo
      .createQueryBuilder('user')
      .skip(skip)
      .take(limit)
      .orderBy('user.ngayTao', 'DESC');

    // Apply filter theo vaiTro
    if (query.vaiTro) {
      queryBuilder.andWhere('user.vaiTro = :vaiTro', {
        vaiTro: query.vaiTro,
      });
    }

    // Apply filter theo trangThai
    if (query.trangThai) {
      queryBuilder.andWhere('user.trangThai = :trangThai', {
        trangThai: query.trangThai,
      });
    }

    // Apply dynamic search
    if (searchObject && Object.keys(searchObject).length > 0) {
      // Nếu có _global, tìm kiếm trong tất cả các trường
      if (searchObject._global) {
        const searchValue = `%${searchObject._global}%`;
        const conditions = Array.from(this.ALLOWED_SEARCH_FIELDS).map(
          (field) => `user.${field} ILIKE :searchValue`,
        );
        queryBuilder.andWhere(`(${conditions.join(' OR ')})`, { searchValue });
      } else {
        // Tìm kiếm trong các trường cụ thể
        for (const [field, value] of Object.entries(searchObject)) {
          if (this.ALLOWED_SEARCH_FIELDS.has(field)) {
            const paramName = `search_${field}`;
            queryBuilder.andWhere(`user.${field} ILIKE :${paramName}`, {
              [paramName]: `%${value}%`,
            });
          }
        }
      }
    }

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users.map((u) => ({
        id: u.maNguoiDung,
        hoTen: u.hoTen,
        email: u.email,
        soDienThoai: u.soDienThoai,
        vaiTro: u.vaiTro,
        trangThai: u.trangThai,
        ngayTao: u.ngayTao,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ===== Rest of the service methods remain unchanged =====
  // (approveDriver, getPendingDrivers, updateUser, toggleUserStatus, etc.)
}
```

---

## Key Implementation Details

### 1. Whitelist Definition
```typescript
private readonly ALLOWED_SEARCH_FIELDS: Set<string> = new Set([
  'hoTen',
  'email',
  'soDienThoai',
]);
```
- Only these fields can be searched
- Easy to add/remove fields
- Prevents security vulnerabilities

### 2. Parse Search Parameter
```typescript
parseSearchParameter(search?: string): Record<string, string> | null
```
- Accepts JSON string: `{"hoTen":"John","email":"john"}`
- Accepts plain string: `john@example.com`
- Returns null if no search provided

### 3. Validate Fields
```typescript
validateAndFilterSearchFields(searchObject: Record<string, string>)
```
- Checks each field against whitelist
- Throws BadRequestException if invalid
- Preserves special `_global` field

### 4. Dynamic QueryBuilder
```typescript
if (searchObject._global) {
  // Search all fields with OR condition
  const searchValue = `%${searchObject._global}%`;
  const conditions = Array.from(this.ALLOWED_SEARCH_FIELDS).map(
    (field) => `user.${field} ILIKE :searchValue`,
  );
  queryBuilder.andWhere(`(${conditions.join(' OR ')})`, { searchValue });
} else {
  // Search specific fields with AND condition
  for (const [field, value] of Object.entries(searchObject)) {
    const paramName = `search_${field}`;
    queryBuilder.andWhere(`user.${field} ILIKE :${paramName}`, {
      [paramName]: `%${value}%`,
    });
  }
}
```

### 5. Case-Insensitive Search
```sql
user.hoTen ILIKE '%john%'  -- Matches: john, JOHN, John, johney, etc.
```

### 6. Parameterized Queries
```typescript
queryBuilder.andWhere(`user.${field} ILIKE :${paramName}`, {
  [paramName]: `%${value}%`,
});
```
- Parameters passed separately
- Prevents SQL injection

---

## API Usage Examples

### Plain String Search
```bash
GET /admin/users?search=john&page=1&limit=20
```

### JSON Search - Single Field
```bash
GET /admin/users?search={"email":"example.com"}&page=1
```

### JSON Search - Multiple Fields (AND Logic)
```bash
GET /admin/users?search={"hoTen":"John","email":"gmail"}&vaiTro=DRIVER
```

### Search + Filters
```bash
GET /admin/users?search={"soDienThoai":"0987"}&vaiTro=CUSTOMER&trangThai=ACTIVE
```

---

## Error Handling

### Invalid Field Error
```json
{
  "statusCode": 400,
  "message": "Trường tìm kiếm \"password\" không được phép. Các trường được phép: hoTen, email, soDienThoai",
  "error": "Bad Request"
}
```

### All Errors Validated
✅ Compilation: No TypeScript errors
✅ Security: Whitelist prevents injection
✅ Queries: Parameterized to prevent SQL injection
✅ Backward Compatibility: Plain strings still work

---

## Quick Copy-Paste

### To Add New Searchable Field

**Step 1:** Update whitelist
```typescript
private readonly ALLOWED_SEARCH_FIELDS: Set<string> = new Set([
  'hoTen',
  'email',
  'soDienThoai',
  'ma',  // ← Add new field
]);
```

**Step 2:** Update DTO documentation
```typescript
@ApiProperty({
  example: '{"hoTen":"John","email":"john","ma":"ND001"}',
  description:
    'Các trường được phép: hoTen, email, soDienThoai, ma',
  required: false,
})
```

Done! No other code changes needed.

---

## Testing Commands

```bash
# Plain string search
curl -X GET "http://localhost:3000/admin/users?search=john" \
  -H "Authorization: Bearer $TOKEN"

# JSON search
curl -X GET 'http://localhost:3000/admin/users?search={"hoTen":"John"}' \
  -H "Authorization: Bearer $TOKEN"

# Invalid field (security test)
curl -X GET 'http://localhost:3000/admin/users?search={"password":"admin"}' \
  -H "Authorization: Bearer $TOKEN"
```

---

## Status: ✅ Production Ready

- [x] Zero TypeScript errors
- [x] Security whitelist implemented
- [x] Parameterized queries (no SQL injection)
- [x] Backward compatible
- [x] Error handling complete
- [x] Documentation provided
- [x] Test cases ready

