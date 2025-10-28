import { Injectable, Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { DailyReportService } from '../../services/daily-report.service';
import { IScheduledTask } from '../../../../../common/interfaces/scheduled-task.interface';

/**
 * Daily Analysis Schedule - Orchestration Layer
 * 
 * Coordinates the generation of daily analysis reports.
 * Runs every day at 6 PM to generate comprehensive daily reports.
 */
@Injectable()
export class DailyAnalysisSchedule implements IScheduledTask {
  readonly name = 'DailyAnalysisSchedule';
  readonly schedule = CronExpression.EVERY_DAY_AT_6PM;

  private readonly logger = new Logger(DailyAnalysisSchedule.name);

  constructor(
    private readonly dailyReportService: DailyReportService,
  ) {}

  async execute(): Promise<void> {
    this.logger.log('🔄 Starting daily analysis report generation...');
    const startTime = Date.now();

    try {
      await this.dailyReportService.generateDailyAnalysis();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(`✅ Daily analysis report generation completed in ${duration}s`);
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.error(`❌ Daily analysis report generation failed after ${duration}s: ${error.message}`, error.stack);
    }
  }
}
