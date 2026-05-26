import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    super({
      jwtFromRequest: (req) => {
        if (req.headers.authorization) {
          return req.headers.authorization.replace('Bearer ', '');
        }
        return null;
      },
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: any) {
    return {
      id: payload.id || payload.sub,
      maNguoiDung: payload.maNguoiDung || payload.id || payload.sub,
      email: payload.email,
      vaiTro: payload.vaiTro,
    };
  }
}
