import { Injectable, Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { RssSourceRepository } from '../../../data/repositories/rss-source.repository';
import { RssFetchService } from '../../services/rss-fetch.service';
import { RssSourcesService } from '../../services/rss-sources.service';
import { IScheduledTask } from '../../../../../common/interfaces/scheduled-task.interface';

/**
 * RSS Fetch Schedule - Orchestration Layer
 * 
 * Coordinates the RSS fetching process across all active sources.
 * Runs every minute to check for new articles.
 */
@Injectable()
export class RssFetchSchedule implements IScheduledTask {
  readonly name = 'RssFetchSchedule';
  readonly schedule = CronExpression.EVERY_5_MINUTES;

  private readonly logger = new Logger(RssFetchSchedule.name);

  constructor(
    private readonly rssSourceRepository: RssSourceRepository,
    private readonly rssFetchService: RssFetchService,
    private readonly rssSourcesService: RssSourcesService,
  ) {}

  async execute(): Promise<void> {
    this.logger.log('🔄 Starting RSS fetch job...');
    const startTime = Date.now();

    try {
      const activeSources = await this.rssSourceRepository.findActive();
      
      if (activeSources.length === 0) {
        this.logger.warn('⚠️  No active RSS sources found');
        return;
      }

      this.logger.log(`📡 Processing ${activeSources.length} active RSS sources...`);

      let totalNew = 0;
      let totalDuplicates = 0;
      let totalErrors = 0;
      let successfulSources = 0;
      let failedSources = 0;

      for (const source of activeSources) {
        try {
          this.logger.debug(`Processing source: ${source.name} (${source.url})`);
          
          const stats = await this.rssFetchService.processFeedSource(source);
          totalNew += stats.newArticles;
          totalDuplicates += stats.duplicates;
          totalErrors += stats.errors;

          await this.rssSourcesService.updateLastFetchTime(source.id);

          const successRate = this.rssFetchService.calculateSuccessRate(stats);
          this.logger.log(`✅ ${source.name}: ${stats.newArticles} new, ${stats.duplicates} duplicates, ${stats.errors} errors (${successRate.toFixed(1)}% success)`);
          
          successfulSources++;
        } catch (error) {
          this.logger.error(`❌ Failed to process source "${source.name}": ${error.message}`);
          failedSources++;
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(`✨ RSS fetch job completed in ${duration}s`);
      this.logger.log(`📊 Summary: ${totalNew} new articles, ${totalDuplicates} duplicates, ${totalErrors} errors`);
      this.logger.log(`🎯 Sources: ${successfulSources} successful, ${failedSources} failed`);
    } catch (error) {
      this.logger.error(`💥 RSS fetch job failed: ${error.message}`, error.stack);
    }
  }
}

