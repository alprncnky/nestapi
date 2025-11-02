import { BaseListResponseDto } from '../../../../common/base/base-dto';
import { AutoListResponse } from '../../../../common/decorators/auto-response.decorator';
import { StockResponseDto } from './stock-response.dto';

@AutoListResponse(StockResponseDto)
export class StockListResponseDto extends BaseListResponseDto<StockResponseDto> {}

