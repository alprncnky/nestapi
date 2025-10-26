import { BaseResponseDto } from '../../../common/base/base-dto';
import { AutoResponse } from '../../../common/decorators/auto-response.decorator';
import { ExtractedItemResponseMapping } from './mapping';

/**
 * Response DTO for Extracted Item (NER result)
 * Uses @AutoResponse for automatic entity-to-DTO mapping and Swagger documentation
 */
@AutoResponse(ExtractedItemResponseMapping)
export class ExtractedItemResponseDto extends BaseResponseDto {
  articleId: number;
  entityType: string;
  entityText: string;
  normalizedValue?: string;
  position?: number;
  confidence: number;
}

