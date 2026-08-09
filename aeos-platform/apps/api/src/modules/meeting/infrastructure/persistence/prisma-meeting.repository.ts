import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { MeetingRepository } from '../../domain/repositories/meeting.repository';
import { Meeting } from '../../domain/aggregates/meeting.aggregate';
import { MeetingParticipant } from '../../domain/entities/meeting-participant.entity';

@Injectable()
export class PrismaMeetingRepository implements MeetingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(meeting: Meeting): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.meeting.upsert({
        where: { id: meeting.id },
        create: {
          id: meeting.id,
          tenantId: meeting.tenantId,
          workspaceId: meeting.workspaceId,
          title: meeting.title,
          description: meeting.description,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          meetingUrl: meeting.meetingUrl,
          organizerId: meeting.organizerId,
        },
        update: {
          title: meeting.title,
          description: meeting.description,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          meetingUrl: meeting.meetingUrl,
        },
      });

      // Update participants
      const existing = await tx.meetingParticipant.findMany({ where: { meetingId: meeting.id } });
      const currentIds = meeting.participants.map((p) => p.id);

      const toDelete = existing.filter((e) => !currentIds.includes(e.id));
      if (toDelete.length > 0) {
        await tx.meetingParticipant.deleteMany({
          where: { id: { in: toDelete.map((d) => d.id) } },
        });
      }

      for (const p of meeting.participants) {
        await tx.meetingParticipant.upsert({
          where: { id: p.id },
          create: {
            id: p.id,
            meetingId: meeting.id,
            userId: p.userId,
            status: p.status,
            createdAt: p.createdAt,
          },
          update: {
            status: p.status,
          },
        });
      }
    });
  }

  async findById(id: string): Promise<Meeting | null> {
    const record = await this.prisma.meeting.findUnique({
      where: { id },
      include: { participants: true },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByWorkspaceId(
    workspaceId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Meeting[]; total: number }> {
    const [records, total] = await this.prisma.$transaction([
      this.prisma.meeting.findMany({
        where: { workspaceId },
        include: { participants: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startTime: 'desc' },
      }),
      this.prisma.meeting.count({ where: { workspaceId } }),
    ]);

    return { data: records.map(this.toDomain), total };
  }

  private toDomain(record: any): Meeting {
    const participants = (record.participants ?? []).map((p: any) =>
      MeetingParticipant.fromPersistence({
        id: p.id,
        meetingId: p.meetingId ?? '',
        userId: p.userId ?? '',
        status: p.status ?? 'PENDING',
        createdAt: p.createdAt,
      }),
    );

    return Meeting.fromPersistence({
      id: record.id,
      tenantId: record.tenantId ?? '',
      workspaceId: record.workspaceId ?? '',
      title: record.title ?? '',
      description: record.description,
      startTime: record.startTime,
      endTime: record.endTime,
      meetingUrl: record.meetingUrl,
      organizerId: record.organizerId ?? '',
      createdAt: record.createdAt,
      participants,
    });
  }
}
