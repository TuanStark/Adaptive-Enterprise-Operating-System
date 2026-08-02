export class UserResponseDto {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly email: string,
    public readonly firstName: string | null,
    public readonly lastName: string | null,
    public readonly avatarUrl: string | null,
    public readonly status: string,
    public readonly emailVerified: boolean,
    public readonly createdAt: Date,
  ) {}
}
