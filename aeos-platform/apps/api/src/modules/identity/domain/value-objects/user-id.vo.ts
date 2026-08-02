import { ValueObject } from '@aeos/shared-kernel';
import { generateId } from '@aeos/common';

interface UserIdProps {
  value: string;
}

export class UserId extends ValueObject<UserIdProps> {
  private constructor(props: UserIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(): UserId {
    return new UserId({ value: generateId() });
  }

  static fromString(id: string): UserId {
    return new UserId({ value: id });
  }
}
