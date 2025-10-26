import { BaseResponseDto } from '../../../common/base/base-dto';
import { AutoResponse } from '../../../common/decorators/auto-response.decorator';
import { NewsArticleResponseMapping } from './mapping';

/**
 * Response DTO for News Article
 * Uses @AutoResponse for automatic entity-to-DTO mapping and Swagger documentation
 */
@AutoResponse(NewsArticleResponseMapping)
export class NewsArticleResponseDto extends BaseResponseDto {
  sourceId: number;
  title: string;
  url: string;
  guid: string;
  summary?: string;
  content?: string;
  publishedAt: Date;
  imageUrl?: string;
  category?: string;
  sentimentScore?: number;
  impactLevel?: string;
  status: string;
}

