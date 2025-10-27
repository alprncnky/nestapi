import { BaseListResponseDto } from '../../../../common/base/base-dto';
import { AutoListResponse } from '../../../../common/decorators/auto-response.decorator';
import { ExtractedItemResponseDto } from './extracted-item-response.dto';

@AutoListResponse(ExtractedItemResponseDto)
export class ExtractedItemListResponseDto extends BaseListResponseDto<ExtractedItemResponseDto> {}

