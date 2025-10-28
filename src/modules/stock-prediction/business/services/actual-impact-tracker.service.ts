import { Injectable, Logger } from '@nestjs/common';
import { StockPricesService } from '../../../stock-prices/business/services/stock-prices.service';
import { NewsReliabilityService } from '../../../news-reliability/business/services/news-reliability.service';
import { PredictionImpactEnum } from '../../contracts/enums/prediction-impact.enum';

@Injectable()
export class ActualImpactTrackerService {
  private readonly logger = new Logger(ActualImpactTrackerService.name);

  constructor(
    private readonly stockPricesService: StockPricesService,
    private readonly reliabilityService: NewsReliabilityService,
  ) {}

  /**
   * Check pending predictions every 30 minutes
   */
  async checkPendingPredictions(): Promise<void> {
    try {
      const pendingPredictions = await this.reliabilityService.getPendingPredictions();
      
      this.logger.log(`Checking ${pendingPredictions.length} pending predictions`);
      
      for (const prediction of pendingPredictions) {
        await this.evaluatePrediction(prediction);
        
        // Small delay to avoid overwhelming the system
        await this.delay(1000);
      }
    } catch (error) {
      this.logger.error('Error in prediction evaluation:', error);
    }
  }

  /**
   * Evaluate a single prediction against actual stock performance
   */
  private async evaluatePrediction(prediction: any): Promise<void> {
    try {
      const predictionTime = prediction.createdAt;
      const timeWindow = this.parseTimeWindow(prediction.timeWindow || '1D');
      const endTime = new Date(predictionTime.getTime() + timeWindow);
      
      // Get stock prices in the prediction window
      const stockPrices = await this.stockPricesService.findBySymbolAndDateRange(
        prediction.stockSymbol,
        predictionTime,
        endTime
      );

      if (stockPrices.length < 2) {
        this.logger.warn(`Insufficient price data for ${prediction.stockSymbol} in window ${prediction.timeWindow}`);
        return;
      }

      // Calculate actual performance
      const startPrice = stockPrices[0].last;
      const endPrice = stockPrices[stockPrices.length - 1].last;
      const actualChangePercent = ((endPrice - startPrice) / startPrice) * 100;

      // Determine actual impact
      const actualImpact = this.determineActualImpact(actualChangePercent);

      // Calculate prediction accuracy
      const accuracy = this.calculateAccuracy(prediction, actualImpact, actualChangePercent);

      // Update prediction with actual results
      await this.reliabilityService.updateActualImpact(
        prediction.id,
        actualImpact,
        actualChangePercent
      );

      // Update learning system
      await this.updateLearningSystem(prediction, actualImpact, actualChangePercent, accuracy);

      this.logger.log(
        `Prediction ${prediction.id} evaluated: Predicted ${prediction.predictedChangePercent}%, Actual ${actualChangePercent.toFixed(2)}%, Accuracy: ${accuracy.toFixed(1)}%`
      );

    } catch (error) {
      this.logger.error(`Failed to evaluate prediction ${prediction.id}:`, error);
    }
  }

  /**
   * Parse time window string to milliseconds
   */
  private parseTimeWindow(timeWindow: string): number {
    const timeMap: Record<string, number> = {
      '1H': 60 * 60 * 1000,
      '4H': 4 * 60 * 60 * 1000,
      '1D': 24 * 60 * 60 * 1000,
      '1W': 7 * 24 * 60 * 60 * 1000,
    };
    
    return timeMap[timeWindow] || timeMap['1D'];
  }

  /**
   * Determine actual impact based on percentage change
   */
  private determineActualImpact(changePercent: number): PredictionImpactEnum {
    if (changePercent > 2) return PredictionImpactEnum.UP;
    if (changePercent < -2) return PredictionImpactEnum.DOWN;
    return PredictionImpactEnum.NEUTRAL;
  }

  /**
   * Calculate prediction accuracy score
   */
  private calculateAccuracy(prediction: any, actualImpact: PredictionImpactEnum, actualChangePercent: number): number {
    // Direction accuracy (50% weight)
    const directionAccuracy = prediction.predictedImpact === actualImpact ? 100 : 0;
    
    // Magnitude accuracy (50% weight)
    const predictedChange = Math.abs(prediction.predictedChangePercent);
    const actualChange = Math.abs(actualChangePercent);
    const magnitudeAccuracy = Math.max(0, 100 - Math.abs(predictedChange - actualChange) * 5);
    
    return (directionAccuracy * 0.5) + (magnitudeAccuracy * 0.5);
  }

  /**
   * Update learning system with new data
   */
  private async updateLearningSystem(
    prediction: any,
    actualImpact: PredictionImpactEnum,
    actualChangePercent: number,
    accuracy: number
  ): Promise<void> {
    // This will be implemented in LearningSystemService
    this.logger.debug(`Learning system update for prediction ${prediction.id}: accuracy ${accuracy}%`);
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
