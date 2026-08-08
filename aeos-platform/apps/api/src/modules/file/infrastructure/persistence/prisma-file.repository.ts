import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { FileRepository } from '../../domain/repositories/file.repository';
import { File } from '../../domain/aggregates/file.aggregate';

@Injectable()
export class PrismaFileRepository implements FileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(file: File): Promise<void> {
    await this.prisma.file.upsert({
      where: { id: file.id },
      create: {
        id: file.id,
        tenantId: file.tenantId,
        storageProvider: file.storageProvider,
        storageKey: file.storageKey,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
        uploadedBy: file.uploadedBy,
      },
      update: {
        storageProvider: file.storageProvider,
        storageKey: file.storageKey,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
      },
    });
  }

  async findById(id: string): Promise<File | null> {
    const record = await this.prisma.file.findUnique({ where: { id } });
    if (!record) return null;
    return File.fromPersistence({
      id: record.id,
      tenantId: record.tenantId ?? '',
      storageProvider: record.storageProvider ?? '',
      storageKey: record.storageKey ?? '',
      fileName: record.fileName ?? '',
      mimeType: record.mimeType ?? '',
      size: Number(record.size ?? 0),
      uploadedBy: record.uploadedBy ?? '',
      createdAt: record.createdAt,
    });
  }
}
