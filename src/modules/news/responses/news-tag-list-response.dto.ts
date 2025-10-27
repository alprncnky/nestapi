import { BaseListResponseDto } from '../../../common/base/base-dto';
import { AutoListResponse } from '../../../common/decorators/auto-response.decorator';
import { NewsTagResponseDto } from './news-tag-response.dto';

/**
 * Response DTO for list of News Tags
 * Uses @AutoListResponse for proper Swagger schema generation
 */
@AutoListResponse(NewsTagResponseDto)
export class NewsTagListResponseDto extends BaseListResponseDto<NewsTagResponseDto> {}

