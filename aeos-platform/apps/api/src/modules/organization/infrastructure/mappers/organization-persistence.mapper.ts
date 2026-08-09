import { Organization as PrismaOrg, OrganizationMember as PrismaOrgMember } from '@aeos/database';
import { Organization, OrganizationProps } from '../../domain/aggregates/organization.aggregate';
import { OrganizationMember } from '../../domain/entities/organization-member.entity';

type PrismaOrgWithMembers = PrismaOrg & { members: PrismaOrgMember[] };

export class OrganizationPersistenceMapper {
  static toPersistence(org: Organization) {
    return {
      id: org.id,
      tenantId: org.tenantId,
      name: org.name,
      ownerId: org.ownerId,
      version: org.version,
      deletedAt: org.deletedAt,
      members: org.members.map((m) => ({
        id: m.id,
        tenantId: m.tenantId,
        organizationId: m.organizationId,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
    };
  }

  static toDomain(record: PrismaOrgWithMembers): Organization {
    const members = record.members.map((m) =>
      OrganizationMember.create({
        id: m.id,
        tenantId: m.tenantId ?? '',
        organizationId: m.organizationId ?? '',
        userId: m.userId ?? '',
        role: m.role ?? 'MEMBER',
        joinedAt: m.joinedAt ?? new Date(),
      }),
    );

    return Organization.fromPersistence({
      id: record.id,
      tenantId: record.tenantId ?? '',
      name: record.name ?? '',
      ownerId: record.ownerId ?? '',
      version: record.version,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
      members,
    });
  }
}
