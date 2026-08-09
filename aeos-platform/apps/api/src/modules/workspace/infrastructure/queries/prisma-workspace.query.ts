import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { WorkspaceQuery, PaginatedRawMembersResult } from '../../application/queries/workspace-query.interface';
import { UserWorkspaceDto } from '../../application/queries/get-user-workspaces/get-user-workspaces.handler';

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
          roleName: m.role?.name ?? (m.workspace?.ownerId === userId ? 'OWNER' : 'MEMBER'),
          joinedAt: m.joinedAt,
        },
      }));
  }

  async getWorkspaceMembers(workspaceId: string, page: number, limit: number, filterUserIds?: string[]): Promise<PaginatedRawMembersResult> {
    const skip = (page - 1) * limit;

    const where: any = { workspaceId };

    if (filterUserIds && filterUserIds.length > 0) {
      where.userId = { in: filterUserIds };
    }

    const [members, total] = await Promise.all([
      this.prisma.workspaceMember.findMany({
        where,
        include: {
          role: { select: { name: true } },
        },
        skip,
        take: limit,
        orderBy: { joinedAt: 'asc' },
      }),
      this.prisma.workspaceMember.count({ where }),
    ]);

    return {
      data: members.map((m) => {
        return {
          id: m.id,
          userId: m.userId!, // We assume userId is not null for members here
          role: m.role?.name ?? 'MEMBER',
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
