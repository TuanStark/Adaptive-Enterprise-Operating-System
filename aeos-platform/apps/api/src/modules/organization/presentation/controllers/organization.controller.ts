import { Controller, Post, Get, Body, Param, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { DomainError } from '@aeos/errors';
import { CreateOrganizationRequestDto } from '../dto/create-organization.request.dto';
import { CreateOrganizationCommand } from '../../application/commands/create-organization/create-organization.command';
import { CreateOrganizationHandler } from '../../application/commands/create-organization/create-organization.handler';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly createHandler: CreateOrganizationHandler) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOrganizationRequestDto, @Req() req: Request) {
    const user = (req as any).user;
    const command = new CreateOrganizationCommand(dto.tenantId, dto.name, user.userId);

    const result = await this.createHandler.execute(command);
    if (result.isFail) {
      throw result.error as DomainError;
    }
    return result.value;
  }
}
