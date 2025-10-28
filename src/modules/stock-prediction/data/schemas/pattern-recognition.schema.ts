import { EntitySchema } from 'typeorm';
import { PatternRecognition } from '../entities/pattern-recognition.entity';

export const PatternRecognitionSchema = new EntitySchema<PatternRecognition>({
  name: 'PatternRecognition',
  target: PatternRecognition,
  tableName: 'pattern_recognitions',
  columns: {
    id: { type: Number, primary: true, generated: true },
    patternType: { type: String, length: 50 },
    patternData: { type: 'jsonb', nullable: true },
    confidence: { type: 'decimal', precision: 5, scale: 2, default: 0 },
    frequency: { type: Number, default: 0 },
    lastSeen: { type: 'timestamp', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  indices: [
    { columns: ['patternType'] },
    { columns: ['confidence'] },
    { columns: ['lastSeen'] },
  ],
});
