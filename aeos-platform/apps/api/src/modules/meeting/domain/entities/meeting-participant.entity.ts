import { Entity } from '@aeos/shared-kernel';
import { generateId } from '@aeos/common';

export interface MeetingParticipantProps {
  id: string;
  meetingId: string;
  userId: string;
  status: string;
  createdAt: Date;
}

export class MeetingParticipant extends Entity<string> {
  private _meetingId: string;
  private _userId: string;
  private _status: string;

  private constructor(props: MeetingParticipantProps) {
    super(props.id, props.createdAt);
    this._meetingId = props.meetingId;
    this._userId = props.userId;
    this._status = props.status;
  }

  get meetingId(): string { return this._meetingId; }
  get userId(): string { return this._userId; }
  get status(): string { return this._status; }

  static create(meetingId: string, userId: string, status: string = 'PENDING'): MeetingParticipant {
    return new MeetingParticipant({
      id: generateId(), meetingId, userId, status, createdAt: new Date(),
    });
  }

  static fromPersistence(props: MeetingParticipantProps): MeetingParticipant {
    return new MeetingParticipant(props);
  }

  changeStatus(status: string): void {
    this._status = status;
  }
}
