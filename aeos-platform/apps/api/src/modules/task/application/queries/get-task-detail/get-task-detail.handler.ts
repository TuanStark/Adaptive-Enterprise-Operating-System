import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { TaskRepository, TASK_REPOSITORY } from '../../../domain/repositories/task.repository';
import { GetTaskDetailQuery } from './get-task-detail.query';
import { GetUsersInternalQuery, UserInternalDto } from 'apps/api/src/common/contracts/identity.contract';

export interface TaskUserDto {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}


export interface TaskDetailDto {
  id: string;
  key: string;
  tenantId: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  type: string;
  priority: string;
  storyPoints: number | null;
  assigneeId: string | null;
  creatorId: string;
  sprintId: string | null;
  parentTaskId: string | null;
  startDate: Date | null;
  dueDate: Date | null;
  resolution: string | null;
  labels: string[];
  originalEstimate: number | null;
  remainingEstimate: number | null;
  timeSpent: number;
  boardPosition: number;
  environment: string | null;
  fixVersionId: string | null;
  reporterId: string | null;
  createdAt: Date;
  updatedAt: Date;
  creator?: TaskUserDto;
  reporter?: TaskUserDto;
  assignee?: TaskUserDto;
}

@Injectable()
export class GetTaskDetailHandler {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
    private readonly queryBus: QueryBus,
  ) { }

  async execute(query: GetTaskDetailQuery): Promise<TaskDetailDto> {
    const task = await this.taskRepository.findById(query.taskId);

    if (!task) {
      throw new NotFoundException(`Task ${query.taskId} not found`);
    }

    const dto: TaskDetailDto = {
      id: task.id,
      key: task.key,
      tenantId: task.tenantId,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      type: task.type,
      priority: task.priority,
      storyPoints: task.storyPoints,
      assigneeId: task.assigneeId,
      creatorId: task.creatorId,
      sprintId: task.sprintId,
      parentTaskId: task.parentTaskId,
      startDate: task.startDate,
      dueDate: task.dueDate,
      resolution: task.resolution,
      labels: task.labels,
      originalEstimate: task.originalEstimate,
      remainingEstimate: task.remainingEstimate,
      timeSpent: task.timeSpent,
      boardPosition: task.boardPosition,
      environment: task.environment,
      fixVersionId: task.fixVersionId,
      reporterId: task.reporterId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };

    // Fetch user details via QueryBus
    const userIds = [task.creatorId, task.reporterId, task.assigneeId].filter(Boolean) as string[];

    if (userIds.length > 0) {
      const users: UserInternalDto[] = await this.queryBus.execute(new GetUsersInternalQuery(userIds));
      const userMap = new Map(users.map((u) => [
        u.id,
        {
          id: u.id,
          displayName: [u.firstName, u.lastName].filter(Boolean).join(' ') || null,
          avatarUrl: u.avatarUrl,
        }
      ]));

      if (task.creatorId && userMap.has(task.creatorId)) {
        dto.creator = userMap.get(task.creatorId);
      }
      if (task.reporterId && userMap.has(task.reporterId)) {
        dto.reporter = userMap.get(task.reporterId);
      }
      if (task.assigneeId && userMap.has(task.assigneeId)) {
        dto.assignee = userMap.get(task.assigneeId);
      }
    }

    return dto;
  }
}
