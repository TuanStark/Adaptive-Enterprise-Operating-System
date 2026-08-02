import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email?: string;
  tenantId?: string;
  role?: string;
}

export interface JwtTokenService {
  generateAccessToken(payload: JwtPayload): Promise<string>;
  generateRefreshToken(payload: Pick<JwtPayload, 'userId'>): Promise<string>;
  verifyAccessToken(token: string): Promise<JwtPayload>;
  verifyRefreshToken(token: string): Promise<Pick<JwtPayload, 'userId'>>;
}

export const JWT_TOKEN_SERVICE = Symbol('JWT_TOKEN_SERVICE');

@Injectable()
export class JwtTokenServiceImpl implements JwtTokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiry: string;
  private readonly refreshExpiry: string;

  constructor() {
    this.accessSecret = process.env.JWT_SECRET || 'fallback-dev-secret-min-32-chars!!';
    this.refreshSecret = process.env.JWT_SECRET + '-refresh';
    this.accessExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  }

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiry as jwt.SignOptions['expiresIn'],
      issuer: 'aeos-platform',
      subject: payload.userId,
    });
  }

  async generateRefreshToken(payload: Pick<JwtPayload, 'userId'>): Promise<string> {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiry as jwt.SignOptions['expiresIn'],
      issuer: 'aeos-platform',
      subject: payload.userId,
    });
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    const decoded = jwt.verify(token, this.accessSecret, {
      issuer: 'aeos-platform',
    }) as JwtPayload;
    return decoded;
  }

  async verifyRefreshToken(token: string): Promise<Pick<JwtPayload, 'userId'>> {
    const decoded = jwt.verify(token, this.refreshSecret, {
      issuer: 'aeos-platform',
    }) as Pick<JwtPayload, 'userId'>;
    return decoded;
  }
}
