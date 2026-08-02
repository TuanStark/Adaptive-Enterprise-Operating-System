import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { SessionRepository } from '../../domain/repositories/session.repository';
import { Session, SessionProps } from '../../domain/entities/session.entity';

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(session: Session): Promise<void> {
    await this.prisma.session.upsert({
      where: { id: session.id },
      create: {
        id: session.id,
        userId: session.userId,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
        revoked: session.revoked,
      },
      update: {
        revoked: session.revoked,
      },
    });
  }

  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    const record = await this.prisma.session.findFirst({
      where: { refreshToken },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findActiveByUserId(userId: string): Promise<Session[]> {
    const records = await this.prisma.session.findMany({
      where: { userId, revoked: false },
    });
    return records.map((r) => this.toDomain(r));
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  private toDomain(record: any): Session {
    return Session.fromPersistence({
      id: record.id,
      userId: record.userId ?? '',
      refreshToken: record.refreshToken ?? '',
      expiresAt: record.expiresAt ?? new Date(),
      revoked: record.revoked ?? false,
      createdAt: record.createdAt,
    });
  }
}
