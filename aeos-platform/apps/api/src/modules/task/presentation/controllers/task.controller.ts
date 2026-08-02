import { Controller, Post, Get, Patch, Body, Param, Query, Req, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { Request } from 'express';
import { DomainError } from '@aeos/errors';
import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { CreateTaskCommand } from '../../application/commands/create-task/create-task.command';
import { CreateTaskHandler } from '../../application/commands/create-task/create-task.handler';
import { ChangeTaskStatusCommand, ChangeTaskStatusHandler } from '../../application/commands/change-task-status/change-task-status.handler';
import { AssignTaskCommand, AssignTaskHandler } from '../../application/commands/assign-task/assign-task.handler';
import { MoveTaskToSprintCommand, MoveTaskToSprintHandler } from '../../application/commands/move-task-to-sprint/move-task-to-sprint.handler';
import { TaskRepository, TASK_REPOSITORY } from '../../domain/repositories/task.repository';

class CreateTaskRequestDto {
  @IsString() tenantId!: string;
  @IsString() projectId!: string;
  @IsString() @MinLength(1) @MaxLength(255) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() storyPoints?: number;
}

class ChangeStatusRequestDto {
  @IsString() status!: string;
}

class AssignTaskRequestDto {
  @IsString() assigneeId!: string;
}

class MoveToSprintRequestDto {
  @IsOptional() @IsString() sprintId?: string;
}

@Controller('tasks')
export class TaskController {
  constructor(
    private readonly createHandler: CreateTaskHandler,
    private readonly changeStatusHandler: ChangeTaskStatusHandler,
    private readonly assignHandler: AssignTaskHandler,
    private readonly moveToSprintHandler: MoveTaskToSprintHandler,
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTaskRequestDto, @Req() req: Request) {
    const user = (req as any).user;
    const command = new CreateTaskCommand(
      dto.tenantId, dto.projectId, dto.title,
      dto.description ?? null, user.userId, dto.priority ?? 'MEDIUM',
      dto.type ?? 'TASK',
    );
    const result = await this.createHandler.execute(command);
    if (result.isFail) throw result.error as DomainError;
    return result.value;
  }

  @Get()
  async list(
    @Query('projectId') projectId?: string,
    @Query('sprintId') sprintId?: string,
    @Query('status') status?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('priority') priority?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = parseInt(page ?? '1', 10);
    const l = parseInt(limit ?? '20', 10);
    const { data, total } = await this.taskRepository.findAll(
      { projectId, sprintId, status, assigneeId, priority }, p, l,
    );
    return {
      data: data.map((t) => ({
        id: t.id, key: t.key, title: t.title, status: t.status, type: t.type,
        priority: t.priority, storyPoints: t.storyPoints,
        assigneeId: t.assigneeId, sprintId: t.sprintId, dueDate: t.dueDate, createdAt: t.createdAt,
      })),
      meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
    };
  }

  @Patch(':id/status')
  async changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusRequestDto) {
    const result = await this.changeStatusHandler.execute(new ChangeTaskStatusCommand(id, dto.status));
    if (result.isFail) throw result.error as DomainError;
    return { message: `Task status changed to ${dto.status}.` };
  }

  @Patch(':id/assign')
  async assign(@Param('id') id: string, @Body() dto: AssignTaskRequestDto) {
    const result = await this.assignHandler.execute(new AssignTaskCommand(id, dto.assigneeId));
    if (result.isFail) throw result.error as DomainError;
    return { message: 'Task assigned.' };
  }

  @Patch(':id/sprint')
  async moveToSprint(@Param('id') id: string, @Body() dto: MoveToSprintRequestDto) {
    const result = await this.moveToSprintHandler.execute(new MoveTaskToSprintCommand(id, dto.sprintId ?? null));
    if (result.isFail) throw result.error as DomainError;
    return { message: dto.sprintId ? 'Task moved to sprint.' : 'Task removed from sprint.' };
  }
}
