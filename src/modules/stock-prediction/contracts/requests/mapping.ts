import { StringField, NumberField, EnumField, BooleanField } from '../../../../common/decorators/field.decorator';
import { PredictionImpactEnum } from '../enums/prediction-impact.enum';

export const CreatePredictionMapping = {
  articleId: () => NumberField('Article ID', 1, true, 1),
  stockSymbol: () => StringField('Stock symbol', 'AKBNK', true, 3, 10),
  predictedImpact: () => EnumField(PredictionImpactEnum, 'Predicted impact direction', PredictionImpactEnum.UP, true),
  predictedChangePercent: () => NumberField('Predicted change percentage', 5.5, true, -15, 15),
  predictionConfidence: () => NumberField('Prediction confidence (0-100)', 75, true, 0, 100),
  timeWindow: () => StringField('Time window for prediction', '1D', true, 2, 10),
  reasoning: () => StringField('Prediction reasoning', 'AI analysis based on sentiment', false, 10, 500),
};

export const RetrospectiveAnalysisMapping = {
  stockSymbol: () => StringField('Stock symbol', 'AKBNK', true, 3, 10),
  movementPercent: () => NumberField('Movement percentage', 8.5, true, -50, 50),
  analysisDate: () => StringField('Analysis date', '2024-01-01', true, 10, 10),
  movementStartTime: () => StringField('Movement start time', '2024-01-01T09:00:00Z', true, 20, 30),
  movementEndTime: () => StringField('Movement end time', '2024-01-01T17:00:00Z', true, 20, 30),
  precedingNewsCount: () => NumberField('Number of preceding news articles', 3, true, 0, 100),
  existingPredictionsCount: () => NumberField('Number of existing predictions', 1, true, 0, 50),
  missedOpportunity: () => BooleanField('Whether this was a missed opportunity', true, true),
  missedReasons: () => StringField('Reasons for missing the opportunity', '["No direct stock mentions"]', false, 10, 1000),
  retrospectiveAccuracy: () => NumberField('Retrospective accuracy score', 85.5, true, 0, 100),
};
