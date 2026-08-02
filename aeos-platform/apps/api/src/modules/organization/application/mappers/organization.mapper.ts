import { Organization } from '../../domain/aggregates/organization.aggregate';
import { OrganizationResponseDto } from '../dto/organization-response.dto';

export class OrganizationMapper {
  static toDto(org: Organization): OrganizationResponseDto {
    return new OrganizationResponseDto(
      org.id,
      org.tenantId,
      org.name,
      org.ownerId,
      org.members.length,
      org.createdAt,
    );
  }
}
