import { Injectable, Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { IScheduledTask } from '../../../../../common/interfaces/scheduled-task.interface';
import { FeedService } from '../../services/feed.service';

@Injectable()
export class FeedFetchSchedule implements IScheduledTask {
  readonly name = 'FeedFetchSchedule';
  readonly schedule = CronExpression.EVERY_30_MINUTES;
  private readonly logger = new Logger(FeedFetchSchedule.name);

  constructor(private readonly feedService: FeedService) {}

  async execute(): Promise<void> {
    this.logger.log('🔄 Starting RSS feed fetch job...');
    const startTime = Date.now();

    try {
      const result = await this.feedService.jobExecute();

      if (result.saved === 0 && result.skipped === 0) {
        this.logger.warn('⚠️  No feeds fetched or saved');
        return;
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(`✨ Feed fetch job completed in ${duration}s`);
      this.logger.log(`📊 Summary: ${result.saved} saved, ${result.skipped} skipped, ${result.errors} errors`);
    } catch (error) {
      this.logger.error(`💥 Feed fetch job failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}

