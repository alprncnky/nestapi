import { BaseDto } from '../../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../../common/decorators/auto-apply.decorator';
import { FeedTypeEnum } from '../enums/feed-type.enum';
import { SourceCategoryEnum } from '../enums/source-category.enum';
import { SaveRssSourceMapping } from './mapping';

/**
 * DTO for saving (create or update) an RSS source
 * Uses @AutoApplyDecorators for automatic validation from centralized mapping
 * If id is provided, performs update; otherwise performs create
 * .NET-style upsert DTO
 */
@AutoApplyDecorators(SaveRssSourceMapping)
export class SaveRssSourceDto extends BaseDto {
  id?: number;
  name: string;
  url: string;
  feedType: FeedTypeEnum;
  category: SourceCategoryEnum;
  country: string;
  fetchInterval: number;
  isActive?: boolean;
  reliabilityScore?: number;
}

