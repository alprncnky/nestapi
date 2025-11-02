import { BaseDto } from '../../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../../common/decorators/auto-apply.decorator';
import { FeedTypeEnum } from '../enums/feed-type.enum';
import { SaveFeedMapping } from './mapping';

@AutoApplyDecorators(SaveFeedMapping)
export class SaveFeedDto extends BaseDto {
  id?: number;
  url: string;
  title: string;
  text?: string;
  source: string;
  feedType: FeedTypeEnum;
}

