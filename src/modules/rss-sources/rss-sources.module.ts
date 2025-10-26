import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RssSourceSchema } from './schemas/rss-source.schema';
import { SourceReliabilityScoreSchema } from './schemas/source-reliability-score.schema';
import { RssSourcesController } from './rss-sources.controller';
import { RssSourcesService } from './rss-sources.service';
import { RssParserService } from './rss-parser.service';
import { RssFetchService } from './services/rss-fetch.service';
import { RssFetchSchedule } from './schedules/rss-fetch.schedule';
import { BaseSchedulerService } from '../../common/services/base-scheduler.service';
import { NewsModule } from '../news/news.module';

/**
 * RSS Sources Module
 * Handles RSS feed source management
 * 
 * Features:
 * - CRUD operations for RSS sources
 * - Source reliability tracking
 * - Category-based filtering
 * - Active source management
 * - RSS feed parsing (RssParserService)
 * - Business logic for RSS fetching (RssFetchService)
 * - Scheduled RSS fetching (RssFetchSchedule)
 * 
 * Architecture:
 * - Controller → API endpoints
 * - Service → Business logic
 * - Schedule → Orchestration (registered with BaseScheduler)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      RssSourceSchema,
      SourceReliabilityScoreSchema,
    ]),
    NewsModule, // Import NewsModule for NewsService
  ],
  controllers: [RssSourcesController],
  providers: [
    RssSourcesService,
    RssParserService,
    RssFetchService,     // Business logic
    RssFetchSchedule,    // Schedule orchestration
  ],
  exports: [RssSourcesService, RssParserService, RssFetchService],
})
export class RssSourcesModule implements OnModuleInit {
  constructor(
    private readonly baseScheduler: BaseSchedulerService,
    private readonly rssFetchSchedule: RssFetchSchedule,
  ) {}

  /**
   * Register module schedules on initialization
   */
  async onModuleInit() {
    // Register RSS fetch schedule with base scheduler
    this.baseScheduler.registerTask(this.rssFetchSchedule);
  }
}

