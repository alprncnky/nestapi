import { EntitySchema } from 'typeorm';
import { StockMention } from '../entities/stock-mention.entity';
import { SentimentEnum } from '../../contracts/enums/sentiment.enum';

export const StockMentionSchema = new EntitySchema<StockMention>({
  name: 'StockMention',
  target: StockMention,
  tableName: 'stock_mentions',
  columns: {
    id: { type: Number, primary: true, generated: true },
    articleId: { type: Number },
    stockSymbol: { type: String, length: 10 },
    stockName: { type: String, length: 255, nullable: true },
    mentionCount: { type: Number, default: 1 },
    context: { type: 'text', nullable: true },
    sentiment: { type: 'enum', enum: SentimentEnum, default: SentimentEnum.NEUTRAL },
    sentimentScore: { type: 'decimal', precision: 3, scale: 2, nullable: true, comment: '-1 to +1' },
    createdAt: { type: 'timestamp', createDate: true },
  },
  relations: {
    article: { type: 'many-to-one', target: 'NewsArticle', joinColumn: { name: 'articleId' }, onDelete: 'CASCADE' },
  },
  indices: [
    { columns: ['stockSymbol'] },
  ],
});
