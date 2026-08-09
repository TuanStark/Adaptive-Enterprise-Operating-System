import { Controller, Post, Get, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

import { Public } from '../guards/public.decorator';
import { RegisterRequestDto } from '../dto/register.request.dto';
import { LoginRequestDto } from '../dto/login.request.dto';
import { RefreshTokenRequestDto } from '../dto/refresh-token.request.dto';
import { LogoutRequestDto } from '../dto/logout.request.dto';

import { RegisterUserCommand } from '../../application/commands/register-user/register-user.command';
import { RegisterUserHandler } from '../../application/commands/register-user/register-user.handler';
import { LoginCommand } from '../../application/commands/login/login.command';
import { LoginHandler } from '../../application/commands/login/login.handler';
import { RefreshTokenCommand } from '../../application/commands/refresh-token/refresh-token.command';
import { RefreshTokenHandler } from '../../application/commands/refresh-token/refresh-token.handler';
import { LogoutCommand } from '../../application/commands/logout/logout.command';
import { LogoutHandler } from '../../application/commands/logout/logout.handler';
import { GetCurrentUserQuery } from '../../application/queries/get-current-user/get-current-user.query';
import { GetCurrentUserHandler } from '../../application/queries/get-current-user/get-current-user.handler';
import { DomainError } from '@aeos/errors';
import { GetSystemTenantHandler } from '../../application/queries/get-system-tenant/get-system-tenant.handler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerHandler: RegisterUserHandler,
    private readonly loginHandler: LoginHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
    private readonly logoutHandler: LogoutHandler,
    private readonly getCurrentUserHandler: GetCurrentUserHandler,
    private readonly getSystemTenantHandler: GetSystemTenantHandler,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterRequestDto) {
    let tenantId = dto.tenantId;

    if (tenantId === 'default' || !tenantId) {
      const tenantResult = await this.getSystemTenantHandler.execute();
      if (tenantResult.isFail) {
        throw tenantResult.error as DomainError;
      }
      tenantId = tenantResult.value;
    }

    const command = new RegisterUserCommand(
      tenantId,
      dto.email,
      dto.password,
      dto.firstName ?? null,
      dto.lastName ?? null,
    );

    const result = await this.registerHandler.execute(command);

    if (result.isFail) {
      throw result.error as DomainError;
    }

    return result.value;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequestDto) {
    const command = new LoginCommand(dto.email, dto.password);

    const result = await this.loginHandler.execute(command);

    if (result.isFail) {
      throw result.error as DomainError;
    }

    return result.value;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenRequestDto) {
    const command = new RefreshTokenCommand(dto.refreshToken);

    const result = await this.refreshTokenHandler.execute(command);

    if (result.isFail) {
      throw result.error as DomainError;
    }

    return result.value;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() dto: LogoutRequestDto) {
    const command = new LogoutCommand(dto.refreshToken);

    const result = await this.logoutHandler.execute(command);

    if (result.isFail) {
      throw result.error as DomainError;
    }

    return { message: 'Logged out successfully.' };
  }

  @Get('me')
  async me(@Req() req: Request) {
    const user = (req as any).user;
    const query = new GetCurrentUserQuery(user.userId);

    const result = await this.getCurrentUserHandler.execute(query);

    if (result.isFail) {
      throw result.error as DomainError;
    }

    return result.value;
  }
}
