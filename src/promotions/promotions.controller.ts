import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';

@ApiTags('Promotions - Public')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  /**
   * GET /promotions/active
   * Get all active voucher promotions
   */
  @Get('active')
  @ApiOperation({
    summary: 'Get active promotions',
    description:
      'Returns list of all active voucher codes available for customers',
  })
  @ApiResponse({
    status: 200,
    description: 'Active promotions retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          maCode: { type: 'string', example: 'SUMMER2026' },
          phanTramGiam: { type: 'string', example: '10' },
          giamToiDa: { type: 'string', example: '50000' },
          trangThai: { type: 'string', example: 'ACTIVE' },
          moTa: {
            type: 'string',
            example: 'Summer discount for new users',
          },
          giaToiThieu: { type: 'string', example: '100000' },
        },
      },
    },
  })
  async getActive() {
    return this.promotionsService.getActivePromotions();
  }

  /**
   * GET /promotions/validate
   * Validate a voucher code and check if it can be applied
   */
  @Get('validate')
  @ApiOperation({
    summary: 'Validate voucher code',
    description:
      'Check if a voucher code is valid and can be applied to a trip estimate',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'Voucher code to validate',
    example: 'SUMMER2026',
  })
  @ApiQuery({
    name: 'price',
    required: true,
    description: 'Estimated trip price to check against',
    example: '150000',
  })
  @ApiResponse({
    status: 200,
    description: 'Voucher validation result',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean', example: true },
        discountAmount: { type: 'number', example: 15000 },
        finalPrice: { type: 'number', example: 135000 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Voucher code not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Voucher is invalid or expired',
  })
  async validate(
    @Query('code') voucherCode: string,
    @Query('price') price: string,
  ) {
    const estimatedPrice = parseFloat(price);
    return this.promotionsService.validateAndApplyVoucher(
      voucherCode,
      estimatedPrice,
    );
  }
}
