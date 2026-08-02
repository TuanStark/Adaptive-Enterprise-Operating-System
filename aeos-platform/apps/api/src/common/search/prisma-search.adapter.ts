import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { SearchService, SearchQuery, SearchResult } from './search.service';

@Injectable()
export class PrismaSearchAdapter implements SearchService {
  constructor(private readonly prisma: PrismaService) { }

  async index(indexName: string, id: string, document: any): Promise<void> {
    // For Prisma adapter, indexing is implicitly handled by the standard repositories
    // We do nothing here, assuming the DB is already updated.
  }

  async remove(indexName: string, id: string): Promise<void> {
    // Similarly, deletion is handled by standard repositories.
  }

  async search(indexName: string, query: SearchQuery): Promise<SearchResult<any>> {
    const { tenantId, workspaceId, query: searchText, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    if (indexName === 'tasks') {
      const where: any = { deletedAt: null };
      if (tenantId) where.tenantId = tenantId;
      if (workspaceId) where.project = { workspaceId };
      if (searchText) {
        where.OR = [
          { title: { contains: searchText, mode: 'insensitive' } },
          { description: { contains: searchText, mode: 'insensitive' } },
        ];
      }

      const [data, total] = await this.prisma.$transaction([
        this.prisma.task.findMany({ where, skip, take: limit }),
        this.prisma.task.count({ where }),
      ]);
      return { data, total };
    }

    if (indexName === 'documents') {
      const where: any = { deletedAt: null };
      if (tenantId) where.tenantId = tenantId;
      if (workspaceId) where.workspaceId = workspaceId;
      if (searchText) {
        where.name = { contains: searchText, mode: 'insensitive' };
      }

      const [data, total] = await this.prisma.$transaction([
        this.prisma.document.findMany({ where, skip, take: limit }),
        this.prisma.document.count({ where }),
      ]);
      return { data, total };
    }

    return { data: [], total: 0 };
  }
}
