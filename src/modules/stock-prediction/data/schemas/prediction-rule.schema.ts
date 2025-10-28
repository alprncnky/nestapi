import { EntitySchema } from 'typeorm';
import { PredictionRule } from '../entities/prediction-rule.entity';

export const PredictionRuleSchema = new EntitySchema<PredictionRule>({
  name: 'PredictionRule',
  target: PredictionRule,
  tableName: 'prediction_rules',
  columns: {
    id: { type: Number, primary: true, generated: true },
    ruleType: { type: String, length: 50 },
    ruleValue: { type: String, length: 255 },
    totalPredictions: { type: Number, default: 0 },
    averageAccuracy: { type: 'decimal', precision: 5, scale: 2, default: 0 },
    averageChangePercent: { type: 'decimal', precision: 8, scale: 4, default: 0 },
    successRate: { type: 'decimal', precision: 5, scale: 2, default: 0 },
    successfulPredictions: { type: Number, default: 0 },
    lastUpdated: { type: 'timestamp', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  indices: [
    { columns: ['ruleType', 'ruleValue'], unique: true },
    { columns: ['ruleType'] },
    { columns: ['averageAccuracy'] },
  ],
});
