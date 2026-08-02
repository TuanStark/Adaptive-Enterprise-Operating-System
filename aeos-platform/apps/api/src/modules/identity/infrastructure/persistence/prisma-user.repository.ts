import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/aggregates/user.aggregate';
import { Email } from '../../domain/value-objects/email.vo';
import { UserPersistenceMapper } from '../mappers/user-persistence.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<void> {
    const data = UserPersistenceMapper.toPersistence(user);

    await this.prisma.user.upsert({
      where: { id: user.id },
      create: data,
      update: {
        ...data,
        version: { increment: 1 },
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!record) return null;
    return UserPersistenceMapper.toDomain(record);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email: email.value, deletedAt: null },
    });

    if (!record) return null;
    return UserPersistenceMapper.toDomain(record);
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.value, deletedAt: null },
    });
    return count > 0;
  }
}
