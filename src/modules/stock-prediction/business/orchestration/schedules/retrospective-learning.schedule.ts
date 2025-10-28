import { Injectable, Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { RetrospectiveLearningService } from '../../services/retrospective-learning.service';
import { IScheduledTask } from '../../../../../common/interfaces/scheduled-task.interface';

/**
 * Retrospective Learning Schedule - Orchestration Layer
 * 
 * Coordinates the retrospective analysis of significant stock movements.
 * Runs every day at 7 PM to analyze the day's movements.
 */
@Injectable()
export class RetrospectiveLearningSchedule implements IScheduledTask {
  readonly name = 'RetrospectiveLearningSchedule';
  readonly schedule = CronExpression.EVERY_DAY_AT_7PM;

  private readonly logger = new Logger(RetrospectiveLearningSchedule.name);

  constructor(
    private readonly retrospectiveLearningService: RetrospectiveLearningService,
  ) {}

  async execute(): Promise<void> {
    this.logger.log('🔄 Starting retrospective learning analysis...');
    const startTime = Date.now();

    try {
      await this.retrospectiveLearningService.performRetrospectiveAnalysis();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(`✅ Retrospective learning analysis completed in ${duration}s`);
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.error(`❌ Retrospective learning analysis failed after ${duration}s: ${error.message}`, error.stack);
    }
  }
}
