import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';

@AutoEntity()
export class DailyReport {
  id: number;
  reportDate: Date;
  reportData: any; // JSON data containing the full report
  totalArticles: number;
  totalPredictions: number;
  averageAccuracy: number;
  topGainers: string; // JSON array of top gainers
  topLosers: string; // JSON array of top losers
  insights: string; // JSON array of insights
  recommendations: string; // JSON array of recommendations
  createdAt: Date;
  updatedAt: Date;
}
