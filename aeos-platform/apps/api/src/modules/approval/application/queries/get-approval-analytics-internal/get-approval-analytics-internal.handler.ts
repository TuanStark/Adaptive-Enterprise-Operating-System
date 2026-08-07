import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { GetApprovalAnalyticsInternalQuery, ApprovalAnalyticsDto } from '../../../../../common/contracts/approval.contract';

@QueryHandler(GetApprovalAnalyticsInternalQuery)
export class GetApprovalAnalyticsInternalHandler implements IQueryHandler<GetApprovalAnalyticsInternalQuery> {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async execute(query: GetApprovalAnalyticsInternalQuery): Promise<ApprovalAnalyticsDto> {
    const totalApprovals = await this.prisma.approvalRequest.count({ where: { workspaceId: query.workspaceId } });
    return { totalApprovals };
  }
}
