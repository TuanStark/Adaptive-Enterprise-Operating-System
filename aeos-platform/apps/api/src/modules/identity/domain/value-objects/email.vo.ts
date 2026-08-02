import { ValueObject } from '@aeos/shared-kernel';
import { Result } from '@aeos/errors';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(props: EmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(email: string): Result<Email, InvalidEmailError> {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      return Result.fail(new InvalidEmailError('Email is required.'));
    }

    if (!this.EMAIL_REGEX.test(trimmed)) {
      return Result.fail(new InvalidEmailError(`"${trimmed}" is not a valid email format.`));
    }

    return Result.ok(new Email({ value: trimmed }));
  }

  static fromPersistence(email: string): Email {
    return new Email({ value: email });
  }
}

export class InvalidEmailError {
  public readonly code = 'INVALID_EMAIL';
  constructor(public readonly message: string) {}
}
