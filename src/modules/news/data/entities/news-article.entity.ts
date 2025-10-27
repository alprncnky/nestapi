import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';
import { RssSource } from '../../../rss-sources/data/entities/rss-source.entity';
import { NewsStatusEnum } from '../../contracts/enums/news-status.enum';
import { NewsCategoryEnum } from '../../contracts/enums/news-category.enum';
import { ImpactLevelEnum } from '../../contracts/enums/impact-level.enum';

@AutoEntity()
export class NewsArticle {
  id: number;
  sourceId: number;
  source: RssSource;
  title: string;
  url: string;
  guid: string;
  summary: string;
  content: string;
  contentPlain: string;
  publishedAt: Date;
  scrapedAt: Date;
  imageUrl: string;
  imageType: string;
  mainCategory: NewsCategoryEnum;
  subCategory: string;
  sentimentScore: number;
  relevanceScore: number;
  impactLevel: ImpactLevelEnum;
  status: NewsStatusEnum;
  isDuplicate: boolean;
  masterArticleId: number;
  createdAt: Date;
  updatedAt: Date;
  articleTags: any[];
  stockMentions: any[];
  extractedEntities: any[];
}
