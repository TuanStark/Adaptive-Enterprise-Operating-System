import { ValueObject } from '@aeos/shared-kernel';

interface OrganizationIdProps {
  value: string;
}

export class OrganizationId extends ValueObject<OrganizationIdProps> {
  private constructor(props: OrganizationIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(id: string): OrganizationId {
    return new OrganizationId({ value: id });
  }
}
