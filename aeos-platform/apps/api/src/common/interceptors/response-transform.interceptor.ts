// apps/api/src/common/interceptors/response-transform.interceptor.ts
// Wrap mọi response thành format chuẩn: { success: true, data: ..., meta: ... }

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getCorrelationId } from '@aeos/logger';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    traceId: string;
  };
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          traceId: getCorrelationId(),
        },
      })),
    );
  }
}
