import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';

import {
  SessionRepository,
  SESSION_REPOSITORY,
} from '../../../domain/repositories/session.repository';
import { SessionNotFoundError } from '../../../domain/errors/identity.errors';
import { LogoutCommand } from './logout.command';

export class LogoutHandler {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<Result<void, DomainError>> {
    const session = await this.sessionRepository.findByRefreshToken(command.refreshToken);
    if (!session) {
      return Result.fail(new SessionNotFoundError());
    }

    session.revoke();
    await this.sessionRepository.save(session);

    return Result.ok(undefined);
  }
}
