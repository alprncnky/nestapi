import { Injectable, Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { StockPricesService } from '../../../stock-prices/business/services/stock-prices.service';
import { NewsService } from '../../../news/business/services/news.service';
import { NewsReliabilityService } from '../../../news-reliability/business/services/news-reliability.service';
import { LearningSystemService } from './learning-system.service';

@Injectable()
export class RetrospectiveLearningService {
  private readonly logger = new Logger(RetrospectiveLearningService.name);

  constructor(
    private readonly stockPricesService: StockPricesService,
    private readonly newsService: NewsService,
    private readonly reliabilityService: NewsReliabilityService,
    private readonly learningSystem: LearningSystemService,
  ) {}

  /**
   * Daily retrospective analysis - analyze significant movements
   * Runs every day at 7 PM to analyze the day's movements
   */
  async performRetrospectiveAnalysis(): Promise<void> {
    try {
      this.logger.log('Starting retrospective learning analysis...');
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // 1. Find significant stock movements
      const significantMovements = await this.findSignificantMovements(yesterday, today);
      
      this.logger.log(`Found ${significantMovements.length} significant movements`);
      
      // 2. Analyze each movement
      for (const movement of significantMovements) {
        await this.analyzeMovementRetrospectively(movement);
      }
      
      // 3. Generate retrospective insights
      await this.generateRetrospectiveInsights(significantMovements);
      
      this.logger.log('Retrospective learning analysis completed');
    } catch (error) {
      this.logger.error('Error in retrospective analysis:', error);
    }
  }

  /**
   * Find stocks with significant price movements
   */
  private async findSignificantMovements(startDate: Date, endDate: Date): Promise<any[]> {
    const allStocks = await this.stockPricesService.findAllLatest();
    const movements = [];
    
    for (const stock of allStocks) {
      const prices = await this.stockPricesService.findBySymbolAndDateRange(
        stock.stockSymbol,
        startDate,
        endDate
      );
      
      if (prices.length >= 2) {
        const startPrice = prices[0].last;
        const endPrice = prices[prices.length - 1].last;
        const changePercent = ((endPrice - startPrice) / startPrice) * 100;
        
        // Consider movements > 5% as significant
        if (Math.abs(changePercent) > 5) {
          movements.push({
            symbol: stock.stockSymbol,
            name: stock.stockName,
            changePercent: Math.round(changePercent * 100) / 100,
            startPrice,
            endPrice,
            startTime: prices[0].lastUpdate,
            endTime: prices[prices.length - 1].lastUpdate,
            volume: prices[prices.length - 1].volumeLot,
          });
        }
      }
    }
    
    return movements.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  }

  /**
   * Analyze a movement retrospectively
   */
  private async analyzeMovementRetrospectively(movement: any): Promise<void> {
    try {
      this.logger.log(`Analyzing movement: ${movement.symbol} ${movement.changePercent}%`);
      
      // 1. Find news that preceded the movement
      const precedingNews = await this.findPrecedingNews(movement);
      
      // 2. Check if we had predictions for this movement
      const existingPredictions = await this.findExistingPredictions(movement);
      
      // 3. Analyze missed opportunities
      if (precedingNews.length > 0 && existingPredictions.length === 0) {
        await this.analyzeMissedOpportunity(movement, precedingNews);
      }
      
      // 4. Analyze prediction accuracy
      if (existingPredictions.length > 0) {
        await this.analyzePredictionAccuracy(movement, existingPredictions);
      }
      
      // 5. Find related stocks that moved similarly
      const relatedMovements = await this.findRelatedMovements(movement);
      
      // 6. Update learning system with retrospective insights
      await this.updateLearningSystemWithRetrospectiveData(
        movement,
        precedingNews,
        existingPredictions,
        relatedMovements
      );
      
    } catch (error) {
      this.logger.error(`Error analyzing movement ${movement.symbol}:`, error);
    }
  }

  /**
   * Find news that preceded a significant movement
   */
  private async findPrecedingNews(movement: any): Promise<any[]> {
    // Look for news 24-48 hours before the movement
    const lookbackStart = new Date(movement.startTime);
    lookbackStart.setHours(lookbackStart.getHours() - 48);
    
    const lookbackEnd = new Date(movement.startTime);
    lookbackEnd.setHours(lookbackEnd.getHours() - 1);
    
    // Find news mentioning this stock
    const stockMentions = await this.reliabilityService.findByStockAndDateRange(
      movement.symbol,
      lookbackStart,
      lookbackEnd
    );
    
    // Also find news that might be related (same sector, similar keywords)
    const relatedNews = await this.findRelatedNews(movement, lookbackStart, lookbackEnd);
    
    return [...stockMentions.map(m => m.article), ...relatedNews];
  }

  /**
   * Find news related to the movement (same sector, keywords)
   */
  private async findRelatedNews(movement: any, startDate: Date, endDate: Date): Promise<any[]> {
    // TODO: Implement related news finding logic
    // - Same sector stocks
    // - Similar keywords in news
    // - Market-wide news that could affect this stock
    return [];
  }

  /**
   * Find existing predictions for this movement
   */
  private async findExistingPredictions(movement: any): Promise<any[]> {
    const lookbackStart = new Date(movement.startTime);
    lookbackStart.setHours(lookbackStart.getHours() - 24);
    
    return await this.reliabilityService.findByStockAndDateRange(
      movement.symbol,
      lookbackStart,
      movement.startTime
    );
  }

  /**
   * Analyze missed opportunities
   */
  private async analyzeMissedOpportunity(movement: any, precedingNews: any[]): Promise<void> {
    this.logger.log(`Missed opportunity: ${movement.symbol} moved ${movement.changePercent}% but no prediction was made`);
    
    // Analyze why we missed this opportunity
    const analysis = {
      stockSymbol: movement.symbol,
      movementPercent: movement.changePercent,
      precedingNewsCount: precedingNews.length,
      newsCategories: [...new Set(precedingNews.map(n => n.mainCategory))],
      newsSentiments: precedingNews.map(n => n.sentimentScore),
      averageSentiment: precedingNews.reduce((sum, n) => sum + (n.sentimentScore || 0), 0) / precedingNews.length,
      missedReasons: await this.identifyMissedReasons(precedingNews),
    };
    
    // Save missed opportunity analysis
    await this.saveMissedOpportunityAnalysis(analysis);
    
    // Update learning system
    await this.learningSystem.updateWithMissedOpportunity(analysis);
  }

  /**
   * Identify reasons why we missed the opportunity
   */
  private async identifyMissedReasons(news: any[]): Promise<string[]> {
    const reasons: string[] = [];
    
    // Check if news had stock mentions
    const hasStockMentions = news.some(n => n.stockMentions && n.stockMentions.length > 0);
    if (!hasStockMentions) {
      reasons.push('No direct stock mentions in news');
    }
    
    // Check sentiment strength
    const avgSentiment = news.reduce((sum, n) => sum + Math.abs(n.sentimentScore || 0), 0) / news.length;
    if (avgSentiment < 0.3) {
      reasons.push('Weak sentiment signals');
    }
    
    // Check impact level
    const hasHighImpact = news.some(n => n.impactLevel === 'HIGH');
    if (!hasHighImpact) {
      reasons.push('No high-impact news detected');
    }
    
    // Check news processing status
    const unprocessedNews = news.filter(n => n.status !== 'PROCESSED');
    if (unprocessedNews.length > 0) {
      reasons.push('Some news not processed in time');
    }
    
    return reasons;
  }

  /**
   * Analyze prediction accuracy for existing predictions
   */
  private async analyzePredictionAccuracy(movement: any, predictions: any[]): Promise<void> {
    for (const prediction of predictions) {
      const accuracy = this.calculateRetrospectiveAccuracy(prediction, movement);
      
      this.logger.log(
        `Retrospective accuracy for ${movement.symbol}: Predicted ${prediction.predictedChangePercent}%, Actual ${movement.changePercent}%, Accuracy: ${accuracy.toFixed(1)}%`
      );
      
      // Update prediction with retrospective accuracy
      await this.reliabilityService.updateRetrospectiveAccuracy(prediction.id, accuracy);
    }
  }

  /**
   * Calculate retrospective accuracy
   */
  private calculateRetrospectiveAccuracy(prediction: any, movement: any): number {
    const predictedChange = prediction.predictedChangePercent;
    const actualChange = movement.changePercent;
    
    // Direction accuracy (50% weight)
    const predictedDirection = predictedChange > 0 ? 'UP' : predictedChange < 0 ? 'DOWN' : 'NEUTRAL';
    const actualDirection = actualChange > 2 ? 'UP' : actualChange < -2 ? 'DOWN' : 'NEUTRAL';
    const directionAccuracy = predictedDirection === actualDirection ? 100 : 0;
    
    // Magnitude accuracy (50% weight)
    const magnitudeAccuracy = Math.max(0, 100 - Math.abs(predictedChange - actualChange) * 3);
    
    return (directionAccuracy * 0.5) + (magnitudeAccuracy * 0.5);
  }

  /**
   * Find related movements (similar stocks, same sector)
   */
  private async findRelatedMovements(movement: any): Promise<any[]> {
    // TODO: Implement related movements finding
    // - Same sector stocks
    // - Stocks with similar market cap
    // - Stocks with correlation patterns
    return [];
  }

  /**
   * Update learning system with retrospective data
   */
  private async updateLearningSystemWithRetrospectiveData(
    movement: any,
    precedingNews: any[],
    existingPredictions: any[],
    relatedMovements: any[]
  ): Promise<void> {
    const retrospectiveData = {
      movement,
      precedingNews,
      existingPredictions,
      relatedMovements,
      analysisDate: new Date(),
    };
    
    await this.learningSystem.updateWithRetrospectiveData(retrospectiveData);
  }

  /**
   * Generate retrospective insights
   */
  private async generateRetrospectiveInsights(movements: any[]): Promise<void> {
    const insights = {
      totalMovements: movements.length,
      averageMovement: movements.reduce((sum, m) => sum + Math.abs(m.changePercent), 0) / movements.length,
      topGainers: movements.filter(m => m.changePercent > 0).slice(0, 5),
      topLosers: movements.filter(m => m.changePercent < 0).slice(0, 5),
      missedOpportunities: movements.filter(m => m.missedOpportunity).length,
      predictionAccuracy: await this.calculateOverallPredictionAccuracy(movements),
    };
    
    this.logger.log('Retrospective Insights:', JSON.stringify(insights, null, 2));
    
    // Save insights
    await this.saveRetrospectiveInsights(insights);
  }

  /**
   * Calculate overall prediction accuracy
   */
  private async calculateOverallPredictionAccuracy(movements: any[]): Promise<number> {
    let totalAccuracy = 0;
    let predictionCount = 0;
    
    for (const movement of movements) {
      const predictions = await this.findExistingPredictions(movement);
      for (const prediction of predictions) {
        const accuracy = this.calculateRetrospectiveAccuracy(prediction, movement);
        totalAccuracy += accuracy;
        predictionCount++;
      }
    }
    
    return predictionCount > 0 ? totalAccuracy / predictionCount : 0;
  }

  /**
   * Save missed opportunity analysis
   */
  private async saveMissedOpportunityAnalysis(analysis: any): Promise<void> {
    // TODO: Implement saving to database
    this.logger.debug('Saving missed opportunity analysis');
  }

  /**
   * Save retrospective insights
   */
  private async saveRetrospectiveInsights(insights: any): Promise<void> {
    // TODO: Implement saving to database
    this.logger.debug('Saving retrospective insights');
  }
}
