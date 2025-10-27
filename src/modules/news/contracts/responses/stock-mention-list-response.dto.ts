import { BaseListResponseDto } from '../../../../common/base/base-dto';
import { AutoListResponse } from '../../../../common/decorators/auto-response.decorator';
import { StockMentionResponseDto } from './stock-mention-response.dto';

@AutoListResponse(StockMentionResponseDto)
export class StockMentionListResponseDto extends BaseListResponseDto<StockMentionResponseDto> {}

