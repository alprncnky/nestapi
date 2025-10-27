import { EntitySchema } from 'typeorm';
import { SourceReliabilityScore } from '../entities/source-reliability-score.entity';

export const SourceReliabilityScoreSchema = new EntitySchema<SourceReliabilityScore>({
  name: 'SourceReliabilityScore',
  target: SourceReliabilityScore,
  tableName: 'source_reliability_scores',
  columns: {
    id: { type: Number, primary: true, generated: true },
    sourceId: { type: Number },
    evaluationPeriod: { type: String, length: 20, comment: 'e.g., 2025-10, 2025-Q4' },
    totalPredictions: { type: Number, default: 0 },
    correctPredictions: { type: Number, default: 0 },
    accuracyRate: { type: 'decimal', precision: 5, scale: 2, default: 0 },
    averageConfidence: { type: 'decimal', precision: 5, scale: 2, default: 0 },
    companyNewsAccuracy: { type: 'decimal', precision: 5, scale: 2, nullable: true },
    macroNewsAccuracy: { type: 'decimal', precision: 5, scale: 2, nullable: true },
    calculatedAt: { type: 'timestamp' },
    createdAt: { type: 'timestamp', createDate: true },
  },
  relations: {
    source: { type: 'many-to-one', target: 'RssSource', joinColumn: { name: 'sourceId' } },
  },
});

