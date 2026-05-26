import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigsService {
  /**
   * Get application version for mobile platforms
   */
  getAppVersion() {
    return {
      android: '1.0.0',
      ios: '1.0.0',
      forceUpdate: false,
    };
  }

  /**
   * Get system configuration settings
   */
  getSettings() {
    return {
      hotline: '+84-1900-1234-567',
      zalo: 'https://zalo.me/123456789',
      privacyPolicyUrl: 'https://example.com/privacy',
      termsOfServiceUrl: 'https://example.com/terms',
      supportEmail: 'support@example.com',
      appName: 'Tài Xế Hộ',
      timezone: 'Asia/Ho_Chi_Minh',
    };
  }
}
