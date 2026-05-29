import {
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Type,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ObjectLiteral } from 'typeorm';
import { BaseService } from './base.service';

/**
 * **BaseControllerFactory** - "Super Weapon" for Auto-Generated Controllers
 *
 * This factory creates a dynamic controller class with all CRUD endpoints,
 * Swagger documentation, and validation pipes.
 *
 * @param Entity - The entity class (used for naming and Swagger docs)
 * @param CreateDto - DTO for creation
 * @param UpdateDto - DTO for updates
 * @returns A fully-functional controller class
 *
 * Usage:
 * ```typescript
 * // Option 1: Direct Export (Preferred)
 * @Controller('users')
 * export class UserController extends BaseControllerFactory(User, CreateUserDto, UpdateUserDto) {
 *   constructor(@InjectRepository(User) repo: Repository<User>) {
 *     super(new UserService(repo));
 *   }
 * }
 *
 * // Option 2: Via Module (Advanced)
 * const UserController = BaseControllerFactory(User, CreateUserDto, UpdateUserDto);
 * ```
 */
export function BaseControllerFactory<
  T extends ObjectLiteral,
  CreateDto,
  UpdateDto,
>(
  Entity: Type<T>,
  CreateDto: Type<CreateDto>,
  UpdateDto: Type<UpdateDto>,
): Type<any> {
  const entityName = Entity.name;
  const entityNameLower =
    entityName.charAt(0).toLowerCase() + entityName.slice(1);

  /**
   * Dynamic controller class with all CRUD endpoints and Swagger integration
   */
  class BaseControllerHost<T extends ObjectLiteral, CreateDto, UpdateDto> {
    /**
     * Service injection - must be set by the extending class
     */
    protected service: BaseService<T>;

    constructor(service: BaseService<T>) {
      this.service = service;
    }

    /**
     * @POST / - Create new record
     * Requires: JWT authentication
     * Validates: Input DTO with whitelist & transform
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
      summary: `Create a new ${entityName}`,
      description: `Creates a new ${entityName} record in the database.`,
    })
    @ApiBody({
      type: CreateDto,
      description: `${entityName} creation data`,
    })
    @ApiResponse({
      status: 201,
      description: `${entityName} created successfully`,
      type: Entity,
    })
    @ApiResponse({
      status: 400,
      description: 'Invalid input data',
    })
    @ApiResponse({
      status: 401,
      description: 'Unauthorized - JWT token required',
    })
    @ApiBearerAuth('JWT')
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    async create(@Body() dto: CreateDto): Promise<T> {
      return this.service.create(dto as any);
    }

    /**
     * @GET /page - Get paginated records
     * Query params: page (default 1), limit (default 10)
     * Returns: { data: T[], meta: { total, page, limit, totalPages } }
     */
    @Get('page')
    @ApiOperation({
      summary: `Get ${entityNameLower} with pagination`,
      description: `Fetches a paginated list of ${entityNameLower} records.`,
    })
    @ApiQuery({
      name: 'page',
      type: 'number',
      required: false,
      example: 1,
      description: 'Page number (starts from 1)',
    })
    @ApiQuery({
      name: 'limit',
      type: 'number',
      required: false,
      example: 10,
      description: 'Records per page',
    })
    @ApiResponse({
      status: 200,
      description: `${entityName} pagination result`,
      schema: {
        example: {
          data: [],
          meta: {
            total: 100,
            page: 1,
            limit: 10,
            totalPages: 10,
          },
        },
      },
    })
    async getPage(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
    ): Promise<{
      data: T[];
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }> {
      return this.service.getPage(page, limit);
    }

    /**
     * @GET /all - Get all records (without pagination)
     * Use with caution for large datasets!
     */
    @Get('all')
    @ApiOperation({
      summary: `Get all ${entityNameLower}`,
      description: `Fetches all ${entityNameLower} records without pagination. ⚠️ Use with caution for large datasets.`,
    })
    @ApiResponse({
      status: 200,
      description: `Array of ${entityName}`,
      type: [Entity],
    })
    async findAll(): Promise<T[]> {
      return this.service.findAll();
    }

    /**
     * @GET /:id - Get single record by ID
     */
    @Get(':id')
    @ApiOperation({
      summary: `Get ${entityName} by ID`,
      description: `Fetches a single ${entityName} record by its unique identifier.`,
    })
    @ApiParam({
      name: 'id',
      type: 'string',
      description: `${entityName} ID (UUID)`,
      example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiResponse({
      status: 200,
      description: `${entityName} found`,
      type: Entity,
    })
    @ApiResponse({
      status: 404,
      description: `${entityName} not found`,
    })
    async findOne(@Param('id') id: string): Promise<T> {
      return this.service.findOne(id);
    }

    /**
     * @PUT /:id - Update record
     * Requires: JWT authentication
     * Only updates provided fields (partial update)
     */
    @Put(':id')
    @ApiOperation({
      summary: `Update ${entityName}`,
      description: `Updates a ${entityName} record with partial data.`,
    })
    @ApiParam({
      name: 'id',
      type: 'string',
      description: `${entityName} ID`,
    })
    @ApiBody({
      type: UpdateDto,
      description: `${entityName} update data (partial)`,
    })
    @ApiResponse({
      status: 200,
      description: `${entityName} updated successfully`,
      type: Entity,
    })
    @ApiResponse({
      status: 400,
      description: 'Invalid input data',
    })
    @ApiResponse({
      status: 404,
      description: `${entityName} not found`,
    })
    @ApiResponse({
      status: 401,
      description: 'Unauthorized',
    })
    @ApiBearerAuth('JWT')
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    async update(@Param('id') id: string, @Body() dto: UpdateDto): Promise<T> {
      return this.service.update(id, dto as any);
    }

    /**
     * @DELETE /:id - Soft delete record
     * Requires: JWT authentication
     * Sets deletedAt timestamp (not permanent deletion)
     */
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
      summary: `Soft delete ${entityName}`,
      description: `Soft deletes a ${entityName} (marks as deleted, does not remove from DB).`,
    })
    @ApiParam({
      name: 'id',
      type: 'string',
      description: `${entityName} ID`,
    })
    @ApiResponse({
      status: 200,
      description: `${entityName} soft deleted`,
      type: Entity,
    })
    @ApiResponse({
      status: 404,
      description: `${entityName} not found`,
    })
    @ApiResponse({
      status: 401,
      description: 'Unauthorized',
    })
    @ApiBearerAuth('JWT')
    @UseGuards(AuthGuard('jwt'))
    async softDelete(@Param('id') id: string): Promise<T> {
      return this.service.softDelete(id);
    }
  }

  return BaseControllerHost as any;
}
