import { Controller, Post, Get, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

import { Public } from '../guards/public.decorator';
import { RegisterRequestDto } from '../dto/register.request.dto';
import { LoginRequestDto } from '../dto/login.request.dto';

import { RegisterUserCommand } from '../../application/commands/register-user/register-user.command';
import { RegisterUserHandler } from '../../application/commands/register-user/register-user.handler';
import { LoginCommand } from '../../application/commands/login/login.command';
import { LoginHandler } from '../../application/commands/login/login.handler';
import { GetCurrentUserQuery } from '../../application/queries/get-current-user/get-current-user.query';
import { GetCurrentUserHandler } from '../../application/queries/get-current-user/get-current-user.handler';
import { DomainError } from '@aeos/errors';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerHandler: RegisterUserHandler,
    private readonly loginHandler: LoginHandler,
    private readonly getCurrentUserHandler: GetCurrentUserHandler,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterRequestDto) {
    const command = new RegisterUserCommand(
      dto.tenantId,
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
