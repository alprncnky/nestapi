import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RssSourceSchema } from './data/schemas/rss-source.schema';
import { SourceReliabilityScoreSchema } from './data/schemas/source-reliability-score.schema';
import { RssSourcesController } from './controllers/rss-sources.controller';
import { RssSourcesService } from './business/services/rss-sources.service';
import { RssParserService } from './business/services/rss-parser.service';
import { RssFetchService } from './business/services/rss-fetch.service';
import { RssSourceRepository } from './data/repositories/rss-source.repository';
import { RssFetchSchedule } from './business/orchestration/schedules/rss-fetch.schedule';
import { BaseSchedulerService } from '../../common/services/base-scheduler.service';
import { NewsModule } from '../news/news.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RssSourceSchema,
      SourceReliabilityScoreSchema,
    ]),
    NewsModule, // Import NewsModule for NewsService
  ],
  controllers: [
    RssSourcesController,
  ],
  providers: [
    RssSourcesService,
    RssParserService,
    RssFetchService,
    RssSourceRepository,
    RssFetchSchedule,
  ],
  exports: [
    RssSourcesService,
    RssParserService,
    RssFetchService,
    RssSourceRepository,
  ],
})
export class RssSourcesModule implements OnModuleInit {
  constructor(
    private readonly baseScheduler: BaseSchedulerService,
    private readonly rssFetchSchedule: RssFetchSchedule,
  ) {}

  /**
   * Register module schedules on initialization for Job
   */
  async onModuleInit() {
    // Register RSS fetch schedule with base scheduler
    this.baseScheduler.registerTask(this.rssFetchSchedule);
  }
}
