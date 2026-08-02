// packages/database/src/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      // Log mọi truy vấn ở chế độ development
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error', 'warn'],
    });
  }

  async onModuleInit() {
    this.logger.log('Connecting to Database...');
    await this.$connect();
    this.logger.log('Database connected successfully');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from Database...');
    await this.$disconnect();
    this.logger.log('Database disconnected successfully');
  }

  /**
   * Cung cấp method để transaction có thể được test dễ dàng hơn,
   * Hoặc inject khi chia sẻ connection.
   */
  get client(): PrismaClient {
    return this;
  }
}
