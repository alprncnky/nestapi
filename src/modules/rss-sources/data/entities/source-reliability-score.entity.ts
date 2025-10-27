import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';
import { RssSource } from './rss-source.entity';

@AutoEntity()
export class SourceReliabilityScore {
  id: number;
  sourceId: number;
  source: RssSource;
  evaluationPeriod: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracyRate: number;
  averageConfidence: number;
  companyNewsAccuracy: number;
  macroNewsAccuracy: number;
  calculatedAt: Date;
  createdAt: Date;
}

