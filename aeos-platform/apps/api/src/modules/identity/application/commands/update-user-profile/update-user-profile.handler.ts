import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '@aeos/errors';
import { Inject } from '@nestjs/common';
import { UpdateUserProfileCommand } from './update-user-profile.command';
import { UserRepository, USER_REPOSITORY } from '../../../domain/repositories/user.repository';
import { UserNotFoundError } from '../../../domain/errors/identity.errors';

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler implements ICommandHandler<UpdateUserProfileCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UpdateUserProfileCommand): Promise<Result<void, UserNotFoundError>> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      return Result.fail(new UserNotFoundError());
    }

    user.updateProfile(
      command.firstName,
      command.lastName,
      command.avatarUrl,
      command.bio,
      command.timezone,
      command.phone,
    );

    await this.userRepository.save(user);

    return Result.ok(undefined);
  }
}
