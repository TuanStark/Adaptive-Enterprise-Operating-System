import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { WorkspaceQuery } from '../../application/queries/workspace-query.interface';
import { UserWorkspaceDto } from '../../application/queries/get-user-workspaces/get-user-workspaces.handler';
import { PaginatedMembersResult } from '../../application/queries/get-workspace-members/get-workspace-members.handler';

@Injectable()
export class PrismaWorkspaceQuery implements WorkspaceQuery {
  constructor(private readonly prisma: PrismaService) {}

  async getUserWorkspaces(userId: string): Promise<UserWorkspaceDto[]> {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: true,
        role: true,
      },
    });

    return memberships
      .filter((m) => m.workspace && m.workspace.deletedAt === null)
      .map((m) => ({
        id: m.workspace!.id,
        name: m.workspace!.name,
        description: m.workspace!.description,
        organizationId: m.workspace!.organizationId,
        status: m.workspace!.status,
        membership: {
          roleId: m.roleId,
          roleName: m.role?.name ?? null,
          joinedAt: m.joinedAt,
        },
      }));
  }

  async getWorkspaceMembers(workspaceId: string, page: number, limit: number): Promise<PaginatedMembersResult> {
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      this.prisma.workspaceMember.findMany({
        where: { workspaceId },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true } },
          role: { select: { name: true } },
        },
        skip,
        take: limit,
        orderBy: { joinedAt: 'asc' },
      }),
      this.prisma.workspaceMember.count({ where: { workspaceId } }),
    ]);

    return {
      data: members.map((m) => {
        const firstName = m.user?.firstName ?? '';
        const lastName = m.user?.lastName ?? '';
        const displayName = [firstName, lastName].filter(Boolean).join(' ') || m.user?.email || 'Unknown';
        return {
          id: m.id,
          userId: m.userId,
          name: displayName,
          email: m.user?.email ?? '',
          role: m.role?.name ?? 'MEMBER',
          avatarUrl: m.user?.avatarUrl ?? null,
          joinedAt: m.joinedAt?.toISOString() ?? null,
        };
      }),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
