import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { Meeting } from '../../../domain/aggregates/meeting.aggregate';
import {
  MeetingRepository,
  MEETING_REPOSITORY,
} from '../../../domain/repositories/meeting.repository';
import { CreateMeetingCommand } from './create-meeting.command';

export class CreateMeetingHandler {
  constructor(
    @Inject(MEETING_REPOSITORY)
    private readonly meetingRepository: MeetingRepository,
  ) {}

  async execute(command: CreateMeetingCommand): Promise<Result<string, DomainError>> {
    const createResult = Meeting.create(
      command.tenantId,
      command.workspaceId,
      command.title,
      command.organizerId,
      command.description,
      command.startTime,
      command.endTime,
      command.meetingUrl,
    );
    if (createResult.isFail) return Result.fail(createResult.error);

    const meeting = createResult.value;
    await this.meetingRepository.save(meeting);
    return Result.ok(meeting.id);
  }
}
