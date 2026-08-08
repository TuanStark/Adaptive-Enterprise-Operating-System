import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@aeos/database';
import { Result, DomainError } from '@aeos/errors';
import { GetSystemTenantQuery } from './get-system-tenant.query';
import { SystemTenantNotFoundError } from '../../../domain/errors/identity.errors';

@QueryHandler(GetSystemTenantQuery)
export class GetSystemTenantHandler implements IQueryHandler<GetSystemTenantQuery, Result<string, DomainError>> {
  constructor(private readonly prisma: PrismaService) { }

  async execute(): Promise<Result<string, DomainError>> {
    const defaultTenant = await this.prisma.tenant.findUnique({
      where: { slug: 'system' },
    });

    if (!defaultTenant) {
      return Result.fail(new SystemTenantNotFoundError());
    }

    return Result.ok(defaultTenant.id);
  }
}
