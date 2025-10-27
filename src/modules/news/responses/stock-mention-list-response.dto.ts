import { BaseListResponseDto } from '../../../common/base/base-dto';
import { AutoListResponse } from '../../../common/decorators/auto-response.decorator';
import { StockMentionResponseDto } from './stock-mention-response.dto';

/**
 * Response DTO for list of Stock Mentions
 * Uses @AutoListResponse for proper Swagger schema generation
 */
@AutoListResponse(StockMentionResponseDto)
export class StockMentionListResponseDto extends BaseListResponseDto<StockMentionResponseDto> {}

