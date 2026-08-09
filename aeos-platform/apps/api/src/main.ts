// apps/api/src/main.ts
// Entry point của AEOS API Server.
// Khởi tạo NestJS app với đầy đủ production middleware.

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || 3000;

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // ── Global Prefix ──
  app.setGlobalPrefix('api/v1');

  // ── Security ──
  app.use(helmet());
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://app.aeos.com']
        : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
    credentials: true,
  });

  // ── Middleware ──
  app.use(new CorrelationIdMiddleware().use.bind(new CorrelationIdMiddleware()));

  // ── Global Pipes ──
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw if unknown properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Global Interceptors ──
  app.useGlobalInterceptors(new RequestLoggingInterceptor(), new ResponseTransformInterceptor());

  // ── Global Exception Filter ──
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ── Graceful Shutdown ──
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`🚀 AEOS API server running on http://localhost:${port}/api/v1`);
  logger.log(`🏥 Health check: http://localhost:${port}/api/v1/health`);
}

bootstrap();
