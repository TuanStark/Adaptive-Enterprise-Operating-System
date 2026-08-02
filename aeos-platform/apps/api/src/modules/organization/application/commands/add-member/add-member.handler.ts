import { Inject } from '@nestjs/common';
import { Result, DomainError, NotFoundError } from '@aeos/errors';
import { OrganizationRepository, ORGANIZATION_REPOSITORY } from '../../../domain/repositories/organization.repository';
import { AddMemberCommand } from './add-member.command';

export class AddMemberHandler {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly orgRepository: OrganizationRepository,
  ) {}

  async execute(command: AddMemberCommand): Promise<Result<void, DomainError>> {
    const org = await this.orgRepository.findById(command.organizationId);
    if (!org) {
      return Result.fail(new NotFoundError('Organization', command.organizationId));
    }

    const addResult = org.addMember(command.tenantId, command.userId, command.role);
    if (addResult.isFail) {
      return Result.fail(addResult.error);
    }

    await this.orgRepository.save(org);
    return Result.ok(undefined);
  }
}
