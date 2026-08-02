import { DomainEvent } from '@aeos/shared-kernel';

export class OrganizationCreatedEvent extends DomainEvent {
  constructor(
    public readonly organizationId: string,
    public readonly tenantId: string,
    public readonly name: string,
    public readonly ownerId: string,
  ) {
    super(organizationId);
  }

  toPayload(): Record<string, unknown> {
    return {
      organizationId: this.organizationId,
      tenantId: this.tenantId,
      name: this.name,
      ownerId: this.ownerId,
    };
  }
}
