import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';

@AutoEntity()
export class PatternRecognition {
  id: number;
  patternType: string;
  patternData: string; // JSON string
  confidence: number;
  frequency: number;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}