import { Injectable, Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { ActualImpactTrackerService } from '../../services/actual-impact-tracker.service';
import { IScheduledTask } from '../../../../../common/interfaces/scheduled-task.interface';

/**
 * Actual Impact Tracker Schedule - Orchestration Layer
 * 
 * Coordinates the evaluation of pending predictions against actual stock performance.
 * Runs every hour at :45 minutes past the hour to check predictions created at :15.
 */
@Injectable()
export class ActualImpactTrackerSchedule implements IScheduledTask {
  readonly name = 'ActualImpactTrackerSchedule';
  readonly schedule = '0 45 * * * *'; // Every hour at :45 minutes past

  private readonly logger = new Logger(ActualImpactTrackerSchedule.name);

  constructor(
    private readonly actualImpactTrackerService: ActualImpactTrackerService,
  ) {}

  async execute(): Promise<void> {
    this.logger.log('🔄 Starting actual impact tracking job...');
    const startTime = Date.now();

    try {
      await this.actualImpactTrackerService.checkPendingPredictions();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(`✅ Actual impact tracking job completed in ${duration}s`);
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.error(`❌ Actual impact tracking job failed after ${duration}s: ${error.message}`, error.stack);
    }
  }
}
