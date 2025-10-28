import { BaseDto } from '../../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../../common/decorators/auto-apply.decorator';
import { CreatePredictionMapping } from './mapping';

@AutoApplyDecorators(CreatePredictionMapping)
export class CreatePredictionDto extends BaseDto {
  articleId: number;
  stockSymbol: string;
  predictedImpact: string;
  predictedChangePercent: number;
  predictionConfidence: number;
  timeWindow: string;
  reasoning?: string;
}
