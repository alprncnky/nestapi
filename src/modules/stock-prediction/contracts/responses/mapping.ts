import { ResponseFieldConfig } from '../../../../common/interfaces/response-field-config.interface';
import { PredictionImpactEnum } from '../enums/prediction-impact.enum';

export const PredictionResponseMapping: Record<string, ResponseFieldConfig> = {
  articleId: { description: 'Article ID', example: 123, required: true, type: Number },
  stockSymbol: { description: 'Stock symbol', example: 'AKBNK', required: true, type: String },
  predictedImpact: { description: 'Predicted impact direction', example: 'UP', required: true, enum: PredictionImpactEnum },
  predictedChangePercent: { description: 'Predicted change percentage', example: 5.5, required: true, type: Number },
  predictionConfidence: { description: 'Prediction confidence (0-100)', example: 75, required: true, type: Number },
  timeWindow: { description: 'Time window for prediction', example: '1D', required: true, type: String },
  reasoning: { description: 'Prediction reasoning', example: 'AI analysis based on sentiment', required: false, type: String },
  actualImpact: { description: 'Actual impact direction', example: 'UP', required: false, enum: PredictionImpactEnum },
  actualChangePercent: { description: 'Actual change percentage', example: 6.2, required: false, type: Number },
  predictionAccuracy: { description: 'Prediction accuracy score', example: 85.5, required: false, type: Number },
};

export const DailyReportResponseMapping: Record<string, ResponseFieldConfig> = {
  reportDate: { description: 'Report date', example: '2024-01-01', required: true, type: Date },
  totalArticles: { description: 'Total articles processed', example: 150, required: true, type: Number },
  totalPredictions: { description: 'Total predictions made', example: 45, required: true, type: Number },
  averageAccuracy: { description: 'Average prediction accuracy', example: 78.5, required: true, type: Number },
  topGainers: { description: 'Top gaining stocks', example: '[{"symbol": "AKBNK", "changePercent": 8.5}]', required: true, type: Array },
  topLosers: { description: 'Top losing stocks', example: '[{"symbol": "THYAO", "changePercent": -5.2}]', required: true, type: Array },
  insights: { description: 'Generated insights', example: '["Pozitif sentiment hakim"]', required: true, type: Array },
  recommendations: { description: 'System recommendations', example: '["COMPANY_NEWS kategorisi için güvenilir tahminler"]', required: true, type: Array },
};

export const RetrospectiveAnalysisResponseMapping: Record<string, ResponseFieldConfig> = {
  stockSymbol: { description: 'Stock symbol', example: 'AKBNK', required: true, type: String },
  movementPercent: { description: 'Movement percentage', example: 8.5, required: true, type: Number },
  analysisDate: { description: 'Analysis date', example: '2024-01-01', required: true, type: Date },
  movementStartTime: { description: 'Movement start time', example: '2024-01-01T09:00:00Z', required: true, type: Date },
  movementEndTime: { description: 'Movement end time', example: '2024-01-01T17:00:00Z', required: true, type: Date },
  precedingNewsCount: { description: 'Number of preceding news articles', example: 3, required: true, type: Number },
  existingPredictionsCount: { description: 'Number of existing predictions', example: 1, required: true, type: Number },
  missedOpportunity: { description: 'Whether this was a missed opportunity', example: true, required: true, type: Boolean },
  missedReasons: { description: 'Reasons for missing the opportunity', example: '["No direct stock mentions"]', required: true, type: Array },
  retrospectiveAccuracy: { description: 'Retrospective accuracy score', example: 85.5, required: true, type: Number },
};
