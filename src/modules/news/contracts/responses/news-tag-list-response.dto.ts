import { BaseListResponseDto } from '../../../../common/base/base-dto';
import { AutoListResponse } from '../../../../common/decorators/auto-response.decorator';
import { NewsTagResponseDto } from './news-tag-response.dto';

@AutoListResponse(NewsTagResponseDto)
export class NewsTagListResponseDto extends BaseListResponseDto<NewsTagResponseDto> {}

