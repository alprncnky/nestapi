import { BaseResponseDto } from '../../../../common/base/base-dto';
import { AutoResponse } from '../../../../common/decorators/auto-response.decorator';
import { RetrospectiveAnalysisResponseMapping } from './mapping';

@AutoResponse(RetrospectiveAnalysisResponseMapping)
export class RetrospectiveAnalysisResponseDto extends BaseResponseDto {
  stockSymbol: string;
  movementPercent: number;
  analysisDate: Date;
  movementStartTime: Date;
  movementEndTime: Date;
  precedingNewsCount: number;
  existingPredictionsCount: number;
  missedOpportunity: boolean;
  missedReasons: string[];
  retrospectiveAccuracy: number;
}
