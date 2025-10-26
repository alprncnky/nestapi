import { AutoEntity } from '../../../common/decorators/auto-entity.decorator';
import { NewsArticle } from '../../news/entities/news-article.entity';
import { PredictionImpactEnum } from '../enums/prediction-impact.enum';

/**
 * News Reliability Tracking entity - Tracks prediction accuracy of news articles
 * TypeORM schema is defined in ./news-reliability-tracking.schema.ts
 */
@AutoEntity()
export class NewsReliabilityTracking {
  id: number;
  articleId: number;
  article: NewsArticle;
  stockSymbol: string;
  
  // Prediction
  predictedImpact: PredictionImpactEnum;
  predictedChangePercent: number;
  predictionConfidence: number;
  
  // Actual Result
  actualChangePercent: number;
  actualImpact: PredictionImpactEnum;
  
  // Evaluation
  predictionAccuracy: number;
  evaluationDate: Date;
  timeWindow: string;
  
  createdAt: Date;
  updatedAt: Date;
}
