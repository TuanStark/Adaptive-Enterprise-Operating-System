import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { Document, DocumentProps } from '../../domain/aggregates/document.aggregate';
import { DocumentVersion } from '../../domain/entities/document-version.entity';

@Injectable()
export class PrismaDocumentRepository implements DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(document: Document): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.document.upsert({
        where: { id: document.id },
        create: {
          id: document.id,
          tenantId: document.tenantId,
          workspaceId: document.workspaceId,
          name: document.name,
          ownerId: document.ownerId,
          visibility: document.visibility,
          version: document.version,
        },
        update: {
          name: document.name,
          visibility: document.visibility,
          deletedAt: document.deletedAt,
          version: { increment: 1 },
        },
      });

      const existingVersions = await tx.documentVersion.findMany({ where: { documentId: document.id } });
      const newVersions = document.versions.filter((v) => !existingVersions.find((ev) => ev.id === v.id));

      if (newVersions.length > 0) {
        await tx.documentVersion.createMany({
          data: newVersions.map((v) => ({
            id: v.id,
            documentId: v.documentId,
            versionNumber: v.versionNumber,
            fileId: v.fileId,
            createdAt: v.createdAt,
          })),
        });
      }
    });
  }

  async findById(id: string): Promise<Document | null> {
    const record = await this.prisma.document.findUnique({
      where: { id, deletedAt: null },
      include: { versions: true },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByWorkspaceId(workspaceId: string, page: number, limit: number): Promise<{ data: Document[]; total: number }> {
    const [records, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        where: { workspaceId, deletedAt: null },
        include: { versions: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.document.count({ where: { workspaceId, deletedAt: null } }),
    ]);

    return { data: records.map(this.toDomain), total };
  }

  private toDomain(record: any): Document {
    const versions = (record.versions ?? []).map((v: any) =>
      DocumentVersion.fromPersistence({
        id: v.id,
        documentId: v.documentId ?? '',
        versionNumber: v.versionNumber ?? 1,
        fileId: v.fileId ?? '',
        createdAt: v.createdAt,
      }),
    );

    return Document.fromPersistence({
      id: record.id,
      tenantId: record.tenantId ?? '',
      workspaceId: record.workspaceId ?? '',
      name: record.name ?? '',
      ownerId: record.ownerId ?? '',
      visibility: record.visibility ?? 'PRIVATE',
      version: record.version,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
      versions,
    });
  }
}
