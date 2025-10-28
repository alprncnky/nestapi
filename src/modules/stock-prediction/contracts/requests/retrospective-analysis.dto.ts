import { BaseDto } from '../../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../../common/decorators/auto-apply.decorator';
import { RetrospectiveAnalysisMapping } from './mapping';

@AutoApplyDecorators(RetrospectiveAnalysisMapping)
export class RetrospectiveAnalysisDto extends BaseDto {
  stockSymbol: string;
  movementPercent: number;
  analysisDate: Date;
  movementStartTime: Date;
  movementEndTime: Date;
  precedingNewsCount: number;
  existingPredictionsCount: number;
  missedOpportunity: boolean;
  missedReasons?: string[];
  retrospectiveAccuracy: number;
}
