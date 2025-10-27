import { EntitySchema } from 'typeorm';
import { NewsArticle } from '../entities/news-article.entity';
import { NewsStatusEnum } from '../../contracts/enums/news-status.enum';
import { NewsCategoryEnum } from '../../contracts/enums/news-category.enum';
import { ImpactLevelEnum } from '../../contracts/enums/impact-level.enum';

export const NewsArticleSchema = new EntitySchema<NewsArticle>({
  name: 'NewsArticle',
  target: NewsArticle,
  tableName: 'news_articles',
  columns: {
    id: { type: Number, primary: true, generated: true },
    sourceId: { type: Number },
    title: { type: String, length: 500 },
    url: { type: String, unique: true },
    guid: { type: String, length: 255, unique: true },
    summary: { type: 'text', nullable: true },
    content: { type: 'text', nullable: true },
    contentPlain: { type: 'text', nullable: true },
    publishedAt: { type: 'timestamp' },
    scrapedAt: { type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' },
    imageUrl: { type: 'text', nullable: true },
    imageType: { type: String, length: 100, nullable: true },
    mainCategory: { type: 'enum', enum: NewsCategoryEnum, nullable: true },
    subCategory: { type: String, length: 100, nullable: true },
    sentimentScore: { type: 'decimal', precision: 3, scale: 2, nullable: true, comment: '-1 to +1' },
    relevanceScore: { type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '0 to 100' },
    impactLevel: { type: 'enum', enum: ImpactLevelEnum, nullable: true },
    status: { type: 'enum', enum: NewsStatusEnum, default: NewsStatusEnum.PENDING },
    isDuplicate: { type: Boolean, default: false },
    masterArticleId: { type: Number, nullable: true, comment: 'Reference to master article if duplicate' },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    source: { type: 'many-to-one', target: 'RssSource', joinColumn: { name: 'sourceId' } },
    articleTags: { type: 'one-to-many', target: 'NewsArticleTag', inverseSide: 'article' },
    stockMentions: { type: 'one-to-many', target: 'StockMention', inverseSide: 'article' },
    extractedEntities: { type: 'one-to-many', target: 'ExtractedItem', inverseSide: 'article' },
  },
  indices: [
    { columns: ['url'] },
    { columns: ['guid'] },
    { columns: ['publishedAt'] },
    { columns: ['status'] },
  ],
});
