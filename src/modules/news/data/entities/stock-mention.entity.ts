import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';
import { NewsArticle } from './news-article.entity';
import { SentimentEnum } from '../../contracts/enums/sentiment.enum';

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
