export class GetUsersInternalQuery {
  constructor(public readonly userIds: string[]) {}
}

export interface UserInternalDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}
