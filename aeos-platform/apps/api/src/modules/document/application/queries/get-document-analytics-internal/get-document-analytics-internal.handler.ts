import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { GetDocumentAnalyticsInternalQuery, DocumentAnalyticsDto } from '../../../../../common/contracts/document.contract';

@QueryHandler(GetDocumentAnalyticsInternalQuery)
export class GetDocumentAnalyticsInternalHandler implements IQueryHandler<GetDocumentAnalyticsInternalQuery> {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async execute(query: GetDocumentAnalyticsInternalQuery): Promise<DocumentAnalyticsDto> {
    const totalDocuments = await this.prisma.document.count({ where: { workspaceId: query.workspaceId } });
    return { totalDocuments };
  }
}
