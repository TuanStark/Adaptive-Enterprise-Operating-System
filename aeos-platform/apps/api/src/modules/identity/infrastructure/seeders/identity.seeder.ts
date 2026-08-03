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
        where: { slug: 'system-root' }
      });
      if (!tenant) {
        tenant = await this.prisma.tenant.create({
          data: {
            name: 'System Root',
            slug: 'system-root',
            status: 'ACTIVE',
          }
        });
      }

      const command = new RegisterUserCommand(
        tenant.id,
        'admin@aeos.com',
        'admin',
        'System',
        'Administrator'
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
  }
}
