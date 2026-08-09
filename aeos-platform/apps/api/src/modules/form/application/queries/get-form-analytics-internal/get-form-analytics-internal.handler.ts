import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import {
  GetFormAnalyticsInternalQuery,
  FormAnalyticsDto,
} from '../../../../../common/contracts/form.contract';

@QueryHandler(GetFormAnalyticsInternalQuery)
export class GetFormAnalyticsInternalHandler implements IQueryHandler<GetFormAnalyticsInternalQuery> {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async execute(query: GetFormAnalyticsInternalQuery): Promise<FormAnalyticsDto> {
    const totalForms = await this.prisma.dynamicForm.count({
      where: { workspaceId: query.workspaceId },
    });
    return { totalForms };
  }
}
