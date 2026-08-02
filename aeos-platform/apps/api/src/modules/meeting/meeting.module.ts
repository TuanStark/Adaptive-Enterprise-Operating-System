import { Module } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { MEETING_REPOSITORY } from './domain/repositories/meeting.repository';
import { PrismaMeetingRepository } from './infrastructure/persistence/prisma-meeting.repository';
import { CreateMeetingHandler } from './application/commands/create-meeting/create-meeting.handler';
import { MeetingController } from './presentation/controllers/meeting.controller';

@Module({
  controllers: [MeetingController],
  providers: [
    PrismaService,
    { provide: MEETING_REPOSITORY, useClass: PrismaMeetingRepository },
    CreateMeetingHandler,
  ],
  exports: [MEETING_REPOSITORY],
})
export class MeetingModule {}
