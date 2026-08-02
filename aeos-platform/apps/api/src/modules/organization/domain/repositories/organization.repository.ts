import { Organization } from '../aggregates/organization.aggregate';

export interface OrganizationRepository {
  save(organization: Organization): Promise<void>;
  findById(id: string): Promise<Organization | null>;
  findByTenantId(tenantId: string): Promise<Organization[]>;
}

export const ORGANIZATION_REPOSITORY = Symbol('ORGANIZATION_REPOSITORY');
