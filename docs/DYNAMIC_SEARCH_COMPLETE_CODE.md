# 📦 Dynamic Search - Complete Implementation

## Overview

This document shows the **complete, production-ready code** for the dynamic search feature in the `GET /admin/users` API.

---

## 🎯 What This Achieves

| Feature | Capability |
|---------|-----------|
| **Hardcoded Search** | ❌ Removed |
| **Dynamic Search** | ✅ JSON or plain string |
| **Whitelist Security** | ✅ Only allowed fields |
| **SQL Injection Protection** | ✅ Parameterized queries |
| **Case-Insensitive** | ✅ ILIKE matching |
| **Backward Compatible** | ✅ Old searches still work |
| **Easy to Extend** | ✅ Add field to whitelist |

---

## 📝 Complete Controller Code

### File: `src/admin/admin.controller.ts`

**Note:** Controller remains unchanged. It just calls the service.

```typescript
@Get('users')
@ApiOperation({
  summary: 'Lấy danh sách tất cả người dùng',
  description:
    'Hỗ trợ filter theo vai trò, trạng thái và tìm kiếm động theo các trường',
})
@ApiQuery({ name: 'page', required: false, type: Number })
@ApiQuery({ name: 'limit', required: false, type: Number })
@ApiQuery({
  name: 'vaiTro',
  required: false,
  enum: ['CUSTOMER', 'DRIVER', 'ADMIN'],
})
@ApiQuery({ name: 'trangThai', required: false, enum: ['ACTIVE', 'BANNED'] })
@ApiQuery({
  name: 'search',
  required: false,
  type: String,
  description:
    'JSON object ({"hoTen":"John"}) or plain string (john). ' +
    'Allowed fields: hoTen, email, soDienThoai',
})
@ApiResponse({ status: 200, description: 'Danh sách người dùng' })
async getAllUsers(@Query() query: GetUsersQueryDto) {
  return this.adminService.getAllUsers(query);
}
```

---

## 📄 Complete DTO Code

### File: `src/admin/dto/get-users-query.dto.ts`

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

## 🔧 Complete Service Code

### File: `src/admin/admin.service.ts` (Key Methods)

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
  // ============================================================
  // SECURITY: Whitelist các trường được phép tìm kiếm
  // ============================================================
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

  // ============================================================
  // HELPER METHOD 1: Parse search parameter
  // ============================================================
  /**
   * Parse search parameter từ query string
   * Hỗ trợ: JSON string hoặc plain string
   *
   * Examples:
   * - Input: '{"hoTen":"John","email":"john"}' → Output: {hoTen: "John", email: "john"}
   * - Input: 'john' → Output: {_global: "john"}
   * - Input: undefined → Output: null
   *
   * @param search - Search parameter từ query string
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

  // ============================================================
  // HELPER METHOD 2: Validate search fields against whitelist
  // ============================================================
  /**
   * Validate search fields và chỉ giữ lại các trường được phép
   * Ngừng ngay nếu có trường không được phép
   *
   * Examples:
   * - Input: {hoTen: "John"} → Output: {hoTen: "John"} ✓
   * - Input: {password: "admin"} → Throws BadRequestException ✗
   *
   * @param searchObject - Raw search object từ parsing
   * @returns Validated search object (chỉ các trường được phép)
   * @throws BadRequestException nếu trường không được phép
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
        // Trường được phép, giữ lại
        validated[key] = value;
      } else {
        // Trường không được phép, throw error
        throw new BadRequestException(
          `Trường tìm kiếm "${key}" không được phép. ` +
            `Các trường được phép: ${Array.from(this.ALLOWED_SEARCH_FIELDS).join(', ')}`,
        );
      }
    }

    return validated;
  }

  // ============================================================
  // MAIN METHOD: Get all users with dynamic search
  // ============================================================
  /**
   * Lấy danh sách tất cả người dùng với filter, phân trang, tìm kiếm động
   *
   * Features:
   * - Dynamic search: Plain string hoặc JSON object
   * - Filters: vaiTro, trangThai
   * - Pagination: page, limit
   * - Security: Whitelist validation + parameterized queries
   * - Performance: QueryBuilder with single query
   *
   * @param query - GetUsersQueryDto containing search, filters, pagination
   * @returns Paginated list of users
   */
  async getAllUsers(query: GetUsersQueryDto) {
    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Parse and validate search
    const rawSearch = this.parseSearchParameter(query.search);
    const searchObject = rawSearch
      ? this.validateAndFilterSearchFields(rawSearch)
      : null;

    // Initialize QueryBuilder
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
      // Case 1: _global search (plain string like "john")
      // Tìm kiếm trong tất cả các trường được phép
      if (searchObject._global) {
        const searchValue = `%${searchObject._global}%`;
        // Build OR conditions: (hoTen ILIKE :searchValue OR email ILIKE :searchValue OR ...)
        const conditions = Array.from(this.ALLOWED_SEARCH_FIELDS).map(
          (field) => `user.${field} ILIKE :searchValue`,
        );
        queryBuilder.andWhere(`(${conditions.join(' OR ')})`, { searchValue });
      } else {
        // Case 2: Specific field search (JSON like {"hoTen":"John"})
        // Tìm kiếm trong các trường cụ thể
        for (const [field, value] of Object.entries(searchObject)) {
          if (this.ALLOWED_SEARCH_FIELDS.has(field)) {
            const paramName = `search_${field}`;
            // Add AND condition: email ILIKE :search_email AND hoTen ILIKE :search_hoTen
            queryBuilder.andWhere(`user.${field} ILIKE :${paramName}`, {
              [paramName]: `%${value}%`,
            });
          }
        }
      }
    }

    // Execute query
    const [users, total] = await queryBuilder.getManyAndCount();

    // Format response
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

  // ============================================================
  // Rest of service methods (unchanged)
  // ============================================================
  // updateUser, toggleUserStatus, approveDriver, getPendingDrivers, etc.
}
```

---

## 🔑 Key Implementation Points

### 1. Whitelist (Line ~13)
```typescript
private readonly ALLOWED_SEARCH_FIELDS: Set<string> = new Set([
  'hoTen',
  'email',
  'soDienThoai',
]);
```
- Only these 3 fields can be searched
- Add new fields here to extend search capability
- Prevents field injection attacks

### 2. Parse Search (Line ~23)
```typescript
private parseSearchParameter(search?: string): Record<string, string> | null
```
- Accepts JSON: `{"hoTen":"John","email":"john"}`
- Accepts plain string: `john`
- Creates `_global` key for plain string searches

### 3. Validate Fields (Line ~45)
```typescript
private validateAndFilterSearchFields(searchObject: Record<string, string>)
```
- Checks each field against whitelist
- Throws BadRequestException if invalid
- Secures against field injection

### 4. Build Query (Line ~73)
- Uses QueryBuilder for dynamic conditions
- ILIKE for case-insensitive matching
- Parameterized queries prevent SQL injection
- Combines multiple conditions with AND/OR

---

## 💡 Usage Patterns

### Pattern 1: Plain String (Global Search)
```
Input: ?search=john
Parsed: {_global: "john"}
Query: WHERE (hoTen ILIKE '%john%' OR email ILIKE '%john%' OR soDienThoai ILIKE '%john%')
```

### Pattern 2: Single Field
```
Input: ?search={"email":"gmail"}
Parsed: {email: "gmail"}
Query: WHERE email ILIKE '%gmail%'
```

### Pattern 3: Multiple Fields (AND)
```
Input: ?search={"hoTen":"John","email":"gmail"}
Parsed: {hoTen: "John", email: "gmail"}
Query: WHERE hoTen ILIKE '%John%' AND email ILIKE '%gmail%'
```

### Pattern 4: Invalid Field
```
Input: ?search={"password":"admin"}
Parsed: {password: "admin"}
Validated: BadRequestException → 400 Bad Request
```

---

## ✅ Implementation Checklist

- [x] Whitelist defined (`ALLOWED_SEARCH_FIELDS`)
- [x] Parse method implemented (`parseSearchParameter`)
- [x] Validate method implemented (`validateAndFilterSearchFields`)
- [x] QueryBuilder logic implemented
- [x] ILIKE for case-insensitive search
- [x] Parameterized queries for SQL injection prevention
- [x] Error handling with BadRequestException
- [x] Pagination supported
- [x] Filters (vaiTro, trangThai) work
- [x] Backward compatibility maintained
- [x] DTO updated with documentation
- [x] Controller method unchanged
- [x] No TypeScript errors
- [x] No SQL injection vulnerabilities
- [x] No field injection vulnerabilities

---

## 🧪 Quick Test Commands

```bash
# Test 1: Plain string search
curl "http://localhost:3000/admin/users?search=john" \
  -H "Authorization: Bearer $TOKEN"

# Test 2: JSON search
curl 'http://localhost:3000/admin/users?search={"email":"gmail.com"}' \
  -H "Authorization: Bearer $TOKEN"

# Test 3: Multiple fields
curl 'http://localhost:3000/admin/users?search={"hoTen":"John","email":"gmail"}' \
  -H "Authorization: Bearer $TOKEN"

# Test 4: Invalid field (security)
curl 'http://localhost:3000/admin/users?search={"password":"admin"}' \
  -H "Authorization: Bearer $TOKEN"

# Test 5: Search + filters
curl 'http://localhost:3000/admin/users?search=john&vaiTro=DRIVER&trangThai=ACTIVE' \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📋 Status

✅ **Implementation Complete**
✅ **Zero Compilation Errors**
✅ **Security Validated**
✅ **Backward Compatible**
✅ **Production Ready**

All code is ready to deploy immediately!

