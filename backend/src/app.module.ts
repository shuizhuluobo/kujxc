import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { CustomersModule } from './customers/customers.module';
import { RegionsModule } from './regions/regions.module';
import { ServiceTypesModule } from './service-types/service-types.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EventsModule } from './events/events.module';
import { WikiModule } from './wiki/wiki.module';
import { UploadsModule } from './uploads/uploads.module';
import { HealthModule } from './health/health.module';
import { DingtalkModule } from './dingtalk/dingtalk.module';
import { FeeModule } from './fee/fee.module';
import { PerformanceModule } from './performance/performance.module';
import { ProductsModule } from './products/products.module';
import { SettingsModule } from './settings/settings.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { InventoryModule } from './inventory/inventory.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CsrfGuard } from './common/guards/csrf.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot(
      {
        rootPath: join(process.cwd(), 'assets'),
        serveRoot: '/assets',
      },
      {
        rootPath: join(process.cwd(), 'uploads'),
        serveRoot: '/uploads',
      },
    ),
    CommonModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    WorkOrdersModule,
    CustomersModule,
    RegionsModule,
    ServiceTypesModule,
    NotificationsModule,
    EventEmitterModule.forRoot(),
    EventsModule,
    WikiModule,
    UploadsModule,
    HealthModule,
    DingtalkModule,
    FeeModule,
    PerformanceModule,
    SettingsModule,
    AuditLogModule,
    ProductsModule,
    SuppliersModule,
    WarehousesModule,
    InventoryModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
})
export class AppModule {}
