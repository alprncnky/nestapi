import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsArticleSchema } from './data/schemas/news-article.schema';
import { NewsTagSchema } from './data/schemas/news-tag.schema';
import { NewsArticleTagSchema } from './data/schemas/news-article-tag.schema';
import { StockMentionSchema } from './data/schemas/stock-mention.schema';
import { ExtractedItemSchema } from './data/schemas/extracted-item.schema';
import { NewsController } from './controllers/news.controller';
import { NewsService } from './business/services/news.service';
import { NewsTagsService } from './business/services/news-tags.service';
import { StockMentionsService } from './business/services/stock-mentions.service';
import { ExtractedItemsService } from './business/services/extracted-items.service';
import { ArticleProcessorService } from './business/services/article-processor.service';
import { ArticleProcessorSchedule } from './business/orchestration/schedules/article-processor.schedule';
import { NewsArticleRepository } from './data/repositories/news-article.repository';
import { StockPredictionModule } from '../stock-prediction/stock-prediction.module';
import { BaseSchedulerService } from '../../common/services/base-scheduler.service';

/**
 * News Module
 * Handles news articles, tags, stock mentions, and extracted entities
 * 
 * Features:
 * - News article CRUD operations
 * - Tag management and article-tag associations
 * - Stock mention tracking
 * - Named Entity Recognition (NER) results storage
 * - Sentiment analysis integration
 * - Category-based filtering
 * - Article processing with AI/NLP
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      NewsArticleSchema,
      NewsTagSchema,
      NewsArticleTagSchema,
      StockMentionSchema,
      ExtractedItemSchema,
    ]),
    forwardRef(() => StockPredictionModule), // Import for OpenAIService
  ],
  controllers: [NewsController],
  providers: [
    NewsArticleRepository,
    StockMentionsService,
    ExtractedItemsService,
    NewsTagsService,
    NewsService,
    ArticleProcessorService,
    ArticleProcessorSchedule,
  ],
  exports: [
    NewsService,
    NewsTagsService,
    StockMentionsService,
    ExtractedItemsService,
  ], // Export for use in other modules (AI/NLP processing, RSS Parser, etc.)
})
export class NewsModule implements OnModuleInit {
  constructor(
    private readonly baseScheduler: BaseSchedulerService,
    private readonly articleProcessorSchedule: ArticleProcessorSchedule,
  ) {}

  /**
   * Register module schedules on initialization
   */
  async onModuleInit() {
    // Register article processor schedule with base scheduler
    this.baseScheduler.registerTask(this.articleProcessorSchedule);
  }
}
