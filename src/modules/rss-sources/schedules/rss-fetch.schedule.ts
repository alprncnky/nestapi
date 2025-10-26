import { Injectable, Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { IScheduledTask } from '../../../common/interfaces/scheduled-task.interface';
import { RssSourcesService } from '../services/rss-sources.service';
import { RssFetchService } from '../services/rss-fetch.service';
import { RssSourceRepository } from '../repositories/rss-source.repository';

@Injectable()
export class RssFetchSchedule implements IScheduledTask {
  private readonly logger = new Logger(RssFetchSchedule.name);
  readonly name = 'rss-fetch';
  readonly schedule = CronExpression.EVERY_MINUTE;

  constructor(
    private readonly rssSourcesService: RssSourcesService,
    private readonly rssSourceRepository: RssSourceRepository,
    private readonly rssFetchService: RssFetchService,
  ) {}

  async execute(): Promise<void> {
    this.logger.log('📡 Starting RSS fetch job...');

    const activeSources = await this.rssSourceRepository.findActive();

    if (activeSources.length === 0) {
      this.logger.warn('⚠️  No active RSS sources found');
      return;
    }

    this.logger.log(`📋 Processing ${activeSources.length} active source(s)`);

    let totalNew = 0;
    let totalDuplicates = 0;
    let totalErrors = 0;
    let successfulSources = 0;
    let failedSources = 0;

    for (const source of activeSources) {
      try {
        const result = await this.rssFetchService.processFeedSource(source);

        totalNew += result.newArticles;
        totalDuplicates += result.duplicates;
        totalErrors += result.errors;
        successfulSources++;

        this.logger.log(`✅ ${source.name}: ${result.newArticles} new, ${result.duplicates} duplicates, ${result.errors} errors`);

        await this.rssSourcesService.updateLastFetchTime(source.id);
        await this.delay(2000);
      } catch (error) {
        failedSources++;
        this.logger.error(`❌ Failed to process source "${source.name}": ${error.message}`, error.stack);
      }
    }

    this.logger.log(`✨ RSS fetch completed: ${totalNew} new articles, ${totalDuplicates} duplicates, ${totalErrors} errors | Sources: ${successfulSources} successful, ${failedSources} failed`);
  }

  async shouldRun(): Promise<boolean> {
    return true;
  }

  async onError(error: Error): Promise<void> {
    this.logger.error('💥 RSS fetch job failed completely, sending alert...', error.stack);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

