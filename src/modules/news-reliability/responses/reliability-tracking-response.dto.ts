import { BaseResponseDto } from '../../../common/base/base-dto';
import { AutoResponse } from '../../../common/decorators/auto-response.decorator';
import { ReliabilityTrackingResponseMapping } from './mapping';

/**
 * Response DTO for Reliability Tracking
 * Uses @AutoResponse for automatic entity-to-DTO mapping and Swagger documentation
 */
@AutoResponse(ReliabilityTrackingResponseMapping)
export class ReliabilityTrackingResponseDto extends BaseResponseDto {
  articleId: number;
  stockSymbol: string;
  predictedImpact?: string;
  predictedChangePercent?: number;
  predictionConfidence?: number;
  actualImpact?: string;
  actualChangePercent?: number;
  predictionAccuracy?: number;
  evaluationDate?: Date;
  timeWindow?: string;
}

