import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BaseSchedulerService } from './services/base-scheduler.service';

/**
 * Global Scheduler Module
 * 
 * Provides BaseSchedulerService globally to all modules
 * No need to import this module explicitly - it's @Global()
 * 
 * Usage in feature modules:
 * ```typescript
 * export class MyModule implements OnModuleInit {
 *   constructor(private readonly baseScheduler: BaseSchedulerService) {}
 *   
 *   async onModuleInit() {
 *     this.baseScheduler.registerTask(this.mySchedule);
 *   }
 * }
 * ```
 */
@Global()
@Module({
  imports: [
    ScheduleModule.forRoot(), // Enable scheduling
  ],
  providers: [BaseSchedulerService],
  exports: [BaseSchedulerService],
})
export class GlobalSchedulerModule {}

