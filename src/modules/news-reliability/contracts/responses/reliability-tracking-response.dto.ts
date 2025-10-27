import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../../common/base/base-dto';
import { PredictionImpactEnum } from '../enums/prediction-impact.enum';

/**
 * Response DTO for Reliability Tracking
 * Auto-mapping provided by BaseResponseDto constructor
 */
export class ReliabilityTrackingResponseDto extends BaseResponseDto {
  @ApiProperty({ description: 'Article ID', example: 1 })
  articleId: number;

  @ApiProperty({ description: 'Stock symbol', example: 'AAPL' })
  stockSymbol: string;

  @ApiProperty({ description: 'Predicted impact direction', example: 'UP', enum: PredictionImpactEnum, required: false })
  predictedImpact?: string;

  @ApiProperty({ description: 'Predicted change percentage', example: 2.5, required: false })
  predictedChangePercent?: number;

  @ApiProperty({ description: 'Prediction confidence score (0-100)', example: 85.5, required: false })
  predictionConfidence?: number;

  @ApiProperty({ description: 'Actual impact direction', example: 'UP', enum: PredictionImpactEnum, required: false })
  actualImpact?: string;

  @ApiProperty({ description: 'Actual change percentage', example: 3.2, required: false })
  actualChangePercent?: number;

  @ApiProperty({ description: 'Prediction accuracy score (0-100)', example: 92.5, required: false })
  predictionAccuracy?: number;

  @ApiProperty({ description: 'Date when actual impact was evaluated', example: '2024-01-02T00:00:00Z', required: false })
  evaluationDate?: Date;

  @ApiProperty({ description: 'Time window for prediction (e.g., 1H, 4H, 1D, 1W)', example: '1D', required: false })
  timeWindow?: string;
}

