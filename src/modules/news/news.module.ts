import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsArticleSchema } from './schemas/news-article.schema';
import { NewsTagSchema } from './schemas/news-tag.schema';
import { NewsArticleTagSchema } from './schemas/news-article-tag.schema';
import { StockMentionSchema } from './schemas/stock-mention.schema';
import { ExtractedItemSchema } from './schemas/extracted-item.schema';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsTagsService } from './news-tags.service';
import { StockMentionsService } from './stock-mentions.service';
import { ExtractedItemsService } from './extracted-items.service';

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
    NewsService,
    NewsTagsService,
    StockMentionsService,
    ExtractedItemsService,
  ],
  exports: [
    NewsService,
    NewsTagsService,
    StockMentionsService,
    ExtractedItemsService,
  ], // Export for use in other modules (AI/NLP processing, RSS Parser, etc.)
})
export class NewsModule {}

