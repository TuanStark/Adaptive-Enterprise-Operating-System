import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';

export interface RoleWithPermissions {
  id: string;
  tenantId: string | null;
  workspaceId: string | null;
  name: string | null;
  description: string | null;
  permissions: { resource: string; action: string }[];
}

export interface RbacService {
  findRoleById(roleId: string): Promise<RoleWithPermissions | null>;
  findRolesByWorkspaceId(workspaceId: string): Promise<RoleWithPermissions[]>;
  createRole(
    tenantId: string,
    workspaceId: string,
    name: string,
    description: string | null,
    permissionIds: string[],
  ): Promise<RoleWithPermissions>;
  hasPermission(roleId: string, resource: string, action: string): Promise<boolean>;
}

export const RBAC_SERVICE = Symbol('RBAC_SERVICE');

@Injectable()
export class PrismaRbacService implements RbacService {
  constructor(private readonly prisma: PrismaService) {}

  async findRoleById(roleId: string): Promise<RoleWithPermissions | null> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
    if (!role) return null;

    return {
      id: role.id,
      tenantId: role.tenantId,
      workspaceId: role.workspaceId,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((rp) => ({
        resource: rp.permission.resource,
        action: rp.permission.action,
      })),
    };
  }

  async findRolesByWorkspaceId(workspaceId: string): Promise<RoleWithPermissions[]> {
    const roles = await this.prisma.role.findMany({
      where: { workspaceId },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    return roles.map((role) => ({
      id: role.id,
      tenantId: role.tenantId,
      workspaceId: role.workspaceId,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((rp) => ({
        resource: rp.permission.resource,
        action: rp.permission.action,
      })),
    }));
  }

  async createRole(
    tenantId: string,
    workspaceId: string,
    name: string,
    description: string | null,
    permissionIds: string[],
  ): Promise<RoleWithPermissions> {
    const role = await this.prisma.role.create({
      data: {
        tenantId,
        workspaceId,
        name,
        description,
        permissions: {
          createMany: {
            data: permissionIds.map((pid) => ({ permissionId: pid })),
          },
        },
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    return {
      id: role.id,
      tenantId: role.tenantId,
      workspaceId: role.workspaceId,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((rp) => ({
        resource: rp.permission.resource,
        action: rp.permission.action,
      })),
    };
  }

  async hasPermission(roleId: string, resource: string, action: string): Promise<boolean> {
    const count = await this.prisma.rolePermission.count({
      where: {
        roleId,
        permission: { resource, action },
      },
    });
    return count > 0;
  }
}
