import { BaseCreateDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';
import { NewsCategoryEnum } from '../enums/news-category.enum';
import { ImpactLevelEnum } from '../enums/impact-level.enum';
import { CreateNewsArticleMapping } from './mapping';

/**
 * DTO for creating a new news article
 * Uses @AutoApplyDecorators for automatic validation from centralized mapping
 */
@AutoApplyDecorators(CreateNewsArticleMapping)
export class CreateNewsArticleDto extends BaseCreateDto {
  sourceId: number;
  title: string;
  url: string;
  guid: string;
  summary?: string;
  content?: string;
  publishedAt: Date;
  imageUrl?: string;
  category?: NewsCategoryEnum;
  impactLevel?: ImpactLevelEnum;
}

