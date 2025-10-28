import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';

@AutoEntity()
export class PatternRecognition {
  id: number;
  patternType: string;
  patternData: string; // JSON string
  confidence: number;
  occurrences: number; // How many times this pattern occurred
  accuracy: number; // Prediction accuracy when this pattern is present
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}