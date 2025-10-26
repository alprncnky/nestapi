import { ResponseFieldConfig } from '../../../common/decorators/auto-response.decorator';
import { PredictionImpactEnum } from '../enums/prediction-impact.enum';

/**
 * Response field mappings for News Reliability Tracking responses
 * Centralized Swagger documentation configuration
 */

export const ReliabilityTrackingResponseMapping: Record<string, ResponseFieldConfig> = {
  articleId: {
    description: 'Article ID',
    example: 1,
    required: true,
    type: Number,
  },
  stockSymbol: {
    description: 'Stock symbol',
    example: 'AAPL',
    required: true,
    type: String,
  },
  predictedImpact: {
    description: 'Predicted impact direction',
    example: 'UP',
    required: false,
    enum: PredictionImpactEnum,
  },
  predictedChangePercent: {
    description: 'Predicted change percentage',
    example: 2.5,
    required: false,
    type: Number,
  },
  predictionConfidence: {
    description: 'Prediction confidence score (0-100)',
    example: 85.5,
    required: false,
    type: Number,
  },
  actualImpact: {
    description: 'Actual impact direction',
    example: 'UP',
    required: false,
    enum: PredictionImpactEnum,
  },
  actualChangePercent: {
    description: 'Actual change percentage',
    example: 3.2,
    required: false,
    type: Number,
  },
  predictionAccuracy: {
    description: 'Prediction accuracy score (0-100)',
    example: 92.5,
    required: false,
    type: Number,
  },
  evaluationDate: {
    description: 'Date when actual impact was evaluated',
    example: '2024-01-02T00:00:00Z',
    required: false,
    type: Date,
  },
  timeWindow: {
    description: 'Time window for prediction (e.g., 1H, 4H, 1D, 1W)',
    example: '1D',
    required: false,
    type: String,
  },
};

