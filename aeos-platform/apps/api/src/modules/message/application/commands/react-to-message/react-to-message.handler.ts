import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import {
  MessageRepository,
  MESSAGE_REPOSITORY,
} from '../../../domain/repositories/message.repository';
import { MessageNotFoundError } from '../../../domain/errors/message.errors';

export class ReactToMessageCommand {
  constructor(
    public readonly messageId: string,
    public readonly userId: string,
    public readonly emoji: string,
  ) {}
}

export class ReactToMessageHandler {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(command: ReactToMessageCommand): Promise<Result<void, DomainError>> {
    const message = await this.messageRepository.findById(command.messageId);
    if (!message) return Result.fail(new MessageNotFoundError(command.messageId));

    message.addReaction(command.userId, command.emoji);
    await this.messageRepository.save(message);
    return Result.ok(undefined);
  }
}
