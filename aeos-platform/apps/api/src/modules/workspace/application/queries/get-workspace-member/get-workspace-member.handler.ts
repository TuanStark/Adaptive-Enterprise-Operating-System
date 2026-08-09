import { Injectable, Inject } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetWorkspaceMemberQuery } from './get-workspace-member.query';
import { WORKSPACE_QUERY, WorkspaceQuery } from '../workspace-query.interface';
import { GetUsersInternalQuery, UserInternalDto } from '../../../../../common/contracts/identity.contract';
import { WorkspaceMemberDto } from '../get-workspace-members/get-workspace-members.handler';
import { Result, NotFoundError } from '@aeos/errors';

@Injectable()
export class GetWorkspaceMemberHandler {
  constructor(
    @Inject(WORKSPACE_QUERY)
    private readonly workspaceQuery: WorkspaceQuery,
    private readonly queryBus: QueryBus,
  ) { }

  async execute(query: GetWorkspaceMemberQuery): Promise<Result<WorkspaceMemberDto, NotFoundError>> {
    const rawResult = await this.workspaceQuery.getWorkspaceMembers(
      query.workspaceId,
      1,
      1,
      [query.userId]
    );

    if (rawResult.data.length === 0) {
      return Result.fail(new NotFoundError('WorkspaceMember', query.userId));
    }

    const m = rawResult.data[0];

    const usersInfo: UserInternalDto[] = await this.queryBus.execute(
      new GetUsersInternalQuery([m.userId])
    );

    const user = usersInfo[0];
    const firstName = user?.firstName ?? '';
    const lastName = user?.lastName ?? '';
    const displayName = [firstName, lastName].filter(Boolean).join(' ') || user?.email || 'Unknown';

    const effectiveAvatarUrl = m.avatarUrl ?? user?.avatarUrl ?? null;
    const effectiveDisplayName = m.nickname ?? displayName;

    return Result.ok({
      id: m.id,
      userId: m.userId,
      name: effectiveDisplayName,
      email: user?.email ?? '',
      role: m.role,
      avatarUrl: effectiveAvatarUrl,
      nickname: m.nickname,
      title: m.title,
      department: m.department,
      statusMessage: m.statusMessage,
      joinedAt: m.joinedAt,
    });
  }
}
