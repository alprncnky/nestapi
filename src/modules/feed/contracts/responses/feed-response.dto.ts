import { BaseResponseDto } from '../../../../common/base/base-dto';
import { AutoResponse } from '../../../../common/decorators/auto-response.decorator';
import { FeedTypeEnum } from '../enums/feed-type.enum';
import { FeedResponseMapping } from './mapping';

@AutoResponse(FeedResponseMapping)
export class FeedResponseDto extends BaseResponseDto {
  url: string;
  title: string;
  text?: string;
  source: string;
  feedType: FeedTypeEnum;
  fetchedAt: Date;
}

