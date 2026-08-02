import { Inject } from '@nestjs/common';
import { Result, NotFoundError } from '@aeos/errors';

import { UserRepository, USER_REPOSITORY } from '../../../domain/repositories/user.repository';
import { UserResponseDto } from '../../dto/user-response.dto';
import { UserMapper } from '../../mappers/user.mapper';
import { GetCurrentUserQuery } from './get-current-user.query';

export class GetCurrentUserHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetCurrentUserQuery): Promise<Result<UserResponseDto, NotFoundError>> {
    const user = await this.userRepository.findById(query.userId);

    if (!user) {
      return Result.fail(new NotFoundError('User', query.userId));
    }

    return Result.ok(UserMapper.toDto(user));
  }
}
