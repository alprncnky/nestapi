import { EntitySchema } from 'typeorm';
import { NewsReliabilityTracking } from '../entities/news-reliability-tracking.entity';
import { PredictionImpactEnum } from '../enums/prediction-impact.enum';

export const NewsReliabilityTrackingSchema = new EntitySchema<NewsReliabilityTracking>({
  name: 'NewsReliabilityTracking',
  target: NewsReliabilityTracking,
  tableName: 'news_reliability_tracking',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    articleId: {
      type: Number,
    },
    stockSymbol: {
      type: String,
      length: 10,
    },
    predictedImpact: {
      type: 'enum',
      enum: PredictionImpactEnum,
      nullable: true,
    },
    predictedChangePercent: {
      type: 'decimal',
      precision: 10,
      scale: 4,
      nullable: true,
    },
    predictionConfidence: {
      type: 'decimal',
      precision: 5,
      scale: 2,
      nullable: true,
      comment: '0 to 100',
    },
    actualChangePercent: {
      type: 'decimal',
      precision: 10,
      scale: 4,
      nullable: true,
    },
    actualImpact: {
      type: 'enum',
      enum: PredictionImpactEnum,
      nullable: true,
    },
    predictionAccuracy: {
      type: 'decimal',
      precision: 5,
      scale: 2,
      nullable: true,
      comment: '0 to 100',
    },
    evaluationDate: {
      type: 'timestamp',
      nullable: true,
    },
    timeWindow: {
      type: String,
      length: 10,
      nullable: true,
      comment: 'e.g., 1H, 4H, 1D, 1W',
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,
    },
  },
  relations: {
    article: {
      type: 'many-to-one',
      target: 'NewsArticle',
      joinColumn: {
        name: 'articleId',
      },
      onDelete: 'CASCADE',
    },
  },
  indices: [
    {
      columns: ['stockSymbol'],
    },
  ],
});

