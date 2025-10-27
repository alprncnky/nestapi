import { BaseResponseDto } from '../../../../common/base/base-dto';
import { AutoResponse } from '../../../../common/decorators/auto-response.decorator';
import { NewsArticleResponseMapping } from './mapping';

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
