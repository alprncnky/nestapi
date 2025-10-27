import { StringField, NumberField, EnumField } from '../../../../common/decorators/field.decorator';
import { PredictionImpactEnum } from '../enums/prediction-impact.enum';

/**
 * Field mappings for News Reliability Tracking DTOs
 * Centralized validation and Swagger documentation configuration
 */

export const CreateReliabilityTrackingMapping = {
  articleId: () => NumberField('Article ID', 1, true, 1),
  stockSymbol: () => StringField('Stock symbol', 'AAPL', true, 1, 10),
  predictedImpact: () => EnumField(PredictionImpactEnum, 'Predicted impact', PredictionImpactEnum.UP, false),
  predictedChangePercent: () => NumberField('Predicted change percentage', 2.5, false, -100, 100),
  predictionConfidence: () => NumberField('Prediction confidence (0-100)', 85.5, false, 0, 100),
  timeWindow: () => StringField('Time window (e.g., 1H, 4H, 1D)', '1D', false, 2, 10),
};

export const UpdateReliabilityTrackingMapping = {
  actualImpact: () => EnumField(PredictionImpactEnum, 'Actual impact', PredictionImpactEnum.UP, false),
  actualChangePercent: () => NumberField('Actual change percentage', 3.2, false, -100, 100),
  predictionAccuracy: () => NumberField('Prediction accuracy (0-100)', 92.5, false, 0, 100),
  evaluationDate: () => StringField('Evaluation date', '2024-01-02T00:00:00Z', false),
};

export const SaveReliabilityTrackingMapping = {
  id: () => NumberField('Reliability tracking ID (optional, for updates)', 1, false),
  articleId: () => NumberField('Article ID', 1, true, 1),
  stockSymbol: () => StringField('Stock symbol', 'AAPL', true, 1, 10),
  predictedImpact: () => EnumField(PredictionImpactEnum, 'Predicted impact', PredictionImpactEnum.UP, false),
  predictedChangePercent: () => NumberField('Predicted change percentage', 2.5, false, -100, 100),
  predictionConfidence: () => NumberField('Prediction confidence (0-100)', 85.5, false, 0, 100),
  timeWindow: () => StringField('Time window (e.g., 1H, 4H, 1D)', '1D', false, 2, 10),
  actualImpact: () => EnumField(PredictionImpactEnum, 'Actual impact', PredictionImpactEnum.UP, false),
  actualChangePercent: () => NumberField('Actual change percentage', 3.2, false, -100, 100),
  predictionAccuracy: () => NumberField('Prediction accuracy (0-100)', 92.5, false, 0, 100),
  evaluationDate: () => StringField('Evaluation date', '2024-01-02T00:00:00Z', false),
};

