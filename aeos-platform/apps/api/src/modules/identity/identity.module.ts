import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from '@aeos/database';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { PASSWORD_HASHER } from './domain/services/password-hasher.interface';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { Argon2PasswordHasher } from './infrastructure/auth/argon2-password-hasher';
import { JWT_TOKEN_SERVICE, JwtTokenServiceImpl } from './infrastructure/auth/jwt-token.service';
import { RegisterUserHandler } from './application/commands/register-user/register-user.handler';
import { LoginHandler } from './application/commands/login/login.handler';
import { GetCurrentUserHandler } from './application/queries/get-current-user/get-current-user.handler';
import { AuthController } from './presentation/controllers/auth.controller';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [
    PrismaService,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: Argon2PasswordHasher,
    },
    {
      provide: JWT_TOKEN_SERVICE,
      useClass: JwtTokenServiceImpl,
    },
    RegisterUserHandler,
    LoginHandler,
    GetCurrentUserHandler,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [USER_REPOSITORY, JWT_TOKEN_SERVICE],
})
export class IdentityModule {}
