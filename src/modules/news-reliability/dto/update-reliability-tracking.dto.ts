import { BaseUpdateDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';
import { PredictionImpactEnum } from '../enums/prediction-impact.enum';
import { UpdateReliabilityTrackingMapping } from './mapping';

/**
 * DTO for updating a reliability tracking record
 * Used to record actual outcomes and calculate accuracy
 */
@AutoApplyDecorators(UpdateReliabilityTrackingMapping)
export class UpdateReliabilityTrackingDto extends BaseUpdateDto {
  actualImpact?: PredictionImpactEnum;
  actualChangePercent?: number;
  predictionAccuracy?: number;
  evaluationDate?: Date;
}

