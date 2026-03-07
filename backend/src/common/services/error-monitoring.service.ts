import { Injectable, Logger } from '@nestjs/common';

export interface ErrorReport {
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: string;
  level: 'error' | 'warn' | 'info';
}

@Injectable()
export class ErrorMonitoringService {
  private readonly logger = new Logger(ErrorMonitoringService.name);

  private readonly errors: ErrorReport[] = [];
  private readonly maxErrors = 100;

  report(error: Error, context?: Record<string, unknown>) {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      level: 'error',
    };

    this.errors.unshift(report);

    // 限制错误数量
    if (this.errors.length > this.maxErrors) {
      this.errors.pop();
    }

    // 控制台输出
    this.logger.error(
      JSON.stringify({
        message: error.message,
        stack: error.stack,
        context,
      }),
    );

    return report;
  }

  warn(message: string, context?: Record<string, unknown>) {
    const report: ErrorReport = {
      message,
      timestamp: new Date().toISOString(),
      level: 'warn',
      context,
    };

    this.errors.unshift(report);

    if (this.errors.length > this.maxErrors) {
      this.errors.pop();
    }

    this.logger.warn(JSON.stringify({ message, context }));

    return report;
  }

  info(message: string, context?: Record<string, unknown>) {
    const report: ErrorReport = {
      message,
      timestamp: new Date().toISOString(),
      level: 'info',
      context,
    };

    this.logger.log(JSON.stringify({ message, context }));

    return report;
  }

  getRecentErrors(count = 10): ErrorReport[] {
    return this.errors.slice(0, count);
  }

  getErrorCount(): number {
    return this.errors.length;
  }

  clearErrors() {
    this.errors.length = 0;
  }
}
