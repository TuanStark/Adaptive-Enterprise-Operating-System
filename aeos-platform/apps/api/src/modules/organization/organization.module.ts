import { Module } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { ORGANIZATION_REPOSITORY } from './domain/repositories/organization.repository';
import { PrismaOrganizationRepository } from './infrastructure/persistence/prisma-organization.repository';
import { CreateOrganizationHandler } from './application/commands/create-organization/create-organization.handler';
import { AddMemberHandler } from './application/commands/add-member/add-member.handler';
import { OrganizationController } from './presentation/controllers/organization.controller';

@Module({
  controllers: [OrganizationController],
  providers: [
    PrismaService,
    { provide: ORGANIZATION_REPOSITORY, useClass: PrismaOrganizationRepository },
    CreateOrganizationHandler,
    AddMemberHandler,
  ],
  exports: [ORGANIZATION_REPOSITORY],
})
export class OrganizationModule {}
