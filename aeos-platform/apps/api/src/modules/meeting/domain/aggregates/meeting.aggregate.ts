import { AggregateRoot } from '@aeos/shared-kernel';
import { Result } from '@aeos/errors';
import { generateId } from '@aeos/common';
import { InvalidMeetingTimeError } from '../errors/meeting.errors';
import { MeetingParticipant } from '../entities/meeting-participant.entity';

export interface MeetingProps {
  id: string;
  tenantId: string;
  workspaceId: string;
  title: string;
  description: string | null;
  startTime: Date | null;
  endTime: Date | null;
  meetingUrl: string | null;
  organizerId: string;
  createdAt: Date;
  participants: MeetingParticipant[];
}

export class Meeting extends AggregateRoot<string> {
  private _tenantId: string;
  private _workspaceId: string;
  private _title: string;
  private _description: string | null;
  private _startTime: Date | null;
  private _endTime: Date | null;
  private _meetingUrl: string | null;
  private _organizerId: string;
  private _participants: MeetingParticipant[];

  private constructor(props: MeetingProps) {
    super(props.id, 1, props.createdAt, props.createdAt);
    this._tenantId = props.tenantId;
    this._workspaceId = props.workspaceId;
    this._title = props.title;
    this._description = props.description;
    this._startTime = props.startTime;
    this._endTime = props.endTime;
    this._meetingUrl = props.meetingUrl;
    this._organizerId = props.organizerId;
    this._participants = props.participants;
  }

  get tenantId(): string { return this._tenantId; }
  get workspaceId(): string { return this._workspaceId; }
  get title(): string { return this._title; }
  get description(): string | null { return this._description; }
  get startTime(): Date | null { return this._startTime; }
  get endTime(): Date | null { return this._endTime; }
  get meetingUrl(): string | null { return this._meetingUrl; }
  get organizerId(): string { return this._organizerId; }
  get participants(): ReadonlyArray<MeetingParticipant> { return this._participants; }

  static create(
    tenantId: string, workspaceId: string, title: string, organizerId: string,
    description: string | null = null, startTime: Date | null = null, endTime: Date | null = null,
    meetingUrl: string | null = null,
  ): Result<Meeting, InvalidMeetingTimeError> {
    if (startTime && endTime && startTime >= endTime) {
      return Result.fail(new InvalidMeetingTimeError());
    }

    const meeting = new Meeting({
      id: generateId(),
      tenantId,
      workspaceId,
      title,
      description,
      startTime,
      endTime,
      meetingUrl,
      organizerId,
      createdAt: new Date(),
      participants: [MeetingParticipant.create(generateId(), organizerId, 'ACCEPTED')],
    });

    return Result.ok(meeting);
  }

  static fromPersistence(props: MeetingProps): Meeting {
    return new Meeting(props);
  }

  addParticipant(userId: string): void {
    if (!this._participants.find(p => p.userId === userId)) {
      this._participants.push(MeetingParticipant.create(this.id, userId, 'PENDING'));
      this.touch();
    }
  }

  removeParticipant(userId: string): void {
    this._participants = this._participants.filter(p => p.userId !== userId);
    this.touch();
  }

  updateParticipantStatus(userId: string, status: string): void {
    const participant = this._participants.find(p => p.userId === userId);
    if (participant) {
      participant.changeStatus(status);
      this.touch();
    }
  }
}
