import { DomainEvent } from '@aeos/shared-kernel';

export class SprintStartedEvent extends DomainEvent {
  constructor(
    public readonly sprintId: string,
    public readonly projectId: string,
  ) {
    super(sprintId);
  }

  toPayload(): Record<string, unknown> {
    return { sprintId: this.sprintId, projectId: this.projectId };
  }
}
