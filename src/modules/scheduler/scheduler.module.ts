import { Module } from '@nestjs/common';
import { SchedulerController } from './controllers/scheduler.controller';

@Module({
  controllers: [SchedulerController],
})
export class SchedulerModule {}

