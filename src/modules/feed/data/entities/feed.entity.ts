import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';
import { FeedTypeEnum } from '../../contracts/enums/feed-type.enum';

@AutoEntity()
export class Feed {
  id: number;
  url: string;
  title: string;
  text: string;
  source: string;
  feedType: FeedTypeEnum;
  fetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

