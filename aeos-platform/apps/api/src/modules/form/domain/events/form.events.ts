import { DomainEvent } from '@aeos/shared-kernel';
export class FormCreatedEvent extends DomainEvent {
  constructor(public readonly formId: string, public readonly workspaceId: string) { super(formId); }
  toPayload(): Record<string, unknown> { return { formId: this.formId, workspaceId: this.workspaceId }; }
}
export class FormDeletedEvent extends DomainEvent {
  constructor(public readonly formId: string, public readonly workspaceId: string) { super(formId); }
  toPayload(): Record<string, unknown> { return { formId: this.formId, workspaceId: this.workspaceId }; }
}
