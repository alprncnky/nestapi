import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';
import { FeedTypeEnum } from '../../contracts/enums/feed-type.enum';
import { SourceCategoryEnum } from '../../contracts/enums/source-category.enum';

/**
 * RSS Source entity - Represents an RSS feed source
 * TypeORM schema is defined in ../schemas/rss-source.schema.ts
 */
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

