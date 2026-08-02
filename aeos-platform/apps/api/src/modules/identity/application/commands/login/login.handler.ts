import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { generateId } from '@aeos/common';

import { Email } from '../../../domain/value-objects/email.vo';
import { UserRepository, USER_REPOSITORY } from '../../../domain/repositories/user.repository';
import { SessionRepository, SESSION_REPOSITORY } from '../../../domain/repositories/session.repository';
import {
  PasswordHasher,
  PASSWORD_HASHER,
} from '../../../domain/services/password-hasher.interface';
import { InvalidCredentialsError } from '../../../domain/errors/identity.errors';
import { Session } from '../../../domain/entities/session.entity';
import { LoginCommand } from './login.command';
import { JWT_TOKEN_SERVICE, JwtTokenService } from '../../../infrastructure/auth/jwt-token.service';

const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
}

export class LoginHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(JWT_TOKEN_SERVICE)
    private readonly jwtService: JwtTokenService,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<Result<LoginResult, DomainError>> {
    const emailResult = Email.create(command.email);
    if (emailResult.isFail) {
      return Result.fail(new InvalidCredentialsError());
    }
    const email = emailResult.value;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return Result.fail(new InvalidCredentialsError());
    }

    const passwordValid = await this.passwordHasher.verify(
      command.password,
      user.passwordHash.value,
    );
    if (!passwordValid) {
      return Result.fail(new InvalidCredentialsError());
    }

    const loginResult = user.recordLogin();
    if (loginResult.isFail) {
      return Result.fail(loginResult.error);
    }

    await this.userRepository.save(user);

    const session = Session.create(generateId(), user.id, REFRESH_TOKEN_EXPIRY_MS);
    await this.sessionRepository.save(session);

    const accessToken = await this.jwtService.generateAccessToken({
      userId: user.id,
      email: user.email.value,
      tenantId: user.tenantId,
    });

    return Result.ok({
      accessToken,
      refreshToken: session.refreshToken,
      userId: user.id,
      email: user.email.value,
    });
  }
}
