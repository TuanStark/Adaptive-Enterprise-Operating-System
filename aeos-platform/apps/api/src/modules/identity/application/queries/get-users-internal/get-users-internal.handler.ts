import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@aeos/database';
import { GetUsersInternalQuery, UserInternalDto } from '../../../../../common/contracts/identity.contract';

@QueryHandler(GetUsersInternalQuery)
export class GetUsersInternalHandler implements IQueryHandler<GetUsersInternalQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUsersInternalQuery): Promise<UserInternalDto[]> {
    if (!query.userIds || query.userIds.length === 0) {
      return [];
    }

    const uniqueIds = Array.from(new Set(query.userIds));

    const users = await this.prisma.user.findMany({
      where: {
        id: { in: uniqueIds },
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    });

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
    }));
  }
}
