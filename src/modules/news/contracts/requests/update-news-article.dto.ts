import { BaseUpdateDto } from '../../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../../common/decorators/auto-apply.decorator';
import { NewsCategoryEnum } from '../enums/news-category.enum';
import { ImpactLevelEnum } from '../enums/impact-level.enum';
import { NewsStatusEnum } from '../enums/news-status.enum';
import { UpdateNewsArticleMapping } from './mapping';

@AutoApplyDecorators(UpdateNewsArticleMapping)
export class UpdateNewsArticleDto extends BaseUpdateDto {
  title?: string;
  summary?: string;
  content?: string;
  category?: NewsCategoryEnum;
  sentimentScore?: number;
  impactLevel?: ImpactLevelEnum;
  status?: NewsStatusEnum;
}

