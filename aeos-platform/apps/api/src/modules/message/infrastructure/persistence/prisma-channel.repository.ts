import { PrismaService } from '@aeos/database';
import { Injectable } from '@nestjs/common';
import { Channel, ChannelType } from '../../domain/aggregates/channel.aggregate';
import { ChannelRepository } from '../../domain/repositories/channel.repository';
import { ChannelMember } from '../../domain/entities/channel-member.entity';

@Injectable()
export class PrismaChannelRepository implements ChannelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(channel: Channel): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.channel.upsert({
        where: { id: channel.id },
        create: {
          id: channel.id,
          tenantId: channel.tenantId,
          workspaceId: channel.workspaceId,
          name: channel.name,
          description: channel.description,
          topic: channel.topic,
          type: channel.type as any,
          isArchived: channel.isArchived,
          version: channel.version,
          createdAt: channel.createdAt,
          updatedAt: channel.updatedAt,
        },
        update: {
          name: channel.name,
          description: channel.description,
          topic: channel.topic,
          type: channel.type as any,
          isArchived: channel.isArchived,
          version: { increment: 1 },
          updatedAt: new Date(),
        },
      });

      await tx.channelMember.deleteMany({ where: { channelId: channel.id } });

      if (channel.members.length > 0) {
        const memberUserIds = channel.members.map((m) => m.userId);
        const validUsers = await tx.user.findMany({
          where: { id: { in: memberUserIds } },
          select: { id: true },
        });
        const validUserIdSet = new Set(validUsers.map((u) => u.id));

        const validMembers = channel.members.filter((m) => validUserIdSet.has(m.userId));

        if (validMembers.length > 0) {
          await tx.channelMember.createMany({
            data: validMembers.map((m) => ({
              id: m.id,
              channelId: channel.id,
              userId: m.userId,
              role: m.role as any,
              lastReadMessageId: m.lastReadMessageId,
              joinedAt: m.joinedAt,
            })),
          });
        }
      }
    });
  }

  async findById(id: string): Promise<Channel | null> {
    const record = await this.prisma.channel.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!record) return null;

    return Channel.fromPersistence({
      id: record.id,
      tenantId: record.tenantId,
      workspaceId: record.workspaceId || '',
      name: record.name,
      description: record.description,
      type: record.type as ChannelType,
      creatorId: record.members.find((m) => m.role === 'OWNER')?.userId || record.members[0]?.userId || '',
      isArchived: record.isArchived,
      topic: record.topic,
      version: record.version,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      members: record.members.map((m) => {
        const member = ChannelMember.create(m.channelId, m.userId, m.role as any);
        if (m.lastReadMessageId) member.updateReadCursor(m.lastReadMessageId);
        return member;
      }),
    });
  }

  async findByWorkspaceId(
    workspaceId: string,
    page: number,
    limit: number,
    userId?: string
  ): Promise<{ data: Channel[]; total: number }> {
    const skip = (page - 1) * limit;
    
    // Filter by workspace
    const baseWhere: any = workspaceId ? { workspaceId } : {};

    // Filter by access (PUBLIC or member)
    if (userId) {
      baseWhere.OR = [
        { type: 'PUBLIC' },
        { members: { some: { userId } } },
      ];
    }
    
    const where = baseWhere;

    const [records, total] = await Promise.all([
      this.prisma.channel.findMany({
        where,
        include: { members: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.channel.count({ where }),
    ]);

    const data = records.map((record) =>
      Channel.fromPersistence({
        id: record.id,
        tenantId: record.tenantId,
        workspaceId: record.workspaceId || '',
        name: record.name,
        description: record.description,
        type: record.type as ChannelType,
        creatorId: record.members.find((m) => m.role === 'OWNER')?.userId || record.members[0]?.userId || '',
        isArchived: record.isArchived,
        topic: record.topic,
        version: record.version,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        members: record.members.map((m) => {
          const member = ChannelMember.create(m.channelId, m.userId, m.role as any);
          if (m.lastReadMessageId) member.updateReadCursor(m.lastReadMessageId);
          return member;
        }),
      })
    );

    return { data, total };
  }

  async findByMemberUserId(userId: string): Promise<Channel[]> {
    const memberships = await this.prisma.channelMember.findMany({
      where: { userId },
      include: { channel: { include: { members: true } } },
    });

    return memberships
      .filter((m) => m.channel)
      .map((m) => {
        const record = m.channel;
        return Channel.fromPersistence({
          id: record.id,
          tenantId: record.tenantId,
          workspaceId: record.workspaceId || '',
          name: record.name,
          description: record.description,
          type: record.type as ChannelType,
          creatorId: record.members.find((mem) => mem.role === 'OWNER')?.userId || record.members[0]?.userId || '',
          isArchived: record.isArchived,
          topic: record.topic,
          version: record.version,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          members: record.members.map((mem) => {
            const member = ChannelMember.create(mem.channelId, mem.userId, mem.role as any);
            if (mem.lastReadMessageId) member.updateReadCursor(mem.lastReadMessageId);
            return member;
          }),
        });
      });
  }

  async findByNameAndWorkspaceId(name: string, workspaceId: string): Promise<Channel | null> {
    const record = await this.prisma.channel.findFirst({
      where: { name, workspaceId },
      include: { members: true },
    });

    if (!record) return null;

    return Channel.fromPersistence({
      id: record.id,
      tenantId: record.tenantId,
      workspaceId: record.workspaceId || '',
      name: record.name,
      description: record.description,
      type: record.type as ChannelType,
      creatorId: record.members.find((m) => m.role === 'OWNER')?.userId || record.members[0]?.userId || '',
      isArchived: record.isArchived,
      topic: record.topic,
      version: record.version,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      members: record.members.map((m) => {
        const member = ChannelMember.create(m.channelId, m.userId, m.role as any);
        if (m.lastReadMessageId) member.updateReadCursor(m.lastReadMessageId);
        return member;
      }),
    });
  }
}
