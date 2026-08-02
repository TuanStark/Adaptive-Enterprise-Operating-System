import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { Organization } from '../../../domain/aggregates/organization.aggregate';
import { OrganizationRepository, ORGANIZATION_REPOSITORY } from '../../../domain/repositories/organization.repository';
import { CreateOrganizationCommand } from './create-organization.command';
import { OrganizationResponseDto } from '../../dto/organization-response.dto';
import { OrganizationMapper } from '../../mappers/organization.mapper';

export class CreateOrganizationHandler {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly orgRepository: OrganizationRepository,
  ) {}

  async execute(command: CreateOrganizationCommand): Promise<Result<OrganizationResponseDto, DomainError>> {
    const createResult = Organization.create(command.tenantId, command.name, command.ownerId);
    if (createResult.isFail) {
      return Result.fail(createResult.error);
    }

    const org = createResult.value;
    await this.orgRepository.save(org);

    return Result.ok(OrganizationMapper.toDto(org));
  }
}
