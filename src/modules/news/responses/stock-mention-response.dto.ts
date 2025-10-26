import { BaseResponseDto } from '../../../common/base/base-dto';
import { AutoResponse } from '../../../common/decorators/auto-response.decorator';
import { StockMentionResponseMapping } from './mapping';

/**
 * Response DTO for Stock Mention
 * Uses @AutoResponse for automatic entity-to-DTO mapping and Swagger documentation
 */
@AutoResponse(StockMentionResponseMapping)
export class StockMentionResponseDto extends BaseResponseDto {
  articleId: number;
  stockSymbol: string;
  stockName?: string;
  mentionCount: number;
  context?: string;
  sentiment?: string;
  sentimentScore?: number;
}

