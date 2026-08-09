import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { DomainError } from '@aeos/errors';
import { CreateProjectRequestDto } from '../dto/create-project.request.dto';
import { CreateProjectCommand } from '../../application/commands/create-project/create-project.command';
import { CreateProjectHandler } from '../../application/commands/create-project/create-project.handler';
import { ChangeProjectStatusCommand } from '../../application/commands/change-project-status/change-project-status.command';
import { ChangeProjectStatusHandler } from '../../application/commands/change-project-status/change-project-status.handler';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from '../../domain/repositories/project.repository';
import { ProjectMapper } from '../../application/mappers/project.mapper';
import { Inject } from '@nestjs/common';

@Controller('projects')
export class ProjectController {
  constructor(
    private readonly createHandler: CreateProjectHandler,
    private readonly changeStatusHandler: ChangeProjectStatusHandler,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProjectRequestDto, @Req() req: Request) {
    const user = (req as any).user;
    const command = new CreateProjectCommand(
      dto.tenantId,
      dto.workspaceId,
      dto.name,
      dto.description ?? null,
      user.userId,
      dto.priority ?? 'MEDIUM',
    );
    const result = await this.createHandler.execute(command);
    if (result.isFail) throw result.error as DomainError;
    return result.value;
  }

  @Get()
  async list(
    @Query('workspaceId') workspaceId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = parseInt(page ?? '1', 10);
    const l = parseInt(limit ?? '20', 10);
    const { data, total } = await this.projectRepository.findByWorkspaceId(workspaceId, p, l);
    return {
      data: data.map(ProjectMapper.toDto),
      meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
    };
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    const result = await this.changeStatusHandler.execute(
      new ChangeProjectStatusCommand(id, 'activate'),
    );
    if (result.isFail) throw result.error as DomainError;
    return { message: 'Project activated.' };
  }

  @Patch(':id/complete')
  async complete(@Param('id') id: string) {
    const result = await this.changeStatusHandler.execute(
      new ChangeProjectStatusCommand(id, 'complete'),
    );
    if (result.isFail) throw result.error as DomainError;
    return { message: 'Project completed.' };
  }

  @Patch(':id/archive')
  async archive(@Param('id') id: string) {
    const result = await this.changeStatusHandler.execute(
      new ChangeProjectStatusCommand(id, 'archive'),
    );
    if (result.isFail) throw result.error as DomainError;
    return { message: 'Project archived.' };
  }
}
