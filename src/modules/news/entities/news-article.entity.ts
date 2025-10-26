import { AutoEntity } from '../../../common/decorators/auto-entity.decorator';
import { RssSource } from '../../rss-sources/entities/rss-source.entity';
import { NewsStatusEnum } from '../enums/news-status.enum';
import { NewsCategoryEnum } from '../enums/news-category.enum';
import { ImpactLevelEnum } from '../enums/impact-level.enum';

/**
 * News Article entity - Core news content
 * TypeORM schema is defined in ./news-article.schema.ts
 */
@AutoEntity()
export class NewsArticle {
  id: number;
  sourceId: number;
  source: RssSource;
  
  // Basic Information
  title: string;
  url: string;
  guid: string;
  
  // Content
  summary: string;
  content: string;
  contentPlain: string;
  
  // Timestamps
  publishedAt: Date;
  scrapedAt: Date;
  
  // Media
  imageUrl: string;
  imageType: string;
  
  // Categorization
  mainCategory: NewsCategoryEnum;
  subCategory: string;
  
  // Analysis Results
  sentimentScore: number;
  relevanceScore: number;
  impactLevel: ImpactLevelEnum;
  
  // Status
  status: NewsStatusEnum;
  isDuplicate: boolean;
  masterArticleId: number;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  articleTags: any[];
  stockMentions: any[];
  extractedEntities: any[];
}
