import { Inject } from '@nestjs/common';
import { Result } from '@aeos/errors';
import { User } from '../../../domain/aggregates/user.aggregate';
import { Email, InvalidEmailError } from '../../../domain/value-objects/email.vo';
import { HashedPassword } from '../../../domain/value-objects/hashed-password.vo';
import { UserRepository, USER_REPOSITORY } from '../../../domain/repositories/user.repository';
import {
  PasswordHasher,
  PASSWORD_HASHER,
} from '../../../domain/services/password-hasher.interface';
import { EmailAlreadyExistsError } from '../../../domain/errors/identity.errors';
import { RegisterUserCommand } from './register-user.command';
import { UserResponseDto } from '../../dto/user-response.dto';
import { UserMapper } from '../../mappers/user.mapper';

type RegisterUserError = InvalidEmailError | EmailAlreadyExistsError;

export class RegisterUserHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: RegisterUserCommand): Promise<Result<UserResponseDto, RegisterUserError>> {
    const emailResult = Email.create(command.email);
    if (emailResult.isFail) {
      return Result.fail(emailResult.error);
    }
    const email = emailResult.value;

    const exists = await this.userRepository.existsByEmail(email);
    if (exists) {
      return Result.fail(new EmailAlreadyExistsError(email.value));
    }

    const hash = await this.passwordHasher.hash(command.password);
    const hashedPassword = HashedPassword.fromHash(hash);

    const user = User.register(
      command.tenantId,
      email,
      hashedPassword,
      command.firstName,
      command.lastName,
    );

    await this.userRepository.save(user);

    return Result.ok(UserMapper.toDto(user));
  }
}
