export class GetUsersInternalQuery {
  constructor(public readonly userIds: string[]) {}
}

export class SearchUsersInternalQuery {
  constructor(public readonly search: string) {}
}

export interface UserInternalDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
}

export class GetUserAnalyticsInternalQuery {
  constructor(public readonly workspaceId: string) {}
}

export interface UserAnalyticsDto {
  totalUsers: number;
}
