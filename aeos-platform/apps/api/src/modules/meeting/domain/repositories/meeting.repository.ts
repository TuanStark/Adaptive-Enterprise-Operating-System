import { Meeting } from '../aggregates/meeting.aggregate';

export interface MeetingRepository {
  save(meeting: Meeting): Promise<void>;
  findById(id: string): Promise<Meeting | null>;
  findByWorkspaceId(
    workspaceId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Meeting[]; total: number }>;
}

export const MEETING_REPOSITORY = Symbol('MEETING_REPOSITORY');
