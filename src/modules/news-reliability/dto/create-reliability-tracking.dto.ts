import { BaseCreateDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';
import { PredictionImpactEnum } from '../enums/prediction-impact.enum';
import { CreateReliabilityTrackingMapping } from './mapping';

/**
 * DTO for creating a new reliability tracking record
 * Uses @AutoApplyDecorators for automatic validation from centralized mapping
 */
@AutoApplyDecorators(CreateReliabilityTrackingMapping)
export class CreateReliabilityTrackingDto extends BaseCreateDto {
  articleId: number;
  stockSymbol: string;
  predictedImpact?: PredictionImpactEnum;
  predictedChangePercent?: number;
  predictionConfidence?: number;
  timeWindow?: string;
}

