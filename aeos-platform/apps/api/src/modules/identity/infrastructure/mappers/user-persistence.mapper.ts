import { User as PrismaUser, Prisma } from '@aeos/database';
import { User, UserStatus, UserProps } from '../../domain/aggregates/user.aggregate';

export class UserPersistenceMapper {
  static toPersistence(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email.value,
      passwordHash: user.passwordHash.value,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      status: user.status,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      version: user.version,
    };
  }

  static toDomain(record: PrismaUser): User {
    const props: UserProps = {
      id: record.id,
      tenantId: record.tenantId,
      email: record.email,
      passwordHash: record.passwordHash ?? '',
      firstName: record.firstName,
      lastName: record.lastName,
      avatarUrl: record.avatarUrl,
      status: (record.status as UserStatus) ?? UserStatus.PENDING,
      emailVerified: record.emailVerified ?? false,
      lastLoginAt: record.lastLoginAt,
      version: record.version,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return User.fromPersistence(props);
  }
}
