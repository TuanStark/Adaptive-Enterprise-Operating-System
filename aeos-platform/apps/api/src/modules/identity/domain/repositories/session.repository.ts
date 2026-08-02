import { Session } from '../entities/session.entity';

export interface SessionRepository {
  save(session: Session): Promise<void>;
  findByRefreshToken(refreshToken: string): Promise<Session | null>;
  findActiveByUserId(userId: string): Promise<Session[]>;
  revokeAllByUserId(userId: string): Promise<void>;
}

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');
