// ── Meeting types aligned with BE Meeting Entity ──

export type Meeting = {
  id: string;
  title: string;
  description: string | null;
  startTime: string | null;
  endTime: string | null;
  organizerId: string;
  organizerName: string;
  participants: string[];
  meetingUrl: string | null;
  createdAt: string;
};
