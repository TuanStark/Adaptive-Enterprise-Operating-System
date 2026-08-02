import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { generateId } from '@aeos/common';

import { UserRepository, USER_REPOSITORY } from '../../../domain/repositories/user.repository';
import { SessionRepository, SESSION_REPOSITORY } from '../../../domain/repositories/session.repository';
import { Session } from '../../../domain/entities/session.entity';
import {
  InvalidRefreshTokenError,
  SessionNotFoundError,
} from '../../../domain/errors/identity.errors';
import { RefreshTokenCommand } from './refresh-token.command';
import { JWT_TOKEN_SERVICE, JwtTokenService } from '../../../infrastructure/auth/jwt-token.service';

const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
    @Inject(JWT_TOKEN_SERVICE)
    private readonly jwtService: JwtTokenService,
  ) {}

  async execute(
    command: RefreshTokenCommand,
  ): Promise<Result<RefreshTokenResult, DomainError>> {
    const session = await this.sessionRepository.findByRefreshToken(command.refreshToken);

    if (!session) {
      return Result.fail(new SessionNotFoundError());
    }

    // Nếu token đã bị revoked → nghi ngờ token theft → revoke ALL sessions
    if (session.revoked) {
      await this.sessionRepository.revokeAllByUserId(session.userId);
      return Result.fail(new InvalidRefreshTokenError());
    }

    if (session.isExpired()) {
      return Result.fail(new InvalidRefreshTokenError());
    }

    // Rotation: revoke session cũ
    session.revoke();
    await this.sessionRepository.save(session);

    // Tạo session mới
    const newSession = Session.create(generateId(), session.userId, REFRESH_TOKEN_EXPIRY_MS);
    await this.sessionRepository.save(newSession);

    const user = await this.userRepository.findById(session.userId);
    if (!user) {
      return Result.fail(new InvalidRefreshTokenError());
    }

    const accessToken = await this.jwtService.generateAccessToken({
      userId: user.id,
      email: user.email.value,
      tenantId: user.tenantId,
    });

    return Result.ok({
      accessToken,
      refreshToken: newSession.refreshToken,
    });
  }
}
