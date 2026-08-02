export class CreateMeetingCommand {
  constructor(
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly title: string,
    public readonly organizerId: string,
    public readonly description?: string,
    public readonly startTime?: Date,
    public readonly endTime?: Date,
    public readonly meetingUrl?: string,
  ) {}
}
