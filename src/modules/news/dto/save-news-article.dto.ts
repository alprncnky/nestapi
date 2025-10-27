import { BaseDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';
import { NewsCategoryEnum } from '../enums/news-category.enum';
import { ImpactLevelEnum } from '../enums/impact-level.enum';
import { NewsStatusEnum } from '../enums/news-status.enum';
import { SaveNewsArticleMapping } from './mapping';

/**
 * DTO for saving (create or update) a news article
 * Uses @AutoApplyDecorators for automatic validation from centralized mapping
 * If id is provided, performs update; otherwise performs create
 * .NET-style upsert DTO
 */
@AutoApplyDecorators(SaveNewsArticleMapping)
export class SaveNewsArticleDto extends BaseDto {
  id?: number;
  sourceId: number;
  title: string;
  url: string;
  guid: string;
  summary?: string;
  content?: string;
  contentPlain?: string;
  publishedAt: Date;
  scrapedAt?: Date;
  imageUrl?: string;
  status?: NewsStatusEnum;
  isDuplicate?: boolean;
  category?: NewsCategoryEnum;
  sentimentScore?: number;
  impactLevel?: ImpactLevelEnum;
}

