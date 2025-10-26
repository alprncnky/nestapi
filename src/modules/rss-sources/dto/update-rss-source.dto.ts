import { BaseUpdateDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';
import { FeedTypeEnum } from '../enums/feed-type.enum';
import { SourceCategoryEnum } from '../enums/source-category.enum';
import { UpdateRssSourceMapping } from './mapping';

/**
 * DTO for updating an existing RSS source
 * Uses @AutoApplyDecorators for automatic validation from centralized mapping
 * All fields are optional for partial updates
 */
@AutoApplyDecorators(UpdateRssSourceMapping)
export class UpdateRssSourceDto extends BaseUpdateDto {
  name?: string;
  url?: string;
  feedType?: FeedTypeEnum;
  category?: SourceCategoryEnum;
  country?: string;
  fetchInterval?: number;
  isActive?: boolean;
  reliabilityScore?: number;
}

