import { Module, OnModuleInit, forwardRef, Inject } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobExecutionHistorySchema } from './data/schemas/job-execution-history.schema';
import { JobExecutionHistoryController } from './controllers/job-execution-history.controller';
import { JobExecutionHistoryService } from './business/services/job-execution-history.service';
import { JobExecutionHistoryRepository } from './data/repositories/job-execution-history.repository';
import { BaseSchedulerService } from '../../common/services/base-scheduler.service';

/**
 * Job Execution History Module
 * 
 * Tracks and provides history of scheduled job executions for monitoring and logging.
 * Used by BaseSchedulerService to log all job executions.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([JobExecutionHistorySchema]),
  ],
  controllers: [JobExecutionHistoryController],
  providers: [
    JobExecutionHistoryService,
    JobExecutionHistoryRepository,
  ],
  exports: [
    JobExecutionHistoryService,
    JobExecutionHistoryRepository,
  ],
})
export class JobExecutionHistoryModule implements OnModuleInit {
  constructor(
    private readonly jobExecutionHistoryService: JobExecutionHistoryService,
    @Inject(forwardRef(() => BaseSchedulerService))
    private readonly baseSchedulerService: BaseSchedulerService,
  ) {}

  async onModuleInit() {
    // Wire up the job history service to the base scheduler
    // This allows BaseSchedulerService to log job executions
    this.baseSchedulerService.setJobHistoryService(this.jobExecutionHistoryService);
  }
}

