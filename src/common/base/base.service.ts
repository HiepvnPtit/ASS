import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Repository,
  FindOptionsWhere,
  DeepPartial,
  FindOptionsOrder,
  ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm';

/**
 * Base Service Class - Provides standard CRUD operations
 *
 * Generic type T represents the Entity class
 *
 * Implements:
 * - create(dto): Create a new record
 * - findAll(options): Retrieve all records with optional filters
 * - findOne(id): Get single record by primary key
 * - update(id, dto): Update a record
 * - remove(id): Soft delete a record
 * - hardRemove(id): Permanently delete a record
 *
 * Usage:
 * export class MyService extends BaseService<MyEntity> {
 *   constructor(@InjectRepository(MyEntity) repo: Repository<MyEntity>) {
 *     super(repo);
 *   }
 * }
 */
@Injectable()
export abstract class BaseService<T extends ObjectLiteral> {
  protected entityName: string;

  constructor(protected readonly repository: Repository<T>) {
    this.entityName = repository.metadata.tableName || 'Entity';
  }

  /**
   * Create a new record
   * @param dto Data Transfer Object with entity data
   * @returns Created entity
   */
  async create(dto: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  /**
   * Retrieve all records
   * @param relations Optional: Relations to load (e.g., ['user', 'profile'])
   * @param skip Optional: Number of records to skip (pagination)
   * @param take Optional: Number of records to take (pagination)
   * @param order Optional: Order by clause
   * @returns Array of entities
   */
  async findAll(options?: {
    relations?: string[];
    skip?: number;
    take?: number;
    order?: FindOptionsOrder<T>;
    where?: FindOptionsWhere<T>;
  }): Promise<T[]> {
    return this.repository.find({
      relations: options?.relations,
      skip: options?.skip,
      take: options?.take,
      order: options?.order,
      where: options?.where,
      withDeleted: false, // Exclude soft-deleted records by default
    });
  }

  /**
   * Find with pagination (returns data and total count)
   * @param options Query options
   * @returns [entities, total]
   */
  async findAllPaginated(options?: {
    relations?: string[];
    skip?: number;
    take?: number;
    order?: FindOptionsOrder<T>;
    where?: FindOptionsWhere<T>;
  }): Promise<[T[], number]> {
    return this.repository.findAndCount({
      relations: options?.relations,
      skip: options?.skip,
      take: options?.take,
      order: options?.order,
      where: options?.where,
      withDeleted: false,
    });
  }

  /**
   * Find a single record by ID
   * @param id Primary key value
   * @param relations Optional: Relations to load
   * @returns Entity or throws NotFoundException
   */
  async findOne(id: string | number, relations?: string[]): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      relations,
      withDeleted: false,
    });

    if (!entity) {
      throw new NotFoundException(
        `${this.entityName} with id "${id}" not found`,
      );
    }

    return entity;
  }

  /**
   * Find by custom where clause
   * @param where Custom where conditions
   * @param relations Optional: Relations to load
   * @returns Entity or throws NotFoundException
   */
  async findOneBy(
    where: FindOptionsWhere<T>,
    relations?: string[],
  ): Promise<T> {
    const entity = await this.repository.findOne({
      where,
      relations,
      withDeleted: false,
    });

    if (!entity) {
      throw new NotFoundException(`${this.entityName} not found`);
    }

    return entity;
  }

  /**
   * Update a record
   * @param id Primary key value
   * @param dto Partial data to update
   * @returns Updated entity
   */
  async update(id: string | number, dto: DeepPartial<T>): Promise<T> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto as any);
    return this.repository.save(entity);
  }

  /**
   * Soft delete (set deletedAt timestamp)
   * @param id Primary key value
   * @returns Deleted entity
   */
  async remove(id: string | number): Promise<T> {
    const entity = await this.findOne(id);
    return this.repository.softRemove(entity);
  }

  /**
   * Hard delete (permanent removal)
   * @param id Primary key value
   * @returns Result of deletion
   */
  async hardRemove(id: string | number): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.remove(entity);
  }

  /**
   * Check if record exists by ID
   * @param id Primary key value
   * @returns boolean
   */
  async exists(id: string | number): Promise<boolean> {
    const count = await this.repository.count({
      where: { id } as unknown as FindOptionsWhere<T>,
      withDeleted: false,
    });
    return count > 0;
  }

  /**
   * Get total count of records
   * @returns Total count
   */
  async count(): Promise<number> {
    return this.repository.count({ withDeleted: false });
  }

  /**
   * Soft delete a record by ID
   * @param id Primary key value
   * @returns Deleted entity
   */
  async softDelete(id: string | number): Promise<T> {
    const entity = await this.findOne(id);
    return this.repository.softRemove(entity);
  }

  /**
   * Get paginated records with metadata
   * @param page Page number (starting from 1)
   * @param limit Records per page
   * @param options Optional: where, relations, order
   * @returns Object with data array and meta (total, page, limit, totalPages)
   */
  async getPage(
    page: number = 1,
    limit: number = 10,
    options?: {
      where?: FindOptionsWhere<T>;
      relations?: string[];
      order?: FindOptionsOrder<T>;
    },
  ): Promise<{
    data: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      where: options?.where,
      relations: options?.relations,
      order: options?.order,
      skip,
      take: limit,
      withDeleted: false,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Get statistics for enum field
   * Counts records grouped by enum field values
   * @param field The enum column name
   * @param enumValues Array of possible enum values
   * @param whereCondition Optional: additional WHERE conditions
   * @returns Object mapping each enum value to its count
   *
   * Example:
   * const stats = await userService.getEnumStats('status', ['ACTIVE', 'INACTIVE', 'PENDING']);
   * // Returns: { ACTIVE: 45, INACTIVE: 12, PENDING: 3 }
   */
  async getEnumStats(
    field: string,
    enumValues: string[],
    whereCondition?: FindOptionsWhere<T>,
  ): Promise<Record<string, number>> {
    const result: Record<string, number> = {};

    // Initialize all enum values with 0
    enumValues.forEach((value) => {
      result[value] = 0;
    });

    // Use QueryBuilder to count records for each enum value
    let queryBuilder: SelectQueryBuilder<T> =
      this.repository.createQueryBuilder('entity');

    // Add where condition if provided
    if (whereCondition) {
      const keys = Object.keys(whereCondition);
      keys.forEach((key, index) => {
        const condition = (whereCondition as any)[key];
        if (index === 0) {
          queryBuilder = queryBuilder.where(`entity.${key} = :${key}`, {
            [key]: condition,
          });
        } else {
          queryBuilder = queryBuilder.andWhere(`entity.${key} = :${key}`, {
            [key]: condition,
          });
        }
      });
    }

    // Count for each enum value
    const counts = await Promise.all(
      enumValues.map(async (value) => {
        let countQuery = this.repository
          .createQueryBuilder('entity')
          .where(`entity.${field} = :value`, { value })
          .andWhere('entity.deletedAt IS NULL');

        // Apply additional conditions if provided
        if (whereCondition) {
          const keys = Object.keys(whereCondition);
          keys.forEach((key) => {
            countQuery = countQuery.andWhere(`entity.${key} = :${key}`, {
              [key]: (whereCondition as any)[key],
            });
          });
        }

        const count = await countQuery.getCount();
        return { value, count };
      }),
    );

    // Map counts to result
    counts.forEach(({ value, count }) => {
      result[value] = count;
    });

    return result;
  }
}
