import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';
import { NewsArticle } from '../../../news/data/entities/news-article.entity';
import { PredictionImpactEnum } from '../../contracts/enums/prediction-impact.enum';

@AutoEntity()
export class NewsReliabilityTracking {
  id: number;
  articleId: number;
  article: NewsArticle;
  stockSymbol: string;
  predictedImpact: PredictionImpactEnum;
  predictedChangePercent: number;
  predictionConfidence: number;
  actualChangePercent: number;
  actualImpact: PredictionImpactEnum;
  predictionAccuracy: number;
  evaluationDate: Date;
  timeWindow: string;
  createdAt: Date;
  updatedAt: Date;
}

