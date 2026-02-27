import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'fallback-secret',
    });
  }

  async validate(payload: { sub: string; email: string; naam?: string; rollen: string[] }) {
    if (!payload.sub) throw new UnauthorizedException();
    return { id: payload.sub, email: payload.email, naam: payload.naam, rollen: payload.rollen };
  }
}
