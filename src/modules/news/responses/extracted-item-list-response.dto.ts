import { BaseListResponseDto } from '../../../common/base/base-dto';
import { AutoListResponse } from '../../../common/decorators/auto-response.decorator';
import { ExtractedItemResponseDto } from './extracted-item-response.dto';

/**
 * Response DTO for list of Extracted Items
 * Uses @AutoListResponse for proper Swagger schema generation
 */
@AutoListResponse(ExtractedItemResponseDto)
export class ExtractedItemListResponseDto extends BaseListResponseDto<ExtractedItemResponseDto> {}

