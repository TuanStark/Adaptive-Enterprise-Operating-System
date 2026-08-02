import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { OrganizationRepository } from '../../domain/repositories/organization.repository';
import { Organization } from '../../domain/aggregates/organization.aggregate';
import { OrganizationPersistenceMapper } from '../mappers/organization-persistence.mapper';

@Injectable()
export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(org: Organization): Promise<void> {
    const data = OrganizationPersistenceMapper.toPersistence(org);

    await this.prisma.$transaction(async (tx) => {
      await tx.organization.upsert({
        where: { id: org.id },
        create: {
          id: data.id,
          tenantId: data.tenantId,
          name: data.name,
          ownerId: data.ownerId,
          version: data.version,
        },
        update: {
          name: data.name,
          ownerId: data.ownerId,
          deletedAt: data.deletedAt,
          version: { increment: 1 },
        },
      });

      // Sync members: delete all then re-insert
      await tx.organizationMember.deleteMany({ where: { organizationId: org.id } });
      if (data.members.length > 0) {
        await tx.organizationMember.createMany({ data: data.members });
      }
    });
  }

  async findById(id: string): Promise<Organization | null> {
    const record = await this.prisma.organization.findUnique({
      where: { id, deletedAt: null },
      include: { members: true },
    });
    if (!record) return null;
    return OrganizationPersistenceMapper.toDomain(record);
  }

  async findByTenantId(tenantId: string): Promise<Organization[]> {
    const records = await this.prisma.organization.findMany({
      where: { tenantId, deletedAt: null },
      include: { members: true },
    });
    return records.map(OrganizationPersistenceMapper.toDomain);
  }
}
