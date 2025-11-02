import { BaseListResponseDto } from '../../../../common/base/base-dto';
import { AutoListResponse } from '../../../../common/decorators/auto-response.decorator';
import { FeedResponseDto } from './feed-response.dto';

@AutoListResponse(FeedResponseDto)
export class FeedListResponseDto extends BaseListResponseDto<FeedResponseDto> {}

