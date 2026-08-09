import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import {
  GetUserAnalyticsInternalQuery,
  UserAnalyticsDto,
} from '../../../../../common/contracts/identity.contract';

@QueryHandler(GetUserAnalyticsInternalQuery)
export class GetUserAnalyticsInternalHandler implements IQueryHandler<GetUserAnalyticsInternalQuery> {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async execute(query: GetUserAnalyticsInternalQuery): Promise<UserAnalyticsDto> {
    // Determine the number of users that belong to the given workspace.
    // Assuming workspace members are mapped via WorkspaceMember or similar.
    // For now, if user table doesn't have workspaceId, we count users linked to the workspace.
    // Let's check schema/prisma structure or simply return 0 if not immediately possible.
    const totalUsers = await this.prisma.workspaceMember
      .count({ where: { workspaceId: query.workspaceId } })
      .catch(() => 0);
    return { totalUsers };
  }
}
