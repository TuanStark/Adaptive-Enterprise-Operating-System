import { DomainError } from '@aeos/errors';

export class OrganizationNotFoundError extends DomainError {
  constructor(id: string) {
    super('ORGANIZATION_NOT_FOUND', `Organization "${id}" not found.`, 404);
  }
}

export class OrganizationNameRequiredError extends DomainError {
  constructor() {
    super('ORGANIZATION_NAME_REQUIRED', 'Organization name is required.', 400);
  }
}

export class MemberAlreadyExistsError extends DomainError {
  constructor(userId: string) {
    super('MEMBER_ALREADY_EXISTS', `User "${userId}" is already a member.`, 409);
  }
}

export class MemberNotFoundError extends DomainError {
  constructor(userId: string) {
    super('MEMBER_NOT_FOUND', `Member "${userId}" not found in this organization.`, 404);
  }
}
