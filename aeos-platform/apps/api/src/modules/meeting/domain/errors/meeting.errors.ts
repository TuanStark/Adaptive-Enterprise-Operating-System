import { DomainError } from '@aeos/errors';

export class MeetingNotFoundError extends DomainError {
  constructor(id: string) {
    super('MEETING_NOT_FOUND', `Meeting "${id}" not found.`, 404);
  }
}

export class InvalidMeetingTimeError extends DomainError {
  constructor() {
    super('INVALID_MEETING_TIME', 'Meeting end time must be after start time.', 400);
  }
}
