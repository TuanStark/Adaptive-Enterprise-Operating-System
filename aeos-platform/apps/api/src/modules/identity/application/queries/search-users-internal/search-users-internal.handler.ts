import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@aeos/database';
import { SearchUsersInternalQuery, UserInternalDto } from '../../../../../common/contracts/identity.contract';

@QueryHandler(SearchUsersInternalQuery)
export class SearchUsersInternalHandler implements IQueryHandler<SearchUsersInternalQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: SearchUsersInternalQuery): Promise<UserInternalDto[]> {
    if (!query.search) {
      return [];
    }

    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        OR: [
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
      },
      take: 50, // limit internal search results to avoid massive arrays
    });

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarUrl: user.avatarUrl,
    }));
  }
}
