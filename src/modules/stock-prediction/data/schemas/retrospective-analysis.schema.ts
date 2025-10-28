import { EntitySchema } from 'typeorm';
import { RetrospectiveAnalysis } from '../entities/retrospective-analysis.entity';

export const RetrospectiveAnalysisSchema = new EntitySchema<RetrospectiveAnalysis>({
  name: 'RetrospectiveAnalysis',
  target: RetrospectiveAnalysis,
  tableName: 'retrospective_analyses',
  columns: {
    id: { type: Number, primary: true, generated: true },
    stockSymbol: { type: String, length: 10 },
    movementPercent: { type: 'decimal', precision: 8, scale: 4 },
    analysisDate: { type: 'date' },
    movementStartTime: { type: 'timestamp' },
    movementEndTime: { type: 'timestamp' },
    precedingNewsCount: { type: Number, default: 0 },
    existingPredictionsCount: { type: Number, default: 0 },
    missedOpportunity: { type: Boolean, default: false },
    missedReasons: { type: 'jsonb', nullable: true },
    retrospectiveAccuracy: { type: 'decimal', precision: 5, scale: 2, default: 0 },
    analysisData: { type: 'jsonb', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  indices: [
    { columns: ['stockSymbol', 'analysisDate'] },
    { columns: ['movementPercent'] },
    { columns: ['missedOpportunity'] },
  ],
});
