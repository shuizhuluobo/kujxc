import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [EventsController],
})
export class EventsModule {}
