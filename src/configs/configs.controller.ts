import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigsService } from './configs.service';

@ApiTags('Configs - Public')
@Controller('configs')
export class ConfigsController {
  constructor(private readonly configsService: ConfigsService) {}

  /**
   * GET /configs/app-version
   * Get application version information
   */
  @Get('app-version')
  @ApiOperation({
    summary: 'Get app version for mobile platforms',
    description:
      'Returns application version for Android and iOS, including force update flag',
  })
  @ApiResponse({
    status: 200,
    description: 'App version retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        android: { type: 'string', example: '1.0.0' },
        ios: { type: 'string', example: '1.0.0' },
        forceUpdate: { type: 'boolean', example: false },
      },
    },
  })
  getAppVersion() {
    return this.configsService.getAppVersion();
  }

  /**
   * GET /configs/settings
   * Get system configuration settings
   */
  @Get('settings')
  @ApiOperation({
    summary: 'Get system configuration settings',
    description:
      'Returns system settings including contact information, URLs, and app metadata',
  })
  @ApiResponse({
    status: 200,
    description: 'Settings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        hotline: { type: 'string', example: '+84-1900-1234-567' },
        zalo: { type: 'string', example: 'https://zalo.me/123456789' },
        privacyPolicyUrl: {
          type: 'string',
          example: 'https://example.com/privacy',
        },
        termsOfServiceUrl: {
          type: 'string',
          example: 'https://example.com/terms',
        },
        supportEmail: { type: 'string', example: 'support@example.com' },
        appName: { type: 'string', example: 'Tài Xế Hộ' },
        timezone: { type: 'string', example: 'Asia/Ho_Chi_Minh' },
      },
    },
  })
  getSettings() {
    return this.configsService.getSettings();
  }
}
