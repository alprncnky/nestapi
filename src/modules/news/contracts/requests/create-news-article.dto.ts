import { BaseCreateDto } from '../../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../../common/decorators/auto-apply.decorator';
import { NewsCategoryEnum } from '../enums/news-category.enum';
import { ImpactLevelEnum } from '../enums/impact-level.enum';
import { CreateNewsArticleMapping } from './mapping';

@AutoApplyDecorators(CreateNewsArticleMapping)
export class CreateNewsArticleDto extends BaseCreateDto {
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
  status?: string;
  isDuplicate?: boolean;
  category?: NewsCategoryEnum;
  impactLevel?: ImpactLevelEnum;
}

