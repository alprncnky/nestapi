import { BaseResponseDto } from '../../../../common/base/base-dto';
import { AutoResponse } from '../../../../common/decorators/auto-response.decorator';
import { ExtractedItemResponseMapping } from './mapping';

@AutoResponse(ExtractedItemResponseMapping)
export class ExtractedItemResponseDto extends BaseResponseDto {
  articleId: number;
  entityType: string;
  entityText: string;
  normalizedValue?: string;
  position?: number;
  confidence: number;
}
