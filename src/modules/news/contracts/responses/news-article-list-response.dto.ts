import { BaseListResponseDto } from '../../../../common/base/base-dto';
import { AutoListResponse } from '../../../../common/decorators/auto-response.decorator';
import { NewsArticleResponseDto } from './news-article-response.dto';

@AutoListResponse(NewsArticleResponseDto)
export class NewsArticleListResponseDto extends BaseListResponseDto<NewsArticleResponseDto> {}

