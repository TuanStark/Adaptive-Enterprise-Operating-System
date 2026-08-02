export class SendMessageCommand {
  constructor(
    public readonly channelId: string,
    public readonly senderId: string,
    public readonly content: string,
    public readonly parentMessageId: string | null = null,
  ) {}
}
