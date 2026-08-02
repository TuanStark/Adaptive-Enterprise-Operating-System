import { Entity } from '@aeos/shared-kernel';
import { randomBytes } from 'crypto';

export interface SessionProps {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}

export class Session extends Entity<string> {
  private _userId: string;
  private _refreshToken: string;
  private _expiresAt: Date;
  private _revoked: boolean;

  private constructor(props: SessionProps) {
    super(props.id, props.createdAt);
    this._userId = props.userId;
    this._refreshToken = props.refreshToken;
    this._expiresAt = props.expiresAt;
    this._revoked = props.revoked;
  }

  get userId(): string {
    return this._userId;
  }
  get refreshToken(): string {
    return this._refreshToken;
  }
  get expiresAt(): Date {
    return this._expiresAt;
  }
  get revoked(): boolean {
    return this._revoked;
  }

  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  isValid(): boolean {
    return !this._revoked && !this.isExpired();
  }

  revoke(): void {
    this._revoked = true;
  }

  static create(id: string, userId: string, expiresInMs: number): Session {
    const refreshToken = randomBytes(64).toString('hex');
    return new Session({
      id,
      userId,
      refreshToken,
      expiresAt: new Date(Date.now() + expiresInMs),
      revoked: false,
      createdAt: new Date(),
    });
  }

  static fromPersistence(props: SessionProps): Session {
    return new Session(props);
  }
}
