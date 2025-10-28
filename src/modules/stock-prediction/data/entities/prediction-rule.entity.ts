import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';

@AutoEntity()
export class PredictionRule {
  id: number;
  ruleType: string; // 'CATEGORY', 'SENTIMENT', 'IMPACT_LEVEL', 'SOURCE'
  ruleValue: string; // 'COMPANY_NEWS', 'POSITIVE', 'HIGH', etc.
  totalPredictions: number;
  averageAccuracy: number;
  averageChangePercent: number;
  successRate: number;
  successfulPredictions: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}
