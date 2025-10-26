import { BaseResponseDto } from '../../../common/base/base-dto';
import { AutoResponse } from '../../../common/decorators/auto-response.decorator';
import { NewsTagResponseMapping } from './mapping';

/**
 * Response DTO for News Tag
 * Uses @AutoResponse for automatic entity-to-DTO mapping and Swagger documentation
 */
@AutoResponse(NewsTagResponseMapping)
export class NewsTagResponseDto extends BaseResponseDto {
  name: string;
  type: string;
  description?: string;
  usageCount: number;
}

