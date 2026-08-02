import { ValueObject } from '@aeos/shared-kernel';

interface HashedPasswordProps {
  value: string;
}

export class HashedPassword extends ValueObject<HashedPasswordProps> {
  private constructor(props: HashedPasswordProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static fromHash(hash: string): HashedPassword {
    return new HashedPassword({ value: hash });
  }
}
