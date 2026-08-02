import { AggregateRoot } from '@aeos/shared-kernel';
import { Result } from '@aeos/errors';
import { Email } from '../value-objects/email.vo';
import { HashedPassword } from '../value-objects/hashed-password.vo';
import { UserId } from '../value-objects/user-id.vo';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { UserLoggedInEvent } from '../events/user-logged-in.event';
import {
  UserLockedError,
  UserDisabledError,
  UserNotVerifiedError,
} from '../errors/identity.errors';

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  DISABLED = 'DISABLED',
}

export interface UserProps {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends AggregateRoot<string> {
  private _tenantId: string;
  private _email: Email;
  private _passwordHash: HashedPassword;
  private _firstName: string | null;
  private _lastName: string | null;
  private _avatarUrl: string | null;
  private _status: UserStatus;
  private _emailVerified: boolean;
  private _lastLoginAt: Date | null;

  private constructor(
    id: string,
    tenantId: string,
    email: Email,
    passwordHash: HashedPassword,
    firstName: string | null,
    lastName: string | null,
    avatarUrl: string | null,
    status: UserStatus,
    emailVerified: boolean,
    lastLoginAt: Date | null,
    version: number,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, version, createdAt, updatedAt);
    this._tenantId = tenantId;
    this._email = email;
    this._passwordHash = passwordHash;
    this._firstName = firstName;
    this._lastName = lastName;
    this._avatarUrl = avatarUrl;
    this._status = status;
    this._emailVerified = emailVerified;
    this._lastLoginAt = lastLoginAt;
  }

  get tenantId(): string {
    return this._tenantId;
  }
  get email(): Email {
    return this._email;
  }
  get passwordHash(): HashedPassword {
    return this._passwordHash;
  }
  get firstName(): string | null {
    return this._firstName;
  }
  get lastName(): string | null {
    return this._lastName;
  }
  get avatarUrl(): string | null {
    return this._avatarUrl;
  }
  get status(): UserStatus {
    return this._status;
  }
  get emailVerified(): boolean {
    return this._emailVerified;
  }
  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }

  static register(
    tenantId: string,
    email: Email,
    passwordHash: HashedPassword,
    firstName: string | null,
    lastName: string | null,
  ): User {
    const userId = UserId.create();
    const user = new User(
      userId.value,
      tenantId,
      email,
      passwordHash,
      firstName,
      lastName,
      null,
      UserStatus.PENDING,
      false,
      null,
      0,
    );

    user.addDomainEvent(new UserRegisteredEvent(userId.value, email.value, tenantId));

    return user;
  }

  static fromPersistence(props: UserProps): User {
    return new User(
      props.id,
      props.tenantId,
      Email.fromPersistence(props.email),
      HashedPassword.fromHash(props.passwordHash),
      props.firstName,
      props.lastName,
      props.avatarUrl,
      props.status,
      props.emailVerified,
      props.lastLoginAt,
      props.version,
      props.createdAt,
      props.updatedAt,
    );
  }

  verifyEmail(): Result<void, never> {
    this._emailVerified = true;
    if (this._status === UserStatus.PENDING) {
      this._status = UserStatus.ACTIVE;
    }
    this.touch();
    return Result.ok(undefined);
  }

  recordLogin(): Result<void, UserLockedError | UserDisabledError | UserNotVerifiedError> {
    if (this._status === UserStatus.LOCKED) {
      return Result.fail(new UserLockedError());
    }
    if (this._status === UserStatus.DISABLED) {
      return Result.fail(new UserDisabledError());
    }
    if (this._status === UserStatus.PENDING) {
      return Result.fail(new UserNotVerifiedError());
    }

    this._lastLoginAt = new Date();
    this.touch();

    this.addDomainEvent(new UserLoggedInEvent(this.id, this._email.value, this._lastLoginAt));

    return Result.ok(undefined);
  }

  lock(): Result<void, UserLockedError> {
    if (this._status === UserStatus.LOCKED) {
      return Result.fail(new UserLockedError());
    }
    this._status = UserStatus.LOCKED;
    this.touch();
    return Result.ok(undefined);
  }

  updateProfile(firstName: string | null, lastName: string | null, avatarUrl: string | null): void {
    this._firstName = firstName;
    this._lastName = lastName;
    this._avatarUrl = avatarUrl;
    this.touch();
  }
}
