import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  const isProduction = configService.get<string>('app.nodeEnv') === 'production';

  app.setGlobalPrefix('api/v1');

  app.use(helmet());

  const corsOrigins = configService.get<string[]>('app.corsOrigins', [
    'http://localhost:3000',
    'http://localhost:3001',
  ]);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.use(new CorrelationIdMiddleware().use.bind(new CorrelationIdMiddleware()));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new RequestLoggingInterceptor(), new ResponseTransformInterceptor());

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableShutdownHooks();

  process.on('SIGTERM', () => {
    logger.log('Received SIGTERM signal. Starting graceful shutdown...');
  });

  process.on('SIGINT', () => {
    logger.log('Received SIGINT signal. Starting graceful shutdown...');
  });

  await app.listen(port);

  logger.log(`🚀 AEOS API server running on http://localhost:${port}/api/v1`);
  logger.log(`🏥 Health: startup=/health/startup, liveness=/health/liveness, readiness=/health/readiness`);
  logger.log(`🌍 Environment: ${configService.get<string>('app.nodeEnv')}`);

  if (!isProduction) {
    logger.log(`📋 CORS origins: ${corsOrigins.join(', ')}`);
  }
}

bootstrap();
