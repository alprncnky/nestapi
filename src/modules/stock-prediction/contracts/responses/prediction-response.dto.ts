import { BaseResponseDto } from '../../../../common/base/base-dto';
import { AutoResponse } from '../../../../common/decorators/auto-response.decorator';
import { PredictionResponseMapping } from './mapping';

@AutoResponse(PredictionResponseMapping)
export class PredictionResponseDto extends BaseResponseDto {
  articleId: number;
  stockSymbol: string;
  predictedImpact: string;
  predictedChangePercent: number;
  predictionConfidence: number;
  timeWindow: string;
  reasoning?: string;
  actualImpact?: string;
  actualChangePercent?: number;
  predictionAccuracy?: number;
}
