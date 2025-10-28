import { Injectable, Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { LearningSystemService } from '../../services/learning-system.service';
import { IScheduledTask } from '../../../../../common/interfaces/scheduled-task.interface';

/**
 * Daily Learning Report Schedule - Orchestration Layer
 * 
 * Coordinates the generation of daily learning reports.
 * Runs every day at 6:30 PM to generate insights and recommendations (30 min after DailyAnalysisSchedule).
 */
@Injectable()
export class DailyLearningReportSchedule implements IScheduledTask {
  readonly name = 'DailyLearningReportSchedule';
  readonly schedule = '0 30 18 * * *'; // 6:30 PM daily

  private readonly logger = new Logger(DailyLearningReportSchedule.name);

  constructor(
    private readonly learningSystemService: LearningSystemService,
  ) {}

  async execute(): Promise<void> {
    this.logger.log('🔄 Starting daily learning report generation...');
    const startTime = Date.now();

    try {
      await this.learningSystemService.generateDailyLearningReport();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(`✅ Daily learning report generation completed in ${duration}s`);
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.error(`❌ Daily learning report generation failed after ${duration}s: ${error.message}`, error.stack);
    }
  }
}
