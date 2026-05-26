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
 * Admin Reviews Controller - Full CRUD for Reviews (DanhGia)
 *
 * This controller provides complete administrative access to all review/rating records.
 * Uses BaseControllerFactory to auto-generate CRUD endpoints.
 *
 * All endpoints:
 * - Require JWT authentication
 * - Require ADMIN role
 * - Support soft delete & restore
 *
 * Admin can:
 * - Create or edit review records
 * - View all reviews with pagination
 * - Update review content and ratings
 * - Soft delete or restore reviews
 * - Monitor user feedback and ratings
 * - Remove inappropriate reviews
 *
 * Endpoints:
 * - POST /admin/reviews - Create new review
 * - GET /admin/reviews/page - Paginated list
 * - GET /admin/reviews/all - All records
 * - GET /admin/reviews/:id - Get review by ID
 * - PUT /admin/reviews/:id - Update review
 * - DELETE /admin/reviews/:id - Soft delete review
 * - POST /admin/reviews/:id/restore - Restore deleted review
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
  /**
   * Constructor automatically sets up all CRUD endpoints via BaseControllerFactory.
   * @param service The ReviewsService (extends BaseService<DanhGia>)
   */
  constructor(private readonly service: ReviewsService) {
    super(service);
  }
}
