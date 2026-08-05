import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { GetUserWorkspacesQuery } from './get-user-workspaces.query';

export interface WorkspaceMembershipDto {
  roleId: string | null;
  roleName: string | null;
  joinedAt: Date | null;
}

export interface UserWorkspaceDto {
  id: string;
  name: string | null;
  description: string | null;
  organizationId: string | null;
  status: string | null;
  membership: WorkspaceMembershipDto;
}

@Injectable()
export class GetUserWorkspacesHandler {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUserWorkspacesQuery): Promise<UserWorkspaceDto[]> {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId: query.userId },
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
}
