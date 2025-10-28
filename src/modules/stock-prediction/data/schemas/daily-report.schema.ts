import { EntitySchema } from 'typeorm';
import { DailyReport } from '../entities/daily-report.entity';

export const DailyReportSchema = new EntitySchema<DailyReport>({
  name: 'DailyReport',
  target: DailyReport,
  tableName: 'daily_reports',
  columns: {
    id: { type: Number, primary: true, generated: true },
    reportDate: { type: 'date' },
    reportData: { type: 'jsonb', nullable: true },
    totalArticles: { type: Number, default: 0 },
    totalPredictions: { type: Number, default: 0 },
    averageAccuracy: { type: 'decimal', precision: 5, scale: 2, default: 0 },
    topGainers: { type: 'jsonb', nullable: true },
    topLosers: { type: 'jsonb', nullable: true },
    insights: { type: 'jsonb', nullable: true },
    recommendations: { type: 'jsonb', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  indices: [
    { columns: ['reportDate'], unique: true },
    { columns: ['averageAccuracy'] },
  ],
});
