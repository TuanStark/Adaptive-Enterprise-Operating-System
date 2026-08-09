import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RegisterUserHandler } from '../../application/commands/register-user/register-user.handler';
import { RegisterUserCommand } from '../../application/commands/register-user/register-user.command';
import { UserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { Inject } from '@nestjs/common';
import { Email } from '../../domain/value-objects/email.vo';
import { PrismaService } from '@aeos/database';

@Injectable()
export class IdentitySeeder implements OnModuleInit {
  private readonly logger = new Logger(IdentitySeeder.name);

  constructor(
    private readonly registerUserHandler: RegisterUserHandler,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    this.logger.log('Checking for admin account...');

    const adminEmailResult = Email.create('admin@aeos.com');
    if (adminEmailResult.isFail) return;

    const exists = await this.userRepository.existsByEmail(adminEmailResult.value);

    if (!exists) {
      this.logger.log('No admin account found. Creating default admin account...');

      // Ensure a default tenant exists
      let tenant = await this.prisma.tenant.findFirst({
        where: { slug: 'system-root' },
      });
      if (!tenant) {
        tenant = await this.prisma.tenant.create({
          data: {
            name: 'System Root',
            slug: 'system-root',
            status: 'ACTIVE',
          },
        });
      }

      const command = new RegisterUserCommand(
        tenant.id,
        'admin@aeos.com',
        'admin',
        'System',
        'Administrator',
      );

      const result = await this.registerUserHandler.execute(command);

      if (result.isOk) {
        this.logger.log('Default admin account created successfully. (admin@aeos.com / admin)');
      } else {
        this.logger.error('Failed to create default admin account', result.error);
      }
    } else {
      this.logger.log('Admin account already exists.');
    }

    // Auto-verify the admin account (fixes accounts created before auto-verify was added)
    await this.prisma.user.update({
      where: { email: 'admin@aeos.com' },
      data: { status: 'ACTIVE', emailVerified: true },
    });

    // ── Bootstrap: Organization → Workspace → Member → Role ──
    await this.bootstrapDefaultHierarchy();
  }

  /**
   * Tạo chuỗi Organization → Workspace → Member → Role mặc định
   * nếu chưa tồn tại, đảm bảo admin user luôn có một workspace sẵn sàng.
   */
  private async bootstrapDefaultHierarchy() {
    const adminUser = await this.prisma.user.findUnique({
      where: { email: 'admin@aeos.com' },
    });
    if (!adminUser) return;

    const tenantId = adminUser.tenantId;

    // 1. Ensure default Organization
    let org = await this.prisma.organization.findFirst({
      where: { tenantId, name: 'Default Organization' },
    });
    if (!org) {
      org = await this.prisma.organization.create({
        data: {
          tenantId,
          name: 'Default Organization',
          ownerId: adminUser.id,
        },
      });

      // Add admin as org member
      await this.prisma.organizationMember.create({
        data: {
          tenantId,
          organizationId: org.id,
          userId: adminUser.id,
          role: 'ADMIN',
          joinedAt: new Date(),
        },
      });

      this.logger.log(`Default Organization created: ${org.id}`);
    }

    // 2. Ensure default Workspace
    let workspace = await this.prisma.workspace.findFirst({
      where: { tenantId, organizationId: org.id, name: 'Default Workspace' },
    });
    if (!workspace) {
      workspace = await this.prisma.workspace.create({
        data: {
          tenantId,
          organizationId: org.id,
          name: 'Default Workspace',
          description: 'Auto-generated default workspace',
          ownerId: adminUser.id,
          status: 'ACTIVE',
        },
      });
      this.logger.log(`Default Workspace created: ${workspace.id}`);
    }

    // 3. Ensure default Role within workspace
    let adminRole = await this.prisma.role.findFirst({
      where: { tenantId, workspaceId: workspace.id, name: 'ADMIN' },
    });
    if (!adminRole) {
      adminRole = await this.prisma.role.create({
        data: {
          tenantId,
          workspaceId: workspace.id,
          name: 'ADMIN',
          description: 'Workspace administrator with full access',
        },
      });
      this.logger.log(`Default ADMIN role created: ${adminRole.id}`);
    }

    // 4. Ensure admin is a WorkspaceMember
    const existingMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId: workspace.id, userId: adminUser.id },
    });
    if (!existingMember) {
      await this.prisma.workspaceMember.create({
        data: {
          tenantId,
          workspaceId: workspace.id,
          userId: adminUser.id,
          roleId: adminRole.id,
          joinedAt: new Date(),
        },
      });
      this.logger.log(`Admin user added to Default Workspace as ADMIN`);
    }
  }
}
