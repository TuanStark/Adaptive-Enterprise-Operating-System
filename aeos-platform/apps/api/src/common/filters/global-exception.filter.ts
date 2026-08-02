import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainError } from '@aeos/errors';
import { getCorrelationId } from '@aeos/logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = getCorrelationId();
    const timestamp = new Date().toISOString();

    if (exception instanceof DomainError) {
      this.logger.warn(
        `[${correlationId}] DomainError: ${exception.code} - ${exception.message} | ${request.method} ${request.url}`,
      );
      response.status(exception.httpStatus).json({
        success: false,
        error: exception.toJSON(),
        traceId: correlationId,
        timestamp,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? (exceptionResponse as any).message
          : exception.message;

      this.logger.warn(
        `[${correlationId}] HttpException: ${status} - ${JSON.stringify(message)} | ${request.method} ${request.url}`,
      );
      response.status(status).json({
        success: false,
        error: {
          code: `HTTP_${status}`,
          message: Array.isArray(message) ? message : [message],
        },
        traceId: correlationId,
        timestamp,
      });
      return;
    }

    const stack = exception instanceof Error ? exception.stack : String(exception);
    this.logger.error(`[${correlationId}] UNHANDLED: ${stack} | ${request.method} ${request.url}`);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again later.',
      },
      traceId: correlationId,
      timestamp,
    });
  }
}
