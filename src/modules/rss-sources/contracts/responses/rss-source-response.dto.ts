import { BaseResponseDto } from '../../../../common/base/base-dto';
import { AutoResponse } from '../../../../common/decorators/auto-response.decorator';
import { RssSourceResponseMapping } from './mapping';

/**
 * Response DTO for RSS Source
 * Uses @AutoResponse for automatic entity-to-DTO mapping and Swagger documentation
 */
@AutoResponse(RssSourceResponseMapping)
export class RssSourceResponseDto extends BaseResponseDto {
  name: string;
  url: string;
  feedType: string;
  category: string;
  country: string;
  reliabilityScore: number;
  isActive: boolean;
  fetchInterval: number;
  lastFetchedAt?: Date;
}

