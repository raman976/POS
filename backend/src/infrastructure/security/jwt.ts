import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export interface AuthTokenPayload {
  sub: string;
  email: string;
}

export class JwtService {
  public sign(payload: AuthTokenPayload): string {
    const expiresIn = env.jwtExpiresIn as jwt.SignOptions['expiresIn'];

    return jwt.sign(payload, env.jwtSecret, {
      expiresIn,
    });
  }

  public verify(token: string): AuthTokenPayload {
    return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
  }
}
