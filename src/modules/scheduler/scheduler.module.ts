import { Module } from '@nestjs/common';
import { SchedulerController } from './controllers/scheduler.controller';

/**
 * Scheduler Module
 * 
 * Provides REST API endpoints for managing and triggering scheduled tasks.
 * Allows manual triggering, starting, stopping, and monitoring scheduled jobs.
 * 
 * Note: BaseSchedulerService is provided globally via GlobalSchedulerModule,
 * so we don't need to import it here.
 */
@Module({
  controllers: [SchedulerController],
})
export class SchedulerModule {}

