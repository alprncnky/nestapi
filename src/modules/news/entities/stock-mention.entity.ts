import { AutoEntity } from '../../../common/decorators/auto-entity.decorator';
import { NewsArticle } from './news-article.entity';
import { SentimentEnum } from '../enums/sentiment.enum';

/**
 * Stock Mention entity - Tracks stock symbol mentions in news articles
 * TypeORM schema is defined in ./stock-mention.schema.ts
 */
@AutoEntity()
export class StockMention {
  id: number;
  articleId: number;
  article: NewsArticle;
  stockSymbol: string;
  stockName: string;
  mentionCount: number;
  context: string;
  sentiment: SentimentEnum;
  sentimentScore: number;
  createdAt: Date;
}
