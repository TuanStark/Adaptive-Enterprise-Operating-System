// ── Sprint types aligned with BE Sprint Entity ──

export type SprintStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED';

export type Sprint = {
  id: string;
  name: string;
  goal: string | null;
  status: SprintStatus;
  startDate: string | null;
  endDate: string | null;
};
