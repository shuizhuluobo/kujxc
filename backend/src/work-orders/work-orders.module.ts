import { Module } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrdersController } from './work-orders.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { DingtalkModule } from '../dingtalk/dingtalk.module';

@Module({
  imports: [NotificationsModule, DingtalkModule],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}
