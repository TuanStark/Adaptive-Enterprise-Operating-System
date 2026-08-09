import { User } from '../../domain/aggregates/user.aggregate';
import { UserResponseDto } from '../dto/user-response.dto';

export class UserMapper {
  static toDto(user: User): UserResponseDto {
    return new UserResponseDto(
      user.id,
      user.tenantId,
      user.email.value,
      user.firstName,
      user.lastName,
      user.avatarUrl,
      user.bio,
      user.timezone,
      user.phone,
      user.status,
      user.emailVerified,
      user.createdAt,
    );
  }
}
