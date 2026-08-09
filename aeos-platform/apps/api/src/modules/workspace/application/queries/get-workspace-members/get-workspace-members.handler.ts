import { Injectable, Inject } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetWorkspaceMembersQuery } from './get-workspace-members.query';
import { WORKSPACE_QUERY, WorkspaceQuery } from '../workspace-query.interface';
import { SearchUsersInternalQuery, GetUsersInternalQuery, UserInternalDto } from '../../../../../common/contracts/identity.contract';

export interface WorkspaceMemberDto {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  nickname: string | null;
  title: string | null;
  department: string | null;
  statusMessage: string | null;
  joinedAt: string | null;
}

export interface PaginatedMembersResult {
  data: WorkspaceMemberDto[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

@Injectable()
export class GetWorkspaceMembersHandler {
  constructor(
    @Inject(WORKSPACE_QUERY)
    private readonly workspaceQuery: WorkspaceQuery,
    private readonly queryBus: QueryBus,
  ) { }

  async execute(query: GetWorkspaceMembersQuery): Promise<PaginatedMembersResult> {
    let filterUserIds: string[] | undefined = undefined;

    if (query.search) {
      const searchUsersResult: UserInternalDto[] = await this.queryBus.execute(
        new SearchUsersInternalQuery(query.search)
      );
      filterUserIds = searchUsersResult.map(u => u.id);

      if (filterUserIds.length === 0) {
        return {
          data: [],
          meta: { page: query.page, limit: query.limit, total: 0, totalPages: 0 },
        };
      }
    }

    const rawResult = await this.workspaceQuery.getWorkspaceMembers(
      query.workspaceId,
      query.page,
      query.limit,
      filterUserIds
    );

    if (rawResult.data.length === 0) {
      return {
        data: [],
        meta: rawResult.meta,
      };
    }

    const userIdsToFetch = rawResult.data.map(m => m.userId);
    const usersInfo: UserInternalDto[] = await this.queryBus.execute(
      new GetUsersInternalQuery(userIdsToFetch)
    );

    const userMap = new Map<string, UserInternalDto>();
    for (const u of usersInfo) {
      userMap.set(u.id, u);
    }

    const mappedData = rawResult.data.map((m) => {
      const user = userMap.get(m.userId);
      const firstName = user?.firstName ?? '';
      const lastName = user?.lastName ?? '';
      const displayName = [firstName, lastName].filter(Boolean).join(' ') || user?.email || 'Unknown';

      // "Effective Profile" concept: fallback to User profile if WorkspaceMember profile is null
      const effectiveAvatarUrl = m.avatarUrl ?? user?.avatarUrl ?? null;
      const effectiveDisplayName = m.nickname ?? displayName;

      return {
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
      };
    });

    return {
      data: mappedData,
      meta: rawResult.meta,
    };
  }
}
