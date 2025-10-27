import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';
import { FeedTypeEnum } from '../../contracts/enums/feed-type.enum';
import { SourceCategoryEnum } from '../../contracts/enums/source-category.enum';

@AutoEntity()
export class RssSource {
  id: number;
  name: string;
  url: string;
  feedType: FeedTypeEnum;
  category: SourceCategoryEnum;
  country: string;
  reliabilityScore: number;
  isActive: boolean;
  fetchInterval: number;
  lastFetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

