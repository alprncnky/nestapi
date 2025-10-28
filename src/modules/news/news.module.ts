import { Module } from '@nestjs/common';
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
import { NewsArticleRepository } from './data/repositories/news-article.repository';

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
  ],
  controllers: [NewsController],
  providers: [
    NewsArticleRepository,
    StockMentionsService,
    ExtractedItemsService,
    NewsTagsService,
    NewsService,
  ],
  exports: [
    NewsService,
    NewsTagsService,
    StockMentionsService,
    ExtractedItemsService,
  ], // Export for use in other modules (AI/NLP processing, RSS Parser, etc.)
})
export class NewsModule {}
