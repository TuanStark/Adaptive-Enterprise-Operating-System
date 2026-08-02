// apps/api/src/common/middleware/correlation-id.middleware.ts
// Gắn Correlation ID cho mọi request.
// ID này đi theo suốt: Controller → Service → Repository → Event → Worker.

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { correlationStorage } from '@aeos/logger';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId = (req.headers['x-correlation-id'] as string) || `req-${randomUUID()}`;

    // Set header cho cả request lẫn response
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    // Lưu vào AsyncLocalStorage — mọi layer đều truy cập được
    correlationStorage.run({ correlationId }, () => {
      next();
    });
  }
}
