import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { DomainError } from '@aeos/errors';
import { CreateSprintCommand } from '../../application/commands/create-sprint/create-sprint.command';
import { CreateSprintHandler } from '../../application/commands/create-sprint/create-sprint.handler';
import {
  StartSprintCommand,
  StartSprintHandler,
} from '../../application/commands/start-sprint/start-sprint.handler';
import {
  CompleteSprintCommand,
  CompleteSprintHandler,
} from '../../application/commands/complete-sprint/complete-sprint.handler';
import { SprintRepository, SPRINT_REPOSITORY } from '../../domain/repositories/sprint.repository';
import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

class CreateSprintRequestDto {
  @IsString() tenantId!: string;
  @IsString() projectId!: string;
  @IsString() @MinLength(1) @MaxLength(255) name!: string;
  @IsOptional() @IsString() goal?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
}

@Controller('sprints')
export class SprintController {
  constructor(
    private readonly createHandler: CreateSprintHandler,
    private readonly startHandler: StartSprintHandler,
    private readonly completeHandler: CompleteSprintHandler,
    @Inject(SPRINT_REPOSITORY)
    private readonly sprintRepository: SprintRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateSprintRequestDto) {
    const command = new CreateSprintCommand(
      dto.tenantId,
      dto.projectId,
      dto.name,
      dto.goal ?? null,
      dto.startDate ?? null,
      dto.endDate ?? null,
    );
    const result = await this.createHandler.execute(command);
    if (result.isFail) throw result.error as DomainError;
    return result.value;
  }

  @Get()
  async list(@Query('projectId') projectId: string) {
    const sprints = await this.sprintRepository.findByProjectId(projectId);
    return sprints.map((s) => ({
      id: s.id,
      name: s.name,
      goal: s.goal,
      status: s.status,
      startDate: s.startDate,
      endDate: s.endDate,
    }));
  }

  @Patch(':id/start')
  async start(@Param('id') id: string) {
    const result = await this.startHandler.execute(new StartSprintCommand(id));
    if (result.isFail) throw result.error as DomainError;
    return { message: 'Sprint started.' };
  }

  @Patch(':id/complete')
  async complete(@Param('id') id: string) {
    const result = await this.completeHandler.execute(new CompleteSprintCommand(id));
    if (result.isFail) throw result.error as DomainError;
    return { message: 'Sprint completed.' };
  }
}
