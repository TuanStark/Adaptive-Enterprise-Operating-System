export class UpdateUserProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly firstName: string | null,
    public readonly lastName: string | null,
    public readonly avatarUrl: string | null,
    public readonly bio: string | null,
    public readonly timezone: string | null,
    public readonly phone: string | null,
  ) {}
}
