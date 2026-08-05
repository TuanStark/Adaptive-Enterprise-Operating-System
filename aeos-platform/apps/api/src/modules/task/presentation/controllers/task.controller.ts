import { Controller, Post, Get, Patch, Delete, Body, Param, Query, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { DomainError } from '@aeos/errors';
import { CreateTaskCommand } from '../../application/commands/create-task/create-task.command';
import { CreateTaskHandler } from '../../application/commands/create-task/create-task.handler';
import { ChangeTaskStatusCommand, ChangeTaskStatusHandler } from '../../application/commands/change-task-status/change-task-status.handler';
import { AssignTaskCommand, AssignTaskHandler } from '../../application/commands/assign-task/assign-task.handler';
import { MoveTaskToSprintCommand, MoveTaskToSprintHandler } from '../../application/commands/move-task-to-sprint/move-task-to-sprint.handler';
import { UpdateTaskCommand } from '../../application/commands/update-task/update-task.command';
import { UpdateTaskHandler } from '../../application/commands/update-task/update-task.handler';
import { DeleteTaskHandler } from '../../application/commands/delete-task/delete-task.handler';
import { DeleteTaskCommand } from '../../application/commands/delete-task/delete-task.command';
import { GetTasksQuery } from '../../application/queries/get-tasks/get-tasks.query';
import { GetTasksHandler } from '../../application/queries/get-tasks/get-tasks.handler';
import { GetTaskDetailQuery } from '../../application/queries/get-task-detail/get-task-detail.query';
import { GetTaskDetailHandler } from '../../application/queries/get-task-detail/get-task-detail.handler';
import { CreateTaskRequestDto } from '../dto/create-task.request.dto';
import { ChangeStatusRequestDto } from '../dto/change-status.request.dto';
import { AssignTaskRequestDto } from '../dto/assign-task.request.dto';
import { MoveToSprintRequestDto } from '../dto/move-to-sprint.request.dto';
import { UpdateTaskRequestDto } from '../dto/update-task.request.dto';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string; tenantId: string };
}

@Controller('tasks')
export class TaskController {
  constructor(
    private readonly createHandler: CreateTaskHandler,
    private readonly changeStatusHandler: ChangeTaskStatusHandler,
    private readonly assignHandler: AssignTaskHandler,
    private readonly moveToSprintHandler: MoveTaskToSprintHandler,
    private readonly updateHandler: UpdateTaskHandler,
    private readonly deleteHandler: DeleteTaskHandler,
    private readonly getTasksHandler: GetTasksHandler,
    private readonly getTaskDetailHandler: GetTaskDetailHandler,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTaskRequestDto, @Req() req: AuthenticatedRequest) {
    const command = new CreateTaskCommand(
      dto.tenantId, dto.projectId, dto.title,
      dto.description ?? null, req.user.userId, dto.priority ?? 'MEDIUM',
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
    const query = new GetTasksQuery(
      { projectId, sprintId, status, assigneeId, priority },
      parseInt(page ?? '1', 10),
      parseInt(limit ?? '20', 10),
    );
    return this.getTasksHandler.execute(query);
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    return this.getTaskDetailHandler.execute(new GetTaskDetailQuery(id));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTaskRequestDto) {
    const command = new UpdateTaskCommand(
      id, dto.title, dto.description, dto.priority,
      dto.type, dto.storyPoints, dto.dueDate,
    );
    const result = await this.updateHandler.execute(command);
    if (result.isFail) throw result.error as DomainError;
    return { message: 'Task updated.' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.deleteHandler.execute(new DeleteTaskCommand(id));
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
