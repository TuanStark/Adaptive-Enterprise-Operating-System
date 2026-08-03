export interface Meeting {
  id: string;
  title: string;
  startTime: string | null;
  endTime: string | null;
  organizerId: string;
  participants: number;
  createdAt?: string;
}


export interface CreateMeetingInput {
  tenantId: string;
  workspaceId: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  meetingUrl?: string;
}
