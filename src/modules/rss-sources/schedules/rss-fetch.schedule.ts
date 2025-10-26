import { Injectable, Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { IScheduledTask } from '../../../common/interfaces/scheduled-task.interface';
import { RssSourcesService } from '../rss-sources.service';
import { RssFetchService } from '../services/rss-fetch.service';

/**
 * RSS Fetch Schedule - Orchestration for scheduled RSS fetching
 * 
 * Responsibilities:
 * - Define schedule configuration
 * - Coordinate service calls
 * - Handle high-level flow
 * - Aggregate results and logging
 * 
 * NO business logic here - delegate to RssFetchService!
 * This is pure orchestration.
 */
@Injectable()
export class RssFetchSchedule implements IScheduledTask {
  private readonly logger = new Logger(RssFetchSchedule.name);

  // Schedule configuration
  readonly name = 'rss-fetch';
  readonly schedule = CronExpression.EVERY_10_MINUTES;

  constructor(
    private readonly rssSourcesService: RssSourcesService,
    private readonly rssFetchService: RssFetchService,
  ) {}

  /**
   * Execute the scheduled task
   * Orchestration: Get sources → Process each → Update metadata → Log results
   */
  async execute(): Promise<void> {
    this.logger.log('📡 Starting RSS fetch job...');

    // 1. Get active sources (from data service)
    const activeSources = await this.rssSourcesService.findActiveSources();

    if (activeSources.length === 0) {
      this.logger.warn('⚠️  No active RSS sources found');
      return;
    }

    this.logger.log(`📋 Processing ${activeSources.length} active source(s)`);

    // 2. Process each source (delegate to business service)
    let totalNew = 0;
    let totalDuplicates = 0;
    let totalErrors = 0;
    let successfulSources = 0;
    let failedSources = 0;

    for (const source of activeSources) {
      try {
        // Business logic is in RssFetchService
        const result = await this.rssFetchService.processFeedSource(source);

        totalNew += result.newArticles;
        totalDuplicates += result.duplicates;
        totalErrors += result.errors;
        successfulSources++;

        this.logger.log(
          `✅ ${source.name}: ${result.newArticles} new, ${result.duplicates} duplicates, ${result.errors} errors`,
        );

        // Update last fetch time (data operation)
        await this.rssSourcesService.updateLastFetchTime(source.id);

        // Respectful crawling: delay between sources
        await this.delay(2000); // 2 seconds
      } catch (error) {
        failedSources++;
        this.logger.error(
          `❌ Failed to process source "${source.name}": ${error.message}`,
          error.stack,
        );
      }
    }

    // 3. Log summary
    this.logger.log(
      `✨ RSS fetch completed: ${totalNew} new articles, ${totalDuplicates} duplicates, ` +
      `${totalErrors} errors | Sources: ${successfulSources} successful, ${failedSources} failed`,
    );
  }

  /**
   * Optional: Condition to check if task should run
   * Example: Only run during certain hours
   */
  async shouldRun(): Promise<boolean> {
    return true;
    // EXAMPLE USAGE
    // Example: Only run during business hours (6 AM to 11 PM)
    const hour = new Date().getHours();
    const shouldRun = hour >= 6 && hour <= 23;

    if (!shouldRun) {
      this.logger.debug(`⏭️  Skipping RSS fetch (outside business hours: ${hour}:00)`);
    }

    return shouldRun;
  }

  /**
   * Optional: Custom error handler
   * Called when execute() throws an unhandled error
   */
  async onError(error: Error): Promise<void> {
    this.logger.error(
      '💥 RSS fetch job failed completely, sending alert...',
      error.stack,
    );

    // TODO: Implement alerting
    // - Send email to admin
    // - Post to Slack/Discord
    // - Create error log in database
    // Example:
    // await this.notificationService.alertAdmin('RSS Fetch Failed', error);
  }

  /**
   * Utility: Delay helper for respectful crawling
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

