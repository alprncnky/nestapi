import { BaseResponseDto } from '../../../../common/base/base-dto';
import { AutoResponse } from '../../../../common/decorators/auto-response.decorator';
import { ReliabilityTrackingResponseMapping } from './mapping';

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
