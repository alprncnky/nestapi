import { Injectable, Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { ActualImpactTrackerService } from '../../services/actual-impact-tracker.service';
import { IScheduledTask } from '../../../../../common/interfaces/scheduled-task.interface';

/**
 * Actual Impact Tracker Schedule - Orchestration Layer
 * 
 * Coordinates the evaluation of pending predictions against actual stock performance.
 * Runs every hour at :45 minutes past the hour to check predictions created at :15.
 * 
 * Optimized to run only during market hours (09:00-18:00, weekdays) when actual price movements occur.
 * Can still run after market hours to evaluate predictions from earlier in the day.
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
    // Skip if market is closed (no new price movements to track)
    // Note: We still want to evaluate predictions from earlier in the day,
    // but skip during night hours (after 18:00 until next morning)
    const now = new Date();
    const turkeyTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
    const hour = turkeyTime.getHours();

    // Skip during night hours (18:00-09:00) unless it's right after market close (18:00-20:00)
    // This allows evaluation of end-of-day predictions
    if (hour >= 20 || hour < 9) {
      this.logger.debug('⏸️  Outside market evaluation window, skipping impact tracking');
      return;
    }

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
