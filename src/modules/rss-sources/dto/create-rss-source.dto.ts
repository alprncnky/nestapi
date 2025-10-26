import { BaseCreateDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';
import { FeedTypeEnum } from '../enums/feed-type.enum';
import { SourceCategoryEnum } from '../enums/source-category.enum';
import { CreateRssSourceMapping } from './mapping';

/**
 * DTO for creating a new RSS source
 * Uses @AutoApplyDecorators for automatic validation from centralized mapping
 */
@AutoApplyDecorators(CreateRssSourceMapping)
export class CreateRssSourceDto extends BaseCreateDto {
  name: string;
  url: string;
  feedType: FeedTypeEnum;
  category: SourceCategoryEnum;
  country: string;
  fetchInterval: number;
  isActive?: boolean;
}

