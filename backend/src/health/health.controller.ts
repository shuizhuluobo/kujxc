import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';
import * as os from 'os';
import * as fs from 'fs';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
    };
    diskSpace: {
      status: 'ok' | 'warning' | 'critical';
      available: string;
      total: string;
      usagePercent: number;
    };
    memory: {
      status: 'ok' | 'warning' | 'critical';
      free: string;
      total: string;
      usagePercent: number;
    };
  };
}

/**
 * Health Check Controller
 *
 * Provides system health status including:
 * - Database connectivity
 * - Disk space
 * - Memory usage
 *
 * Requirements: 11.5
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get system health status' })
  async getHealth(): Promise<HealthStatus> {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkDiskSpace(),
      this.checkMemory(),
    ]);

    const [database, diskSpace, memory] = checks;

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (database.status === 'down') {
      status = 'unhealthy';
    } else if (
      diskSpace.status === 'critical' ||
      memory.status === 'critical'
    ) {
      status = 'degraded';
    } else if (diskSpace.status === 'warning' || memory.status === 'warning') {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        database,
        diskSpace,
        memory,
      },
    };
  }

  private async checkDatabase() {
    const startTime = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      return {
        status: 'up' as const,
        responseTime,
      };
    } catch (error) {
      this.logger.error(
        `Database health check failed: ${(error as Error).message}`,
      );
      return {
        status: 'down' as const,
      };
    }
  }

  private async checkDiskSpace() {
    try {
      // Get disk space for root partition
      const stats = await fs.promises.statfs('/');
      const total = stats.blocks * stats.bsize;
      const available = stats.bavail * stats.bsize;
      const used = total - available;
      const usagePercent = (used / total) * 100;

      let status: 'ok' | 'warning' | 'critical' = 'ok';
      if (usagePercent > 90) {
        status = 'critical';
      } else if (usagePercent > 80) {
        status = 'warning';
      }

      return {
        status,
        available: this.formatBytes(available),
        total: this.formatBytes(total),
        usagePercent: Math.round(usagePercent * 100) / 100,
      };
    } catch (error) {
      this.logger.error(`Disk space check failed: ${(error as Error).message}`);
      return {
        status: 'ok' as const,
        available: 'unknown',
        total: 'unknown',
        usagePercent: 0,
      };
    }
  }

  private async checkMemory() {
    try {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const usagePercent = (usedMem / totalMem) * 100;

      let status: 'ok' | 'warning' | 'critical' = 'ok';
      if (usagePercent > 90) {
        status = 'critical';
      } else if (usagePercent > 80) {
        status = 'warning';
      }

      return {
        status,
        free: this.formatBytes(freeMem),
        total: this.formatBytes(totalMem),
        usagePercent: Math.round(usagePercent * 100) / 100,
      };
    } catch (error) {
      this.logger.error(`Memory check failed: ${(error as Error).message}`);
      return {
        status: 'ok' as const,
        free: 'unknown',
        total: 'unknown',
        usagePercent: 0,
      };
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
