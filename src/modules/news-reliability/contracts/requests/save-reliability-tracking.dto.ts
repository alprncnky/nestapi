import { BaseDto } from '../../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../../common/decorators/auto-apply.decorator';
import { PredictionImpactEnum } from '../enums/prediction-impact.enum';
import { SaveReliabilityTrackingMapping } from './mapping';

@AutoApplyDecorators(SaveReliabilityTrackingMapping)
export class SaveReliabilityTrackingDto extends BaseDto {
  id?: number;
  articleId: number;
  stockSymbol: string;
  predictedImpact?: PredictionImpactEnum;
  predictedChangePercent?: number;
  predictionConfidence?: number;
  timeWindow?: string;
  actualImpact?: PredictionImpactEnum;
  actualChangePercent?: number;
  predictionAccuracy?: number;
  evaluationDate?: Date;
}

