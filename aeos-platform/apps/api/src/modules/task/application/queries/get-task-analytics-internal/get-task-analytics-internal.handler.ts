import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import {
  GetTaskAnalyticsInternalQuery,
  TaskAnalyticsDto,
} from '../../../../../common/contracts/task.contract';

@QueryHandler(GetTaskAnalyticsInternalQuery)
export class GetTaskAnalyticsInternalHandler implements IQueryHandler<GetTaskAnalyticsInternalQuery> {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async execute(query: GetTaskAnalyticsInternalQuery): Promise<TaskAnalyticsDto> {
    const [totalTasks, pendingTasks] = await Promise.all([
      this.prisma.task.count({ where: { project: { workspaceId: query.workspaceId } } }),
      this.prisma.task.count({
        where: {
          project: { workspaceId: query.workspaceId },
          status: { in: ['TODO', 'IN_PROGRESS'] },
        },
      }),
    ]);

    return { totalTasks, pendingTasks };
  }
}
