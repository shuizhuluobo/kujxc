import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorMonitoringService } from '../services/error-monitoring.service';

interface RequestWithUser extends Request {
  user?: {
    id: string;
  };
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  path: string;
  method: string;
  statusCode: number;
  responseTime: number;
  userId?: string;
  body?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly errorMonitoring?: ErrorMonitoringService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithUser>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // 构建结构化日志
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: status >= 500 ? 'error' : 'warn',
      message: message,
      path: request.url,
      method: request.method,
      statusCode: status,
      responseTime: 0,
      userId: request.user?.id,
      body: this.sanitizeBody(request.body),
      error:
        exception instanceof Error
          ? {
              name: exception.name,
              message: exception.message,
              stack:
                process.env.NODE_ENV === 'development'
                  ? exception.stack
                  : undefined,
            }
          : undefined,
    };

    // 输出结构化日志
    this.logger.log(JSON.stringify(logEntry));

    // 报告到错误监控服务
    if (exception instanceof Error && this.errorMonitoring) {
      this.errorMonitoring.report(exception, {
        path: request.url,
        method: request.method,
        statusCode: status,
        userId: request.user?.id,
      });
    }

    // 发送响应
    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(process.env.NODE_ENV === 'development' && {
        error: exception instanceof Error ? exception.message : exception,
      }),
    });
  }

  private sanitizeBody(body: unknown): Record<string, unknown> | undefined {
    if (!body || typeof body !== 'object') {
      return undefined;
    }

    const sanitized: Record<string, unknown> = {};
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'credential',
      'apiKey',
      'authorization',
    ];

    const bodyObj = body as Record<string, unknown>;
    for (const [key, value] of Object.entries(bodyObj)) {
      if (sensitiveFields.some((sf) => key.toLowerCase().includes(sf))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
