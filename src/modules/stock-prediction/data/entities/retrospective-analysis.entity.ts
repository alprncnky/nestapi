import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';

@AutoEntity()
export class RetrospectiveAnalysis {
  id: number;
  stockSymbol: string;
  movementPercent: number;
  analysisDate: Date;
  movementStartTime: Date;
  movementEndTime: Date;
  precedingNewsCount: number;
  existingPredictionsCount: number;
  missedOpportunity: boolean;
  missedReasons: string; // JSON array of reasons
  retrospectiveAccuracy: number;
  analysisData: any; // JSON data containing full analysis
  createdAt: Date;
  updatedAt: Date;
}
