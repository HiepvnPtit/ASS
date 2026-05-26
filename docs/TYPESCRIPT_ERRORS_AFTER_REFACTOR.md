# TypeScript Errors After Refactoring

Danh sách các lỗi TypeScript mà bạn sẽ gặp sau khi xóa boilerplate entities, cùng với cách fix.

---

## Lỗi 1: Cannot find module 'src/users'

**Error Message:**
```
TS2307: Cannot find module 'src/users' or its corresponding type declarations.
```

**Locations where this occurs:**
- `src/app.module.ts` - UsersModule import
- `src/auth/auth.module.ts` - UsersModule import
- Any file importing UsersService

**Fix:**
```typescript
// DELETE:
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';

// From imports array, remove:
// UsersModule,
```

---

## Lỗi 2: Cannot find module 'src/session'

**Error Message:**
```
TS2307: Cannot find module 'src/session' or its corresponding type declarations.
```

**Locations where this occurs:**
- `src/app.module.ts` - SessionModule import
- `src/auth/auth.module.ts` - SessionModule import
- `src/auth/auth.service.ts` - SessionService import (if using old version)

**Fix:**
```typescript
// DELETE:
import { SessionModule } from './session/session.module';
import { SessionService } from './session/session.service';
import { Session } from './session/domain/session';

// From imports array, remove:
// SessionModule,
```

---

## Lỗi 3: Cannot find module 'src/roles'

**Error Message:**
```
TS2307: Cannot find module 'src/roles' or its corresponding type declarations.
```

**Locations where this occurs:**
- `src/auth/auth.service.ts` - RoleEnum import
- `src/auth/auth.module.ts` - Indirectly via auth.service

**Fix:**
```typescript
// DELETE:
import { RoleEnum } from './roles/roles.enum';

// REPLACE with string literals:
const vaiTro = 'CUSTOMER'; // instead of RoleEnum.user
```

---

## Lỗi 4: Cannot find module 'src/statuses'

**Error Message:**
```
TS2307: Cannot find module 'src/statuses' or its corresponding type declarations.
```

**Locations where this occurs:**
- `src/auth/auth.service.ts` - StatusEnum import

**Fix:**
```typescript
// DELETE:
import { StatusEnum } from './statuses/statuses.enum';

// REPLACE with string literals:
const trangThai = 'ACTIVE'; // instead of StatusEnum.active
```

---

## Lỗi 5: Type 'User' is not assigned to type 'never'

**Error Message:**
```
TS2322: Type 'NguoiDung' is not assignable to type 'User'.
```

**Locations where this occurs:**
- `src/auth/auth.controller.ts` - Controller methods return type
- `src/auth/strategies/jwt.strategy.ts` - validate() return type
- Any file using User type

**Fix:**
```typescript
// DELETE:
import { User } from '../users/domain/user';

// REPLACE with:
import { NguoiDung } from '../entities/nguoi-dung.entity';

// Update return types:
// OLD:
async register(dto: AuthRegisterLoginDto): Promise<User>

// NEW:
async register(dto: AuthRegisterLoginDto): Promise<NguoiDung>
```

---

## Lỗi 6: Property 'id' does not exist on NguoiDung

**Error Message:**
```
TS2339: Property 'id' does not exist on type 'NguoiDung'. 
         Did you mean 'maNguoiDung'?
```

**Locations where this occurs:**
- `src/auth/auth.service.ts` - `user.id` references
- `src/auth/auth.controller.ts` - Response objects
- JWT payload construction

**Fix:**
```typescript
// OLD:
const userId = user.id;
const { id, role, sessionId } = jwtPayload;

// NEW:
const userId = user.maNguoiDung;
const { maNguoiDung, vaiTro } = jwtPayload;
```

---

## Lỗi 7: Property 'role' does not exist on NguoiDung

**Error Message:**
```
TS2339: Property 'role' does not exist on type 'NguoiDung'.
```

**Locations where this occurs:**
- JWT payload construction
- User responses

**Fix:**
```typescript
// OLD:
user.role = RoleEnum.user;
const role = user.role?.id;

// NEW:
user.vaiTro = 'USER';
const vaiTro = user.vaiTro;
```

---

## Lỗi 8: Property 'status' does not exist on NguoiDung

**Error Message:**
```
TS2339: Property 'status' does not exist on type 'NguoiDung'.
```

**Locations where this occurs:**
- Email confirmation logic
- User status checks

**Fix:**
```typescript
// OLD:
if (user.status?.id === StatusEnum.inactive) { ... }
user.status = { id: StatusEnum.active };

// NEW:
if (user.trangThai === 'PENDING') { ... }
user.trangThai = 'ACTIVE';
```

---

## Lỗi 9: Property 'password' does not exist on NguoiDung

**Error Message:**
```
TS2339: Property 'password' does not exist on type 'NguoiDung'.
         Did you mean 'matKhau'?
```

**Locations where this occurs:**
- Password validation
- Password hashing

**Fix:**
```typescript
// OLD:
const isValid = await bcrypt.compare(dto.password, user.password);
user.password = hashedPassword;

// NEW:
const isValid = await bcrypt.compare(dto.password, user.matKhau);
user.matKhau = hashedPassword;
```

---

## Lỗi 10: Property 'email' is possibly undefined

**Error Message:**
```
TS2532: Object is possibly 'undefined'. Property 'email' is not assignable to parameter of type 'string'.
```

**Locations where this occurs:**
- JWT payload construction
- Email responses

**Fix:**
```typescript
// ADD null checks:
if (!user.email) {
  throw new UnprocessableEntityException('Email is required');
}

// OR use non-null assertion:
const jwtPayload = {
  maNguoiDung: user.maNguoiDung,
  email: user.email!,  // Use ! if you're sure it exists
  vaiTro: user.vaiTro,
};
```

---

## Lỗi 11: Cannot find name 'Session'

**Error Message:**
```
TS2304: Cannot find name 'Session'.
```

**Locations where this occurs:**
- `src/auth/auth.service.ts` - Session['id'] type references
- JWT refresh token logic

**Fix:**
```typescript
// DELETE Session imports and references
// Instead of:
data: { sessionId: Session['id'], hash: Session['hash'] }

// Just use string:
data: { sessionId?: string, hash?: string }

// Or remove session-related parameters entirely
```

---

## Lỗi 12: Type 'string' is not assignable to type 'Role'

**Error Message:**
```
TS2322: Type 'string' is not assignable to type 'Role'.
```

**Locations where this occurs:**
- Role/vaiTro assignments

**Fix:**
```typescript
// OLD:
const role: Role = { id: RoleEnum.user };

// NEW:
const vaiTro: string = 'USER';
```

---

## Lỗi 13: Type 'object' is not assignable to type 'string'

**Error Message:**
```
TS2322: Type '{ id: string; }' is not assignable to type 'string'.
```

**Locations where this occurs:**
- vaiTro/role assignments

**Fix:**
```typescript
// OLD:
user.role = { id: 'user' };  // Role object

// NEW:
user.vaiTro = 'USER';  // Just string
```

---

## Lỗi 14: UsersService is not exported

**Error Message:**
```
TS2305: Module '"../../users/users.module"' has no exported member 'UsersService'.
```

**Locations where this occurs:**
- Any file trying to import UsersService

**Fix:**
```typescript
// DELETE:
import { UsersService } from './users/users.service';
// And any references to this service

// Use Repository directly instead:
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NguoiDung } from './entities/nguoi-dung.entity';

constructor(
  @InjectRepository(NguoiDung)
  private readonly nguoiDungRepo: Repository<NguoiDung>,
) {}
```

---

## Lỗi 15: SessionService is not exported

**Error Message:**
```
TS2305: Module '"../../session/session.module"' has no exported member 'SessionService'.
```

**Fix:**
```typescript
// DELETE:
import { SessionService } from './session/session.service';
// And all calls to sessionService methods

// JWT is stateless, no session needed
```

---

## Lỗi 16: Cannot find name 'NullableType'

**Error Message:**
```
TS2304: Cannot find name 'NullableType'.
```

**Fix:**
```typescript
// If NullableType is still available:
import { NullableType } from '../utils/types/nullable.type';

// Or create your own:
type NullableType<T> = T | null;
```

---

## Lỗi 17: Property 'firstName' does not exist on NguoiDung

**Error Message:**
```
TS2339: Property 'firstName' does not exist on type 'NguoiDung'.
```

**Locations where this occurs:**
- Login response
- User profile responses

**Fix:**
```typescript
// OLD:
firstName: user.firstName,
lastName: user.lastName,

// NEW:
// NguoiDung uses 'hoTen' (full name), not separate first/last
hoTen: user.hoTen,
// Or split it:
firstName: user.hoTen.split(' ')[0],
lastName: user.hoTen.split(' ').slice(1).join(' '),
```

---

## Lỗi 18: Property 'provider' does not exist on NguoiDung

**Error Message:**
```
TS2339: Property 'provider' does not exist on type 'NguoiDung'.
```

**Locations where this occurs:**
- Social auth validation
- User profile

**Fix:**
```typescript
// DELETE provider checks entirely
// If needed, you can add it to NguoiDung entity:
@Column({ name: 'nha_cung_cap', type: 'varchar', length: 50, default: 'email' })
provider?: string;  // 'email', 'google', 'facebook', etc.
```

---

## Quick Fix Checklist

Run these find/replace operations:

```bash
# In src/auth/ and related files:
- user.id → user.maNguoiDung
- user.role → user.vaiTro
- user.status → user.trangThai
- user.password → user.matKhau
- user.email → user.email (no change needed, but check for null)
- user.firstName → user.hoTen (or split)
- user.lastName → (remove or handle)
- RoleEnum.user → 'USER'
- StatusEnum.active → 'ACTIVE'
- StatusEnum.inactive → 'PENDING'
- user.id → jwtPayload.maNguoiDung
- user.role.id → jwtPayload.vaiTro
```

---

## Compilation Check

After fixing errors, run:

```bash
npm run build
```

If you see errors, go through the list above and apply fixes.

---

**Total Expected Errors:** ~15-20 TypeScript errors
**Estimated Fix Time:** 30-45 minutes
**Difficulty:** Medium (mostly find/replace)

---

Last Updated: May 22, 2024
