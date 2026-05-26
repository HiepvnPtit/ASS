import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SimpleAuthController } from './simple-auth.controller';
import { SimpleAuthService } from './simple-auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { NguoiDung } from '../../entities/nguoi-dung.entity';
import { KhachHang } from '../../entities/khach-hang.entity';
import { TaiXe } from '../../entities/tai-xe.entity';
import { DeviceToken } from '../../entities/device-token.entity';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

@Module({
  imports: [
    TypeOrmModule.forFeature([NguoiDung, KhachHang, TaiXe, DeviceToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [SimpleAuthController],
  providers: [SimpleAuthService, JwtStrategy],
  exports: [SimpleAuthService, PassportModule],
})
export class SimpleAuthModule {}
