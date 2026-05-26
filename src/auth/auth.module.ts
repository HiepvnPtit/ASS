import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SimpleAuthModule } from '../api/simple-auth/simple-auth.module';

/**
 * Auth Module
 * Re-exports SimpleAuthModule and PassportModule for convenience
 * All authentication logic is in SimpleAuthModule
 */
@Module({
  imports: [SimpleAuthModule, PassportModule],
  exports: [SimpleAuthModule, PassportModule],
})
export class AuthModule {}
