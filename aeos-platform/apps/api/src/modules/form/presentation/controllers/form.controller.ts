import { Controller, Post, Get, Body, Param, Query, Req, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { Request } from 'express';
import { DomainError } from '@aeos/errors';
import { IsString, IsObject, IsOptional, MaxLength, MinLength } from 'class-validator';
import { CreateFormCommand } from '../../application/commands/create-form/create-form.command';
import { CreateFormHandler } from '../../application/commands/create-form/create-form.handler';
import { SubmitFormCommand, SubmitFormHandler } from '../../application/commands/submit-form/submit-form.handler';
import { FormRepository, FORM_REPOSITORY } from '../../domain/repositories/form.repository';

class CreateFormRequestDto {
  @IsString() tenantId!: string;
  @IsString() workspaceId!: string;
  @IsString() @MinLength(1) @MaxLength(255) name!: string;
  @IsOptional() @IsString() description?: string;
  @IsObject() schema!: Record<string, any>;
}

class SubmitFormRequestDto {
  @IsObject() data!: Record<string, any>;
}

@Controller('forms')
export class FormController {
  constructor(
    private readonly createHandler: CreateFormHandler,
    private readonly submitHandler: SubmitFormHandler,
    @Inject(FORM_REPOSITORY)
    private readonly formRepository: FormRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateFormRequestDto) {
    const command = new CreateFormCommand(
      dto.tenantId, dto.workspaceId, dto.name, dto.schema, dto.description,
    );
    const result = await this.createHandler.execute(command);
    if (result.isFail) throw result.error as DomainError;
    return { id: result.value, message: 'Form created.' };
  }

  @Get()
  async list(@Query('workspaceId') workspaceId: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    const p = parseInt(page ?? '1', 10);
    const l = parseInt(limit ?? '20', 10);
    const { data, total } = await this.formRepository.findByWorkspaceId(workspaceId, p, l);
    return {
      data: data.map((f) => ({
        id: f.id, name: f.name, isActive: f.isActive,
        submissionsCount: f.submissions.length, createdAt: f.createdAt,
      })),
      meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
    };
  }

  @Post(':id/submissions')
  async submit(@Param('id') id: string, @Body() dto: SubmitFormRequestDto, @Req() req: Request) {
    const user = (req as any).user;
    const result = await this.submitHandler.execute(new SubmitFormCommand(id, user.userId, dto.data));
    if (result.isFail) throw result.error as DomainError;
    return { message: 'Form submitted.' };
  }
}
