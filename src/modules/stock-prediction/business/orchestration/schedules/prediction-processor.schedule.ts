import { Injectable, Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { PredictionEngineService } from '../../services/prediction-engine.service';
import { IScheduledTask } from '../../../../../common/interfaces/scheduled-task.interface';

/**
 * Prediction Processor Schedule - Orchestration Layer
 * 
 * Coordinates the prediction processing for new articles.
 * Runs every hour at :15 minutes past the hour to process articles fetched by RSS.
 */
@Injectable()
export class PredictionProcessorSchedule implements IScheduledTask {
  readonly name = 'PredictionProcessorSchedule';
  readonly schedule = '0 15 * * * *'; // Every hour at :15 minutes past

  private readonly logger = new Logger(PredictionProcessorSchedule.name);

  constructor(
    private readonly predictionEngineService: PredictionEngineService,
  ) {}

  async execute(): Promise<void> {
    this.logger.log('🔄 Starting prediction processing job...');
    const startTime = Date.now();

    try {
      await this.predictionEngineService.processNewArticles();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(`✅ Prediction processing job completed in ${duration}s`);
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.error(`❌ Prediction processing job failed after ${duration}s: ${error.message}`, error.stack);
    }
  }
}
