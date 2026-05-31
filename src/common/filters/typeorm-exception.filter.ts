import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError, EntityPropertyNotFoundError } from 'typeorm';

/**
 * Global filter for catching TypeORM errors:
 * - QueryFailedError: Postgres error codes (23505, 23503, 23502, 22P02, ...)
 * - EntityPropertyNotFoundError: DTO has fields that don't exist on the Entity
 */
@Catch(QueryFailedError, EntityPropertyNotFoundError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | (QueryFailedError & { code?: string; detail?: string })
      | EntityPropertyNotFoundError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // ===== EntityPropertyNotFoundError ===== (DTO field not found on Entity)
    if (exception instanceof EntityPropertyNotFoundError) {
      // Extract property name from message: 'Property "maLoaiXe" was not found...'
      const match = exception.message.match(/Property\s+"([^"]+)"/);
      const propertyName = match ? match[1] : 'không xác định';
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Trường dữ liệu '${propertyName}' không tồn tại hoặc không được phép cập nhật.`,
        error: 'Bad Request',
      });
    }

    // ===== QueryFailedError (Postgres error codes) =====
    const pgException = exception as QueryFailedError & {
      code?: string;
      detail?: string;
    };

    // Helper: extract column name from detail string
    const getColumnName = (): string | null => {
      if (!pgException.detail) return null;
      const keyMatch = pgException.detail.match(/Key\s+\(([^)]+)\)/);
      if (keyMatch) return keyMatch[1];
      const colMatch = pgException.detail.match(/column\s+"([^"]+)"/);
      if (colMatch) return colMatch[1];
      return null;
    };

    const columnName = getColumnName();
    const fieldStr = columnName ? `'${columnName}' ` : '';

    // 23505 - Unique violation (trùng lặp dữ liệu)
    if (pgException.code === '23505') {
      const message = `Dữ liệu '${columnName ?? 'dữ liệu'}' đã tồn tại trong hệ thống.`;
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message,
        error: 'Conflict',
      });
    }

    // 23503 - Foreign key violation (sai ID liên kết)
    if (pgException.code === '23503') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Dữ liệu ${fieldStr}liên kết không tồn tại. Vui lòng kiểm tra lại!`,
        error: 'Bad Request',
      });
    }

    // 23502 - Not null violation (bỏ trống trường bắt buộc)
    if (pgException.code === '23502') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Trường dữ liệu ${fieldStr}không được để trống.`,
        error: 'Bad Request',
      });
    }

    // 22P02 - Invalid text representation (sai định dạng UUID / dữ liệu)
    if (pgException.code === '22P02') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Dữ liệu ${fieldStr}không đúng định dạng. Vui lòng kiểm tra lại.`,
        error: 'Bad Request',
      });
    }

    // Fallback: unknown DB error → log for debugging, return 500
    console.error(
      '[TypeOrmExceptionFilter] Unhandled database error:',
      pgException,
    );
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Lỗi cơ sở dữ liệu. Vui lòng thử lại sau.',
      error: 'Internal Server Error',
    });
  }
}
