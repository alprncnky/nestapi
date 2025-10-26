import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RssSourceSchema } from './schemas/rss-source.schema';
import { SourceReliabilityScoreSchema } from './schemas/source-reliability-score.schema';
import { RssSourcesController } from './controllers/rss-sources.controller';
import { RssSourcesService } from './services/rss-sources.service';
import { RssParserService } from './services/rss-parser.service';
import { RssFetchService } from './services/rss-fetch.service';
import { RssSourceRepository } from './repositories/rss-source.repository';
import { RssFetchSchedule } from './schedules/rss-fetch.schedule';
import { BaseSchedulerService } from '../../common/services/base-scheduler.service';
import { NewsModule } from '../news/news.module';

/**
 * RSS Sources Module
 * 
 * Clean Architecture Structure:
 * 
 * 1. API Layer (controllers/)
 *    - RssSourcesController: HTTP endpoints, request/response handling
 * 
 * 2. Business Layer (services/)
 *    - RssSourcesService: Main CRUD business logic & validation
 *    - RssFetchService: RSS feed processing business logic
 *    - RssParserService: RSS parsing utility service
 * 
 * 3. Data Layer (repositories/)
 *    - RssSourceRepository: Database operations, query building
 * 
 * 4. Domain Layer (entities/, enums/)
 *    - Entity definitions and domain enums
 * 
 * 5. Contracts (dto/, responses/)
 *    - Input DTOs and output Response DTOs
 * 
 * 6. Orchestration (schedules/)
 *    - RssFetchSchedule: Scheduled tasks orchestration
 * 
 * Similar to .NET structure:
 * - Controllers → API Layer
 * - Services → Business Layer
 * - Repositories → DataAccess Layer
 * - Entities → Domain Layer
 * - DTOs → Contracts
 */
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
    // Business Layer
    RssSourcesService,
    RssParserService,
    RssFetchService,
    
    // Data Layer
    RssSourceRepository,
    
    // Orchestration
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
   * Register module schedules on initialization
   */
  async onModuleInit() {
    // Register RSS fetch schedule with base scheduler
    this.baseScheduler.registerTask(this.rssFetchSchedule);
  }
}

