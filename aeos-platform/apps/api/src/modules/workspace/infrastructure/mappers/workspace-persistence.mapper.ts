import {
  Workspace as PrismaWorkspace,
  WorkspaceMember as PrismaWsMember,
} from '@aeos/database';
import { Workspace, WorkspaceStatus, WorkspaceProps } from '../../domain/aggregates/workspace.aggregate';
import { WorkspaceMember } from '../../domain/entities/workspace-member.entity';

type PrismaWsWithMembers = PrismaWorkspace & { members: PrismaWsMember[] };

export class WorkspacePersistenceMapper {
  static toPersistence(ws: Workspace) {
    return {
      id: ws.id,
      tenantId: ws.tenantId,
      organizationId: ws.organizationId,
      name: ws.name,
      description: ws.description,
      ownerId: ws.ownerId,
      status: ws.status,
      version: ws.version,
      deletedAt: ws.deletedAt,
      members: ws.members.map((m) => ({
        id: m.id,
        tenantId: m.tenantId,
        workspaceId: m.workspaceId,
        userId: m.userId,
        roleId: m.roleId,
        nickname: m.nickname,
        avatarUrl: m.avatarUrl,
        title: m.title,
        department: m.department,
        statusMessage: m.statusMessage,
        joinedAt: m.joinedAt,
      })),
    };
  }

  static toDomain(record: PrismaWsWithMembers): Workspace {
    const members = record.members.map((m) =>
      WorkspaceMember.create({
        id: m.id,
        tenantId: m.tenantId ?? '',
        workspaceId: m.workspaceId ?? '',
        userId: m.userId ?? '',
        roleId: m.roleId,
        nickname: m.nickname,
        avatarUrl: m.avatarUrl,
        title: m.title,
        department: m.department,
        statusMessage: m.statusMessage,
        joinedAt: m.joinedAt ?? new Date(),
      }),
    );

    return Workspace.fromPersistence({
      id: record.id,
      tenantId: record.tenantId ?? '',
      organizationId: record.organizationId ?? '',
      name: record.name ?? '',
      description: record.description,
      ownerId: record.ownerId ?? '',
      status: (record.status as WorkspaceStatus) ?? WorkspaceStatus.ACTIVE,
      version: record.version,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
      members,
    });
  }
}
