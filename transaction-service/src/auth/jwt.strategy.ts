import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SECRET_KEY_JOMORO_KOFFEE',
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    return { id: payload.id, role: payload.role };
  }
}