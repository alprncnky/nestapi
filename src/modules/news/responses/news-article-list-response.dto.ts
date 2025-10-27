import { BaseListResponseDto } from '../../../common/base/base-dto';
import { AutoListResponse } from '../../../common/decorators/auto-response.decorator';
import { NewsArticleResponseDto } from './news-article-response.dto';

/**
 * Response DTO for list of News Articles
 * Uses @AutoListResponse for proper Swagger schema generation
 */
@AutoListResponse(NewsArticleResponseDto)
export class NewsArticleListResponseDto extends BaseListResponseDto<NewsArticleResponseDto> {}

