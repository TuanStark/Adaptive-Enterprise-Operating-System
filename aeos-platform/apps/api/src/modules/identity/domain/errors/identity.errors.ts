import { DomainError } from '@aeos/errors';

export class EmailAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super('EMAIL_ALREADY_EXISTS', `Email "${email}" is already registered.`, 409);
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('INVALID_CREDENTIALS', 'Email or password is incorrect.', 401);
  }
}

export class UserLockedError extends DomainError {
  constructor() {
    super('USER_LOCKED', 'This account has been locked. Please contact support.', 403);
  }
}

export class UserDisabledError extends DomainError {
  constructor() {
    super('USER_DISABLED', 'This account has been disabled.', 403);
  }
}

export class UserNotVerifiedError extends DomainError {
  constructor() {
    super('USER_NOT_VERIFIED', 'Please verify your email before logging in.', 403);
  }
}

export class InvalidRefreshTokenError extends DomainError {
  constructor() {
    super('INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired.', 401);
  }
}

export class SessionNotFoundError extends DomainError {
  constructor() {
    super('SESSION_NOT_FOUND', 'Session not found or already revoked.', 404);
  }
}

export class SystemTenantNotFoundError extends DomainError {
  constructor() {
    super('SYSTEM_TENANT_NOT_FOUND', 'System tenant not found in database.', 404);
  }
}

export class UserNotFoundError extends DomainError {
  constructor() {
    super('USER_NOT_FOUND', 'User not found in database.', 404);
  }
}
