// apps/api/src/common/interceptors/request-logging.interceptor.ts
// Tự động log mọi request vào/ra với duration.

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { getCorrelationId } from '@aeos/logger';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const correlationId = getCorrelationId();
    const startTime = Date.now();

    this.logger.log(`[${correlationId}] → ${method} ${url} | IP: ${ip}`);

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - startTime;
        this.logger.log(
          `[${correlationId}] ← ${method} ${url} | ${response.statusCode} | ${duration}ms`,
        );
      }),
    );
  }
}
