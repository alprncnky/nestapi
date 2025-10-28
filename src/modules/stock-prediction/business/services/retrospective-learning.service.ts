import { Injectable, Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { StockPricesService } from '../../../stock-prices/business/services/stock-prices.service';
import { NewsService } from '../../../news/business/services/news.service';
import { NewsReliabilityService } from '../../../news-reliability/business/services/news-reliability.service';
import { LearningSystemService } from './learning-system.service';
import { RetrospectiveAnalysisRepository } from '../../data/repositories/retrospective-analysis.repository';
import { RetrospectiveAnalysis } from '../../data/entities/retrospective-analysis.entity';

@Injectable()
export class RetrospectiveLearningService {
  private readonly logger = new Logger(RetrospectiveLearningService.name);

  constructor(
    private readonly stockPricesService: StockPricesService,
    private readonly newsService: NewsService,
    private readonly reliabilityService: NewsReliabilityService,
    private readonly learningSystem: LearningSystemService,
    private readonly retrospectiveAnalysisRepository: RetrospectiveAnalysisRepository,
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
    try {
      const relatedNews: any[] = [];
      
      // 1. Find news mentioning stocks in the same sector
      const sectorNews = await this.findSectorRelatedNews(movement, startDate, endDate);
      relatedNews.push(...sectorNews);
      
      // 2. Find news with similar keywords
      const keywordNews = await this.findKeywordRelatedNews(movement, startDate, endDate);
      relatedNews.push(...keywordNews);
      
      // 3. Find market-wide news that could affect this stock
      const marketNews = await this.findMarketWideNews(startDate, endDate);
      relatedNews.push(...marketNews);
      
      // Remove duplicates based on article ID
      const uniqueNews = relatedNews.filter((news, index, self) => 
        index === self.findIndex(n => n.id === news.id)
      );
      
      this.logger.debug(`Found ${uniqueNews.length} related news articles for ${movement.symbol}`);
      return uniqueNews;
      
    } catch (error) {
      this.logger.error('Error finding related news:', error);
      return [];
    }
  }

  /**
   * Find news related to stocks in the same sector
   */
  private async findSectorRelatedNews(movement: any, startDate: Date, endDate: Date): Promise<any[]> {
    // For now, we'll find news mentioning other stocks in the same time period
    // In a real implementation, you would have sector information
    const allNews = await this.newsService.findByDateRange(startDate, endDate);
    
    // Filter news that might be sector-related based on keywords
    const sectorKeywords = this.getSectorKeywords(movement.symbol);
    const sectorNews = allNews.filter(news => {
      const content = (news.title + ' ' + (news.contentPlain || '')).toLowerCase();
      return sectorKeywords.some(keyword => content.includes(keyword.toLowerCase()));
    });
    
    return sectorNews;
  }

  /**
   * Find news with similar keywords
   */
  private async findKeywordRelatedNews(movement: any, startDate: Date, endDate: Date): Promise<any[]> {
    const allNews = await this.newsService.findByDateRange(startDate, endDate);
    
    // Extract keywords from movement context (stock name, etc.)
    const movementKeywords = this.extractMovementKeywords(movement);
    
    const keywordNews = allNews.filter(news => {
      const content = (news.title + ' ' + (news.contentPlain || '')).toLowerCase();
      return movementKeywords.some(keyword => content.includes(keyword.toLowerCase()));
    });
    
    return keywordNews;
  }

  /**
   * Find market-wide news that could affect stocks
   */
  private async findMarketWideNews(startDate: Date, endDate: Date): Promise<any[]> {
    const allNews = await this.newsService.findByDateRange(startDate, endDate);
    
    // Market-wide keywords that could affect all stocks
    const marketKeywords = [
      'borsa', 'bist', 'piyasa', 'ekonomi', 'faiz', 'enflasyon', 'dolar', 'euro',
      'merkez bankası', 'tcmb', 'hükümet', 'bütçe', 'vergi', 'reform',
      'küresel', 'uluslararası', 'fed', 'ecb', 'brexit', 'savaş', 'pandemi'
    ];
    
    const marketNews = allNews.filter(news => {
      const content = (news.title + ' ' + (news.contentPlain || '')).toLowerCase();
      return marketKeywords.some(keyword => content.includes(keyword.toLowerCase()));
    });
    
    return marketNews;
  }

  /**
   * Get sector keywords based on stock symbol
   */
  private getSectorKeywords(stockSymbol: string): string[] {
    // This is a simplified mapping - in a real system, you'd have proper sector data
    const sectorMappings: Record<string, string[]> = {
      'BANK': ['banka', 'bankacılık', 'kredi', 'mevduat', 'faiz'],
      'TEK': ['teknoloji', 'yazılım', 'bilgisayar', 'internet', 'dijital'],
      'OTO': ['otomotiv', 'araç', 'otomobil', 'fabrika', 'üretim'],
      'GID': ['gıda', 'yiyecek', 'restoran', 'market', 'tarım'],
      'ELE': ['elektrik', 'enerji', 'elektronik', 'telekomünikasyon'],
      'KIM': ['kimya', 'petrol', 'rafineri', 'plastik', 'ilaç'],
      'MET': ['metal', 'çelik', 'demir', 'madencilik', 'maden'],
      'TEKSTIL': ['tekstil', 'giyim', 'konfeksiyon', 'kumaş'],
    };
    
    // Try to match stock symbol prefix to sector
    for (const [prefix, keywords] of Object.entries(sectorMappings)) {
      if (stockSymbol.startsWith(prefix)) {
        return keywords;
      }
    }
    
    // Default keywords for unknown sectors
    return ['şirket', 'hisse', 'yatırım', 'finans'];
  }

  /**
   * Extract keywords from movement context
   */
  private extractMovementKeywords(movement: any): string[] {
    const keywords: string[] = [];
    
    // Add stock name keywords
    if (movement.name) {
      const nameWords = movement.name.toLowerCase().split(' ').filter((word: string) => word.length > 3);
      keywords.push(...nameWords);
    }
    
    // Add stock symbol
    keywords.push(movement.symbol.toLowerCase());
    
    // Add movement-related keywords
    if (movement.changePercent > 0) {
      keywords.push('artış', 'yükseliş', 'pozitif', 'olumlu');
    } else if (movement.changePercent < 0) {
      keywords.push('düşüş', 'kayıp', 'negatif', 'olumsuz');
    }
    
    return keywords;
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
    try {
      const relatedMovements: any[] = [];
      
      // 1. Find stocks in the same sector
      const sectorMovements = await this.findSectorRelatedMovements(movement);
      relatedMovements.push(...sectorMovements);
      
      // 2. Find stocks with similar market cap
      const marketCapMovements = await this.findMarketCapRelatedMovements(movement);
      relatedMovements.push(...marketCapMovements);
      
      // 3. Find stocks with correlation patterns
      const correlationMovements = await this.findCorrelationRelatedMovements(movement);
      relatedMovements.push(...correlationMovements);
      
      // Remove duplicates based on stock symbol
      const uniqueMovements = relatedMovements.filter((mov, index, self) => 
        index === self.findIndex(m => m.symbol === mov.symbol)
      );
      
      this.logger.debug(`Found ${uniqueMovements.length} related movements for ${movement.symbol}`);
      return uniqueMovements;
      
    } catch (error) {
      this.logger.error('Error finding related movements:', error);
      return [];
    }
  }

  /**
   * Find movements in the same sector
   */
  private async findSectorRelatedMovements(movement: any): Promise<any[]> {
    const allStocks = await this.stockPricesService.findAllLatest();
    const sectorMovements: any[] = [];
    
    // Get sector prefix from stock symbol
    const sectorPrefix = this.getSectorPrefix(movement.symbol);
    
    for (const stock of allStocks) {
      if (stock.stockSymbol === movement.symbol) continue;
      
      // Check if stock is in the same sector
      if (this.getSectorPrefix(stock.stockSymbol) === sectorPrefix) {
        const prices = await this.stockPricesService.findBySymbolAndDateRange(
          stock.stockSymbol,
          new Date(movement.startTime.getTime() - 24 * 60 * 60 * 1000), // 24 hours before
          new Date(movement.endTime.getTime() + 24 * 60 * 60 * 1000)   // 24 hours after
        );
        
        if (prices.length >= 2) {
          const startPrice = prices[0].last;
          const endPrice = prices[prices.length - 1].last;
          const changePercent = ((endPrice - startPrice) / startPrice) * 100;
          
          // Only include significant movements (> 2%)
          if (Math.abs(changePercent) > 2) {
            sectorMovements.push({
              symbol: stock.stockSymbol,
              name: stock.stockName,
              changePercent: Math.round(changePercent * 100) / 100,
              startPrice,
              endPrice,
              startTime: prices[0].lastUpdate,
              endTime: prices[prices.length - 1].lastUpdate,
              volume: prices[prices.length - 1].volumeLot,
              correlationType: 'SECTOR'
            });
          }
        }
      }
    }
    
    return sectorMovements;
  }

  /**
   * Find movements with similar market cap
   */
  private async findMarketCapRelatedMovements(movement: any): Promise<any[]> {
    const allStocks = await this.stockPricesService.findAllLatest();
    const marketCapMovements: any[] = [];
    
    // Estimate market cap based on stock price and volume
    const movementStock = allStocks.find(s => s.stockSymbol === movement.symbol);
    if (!movementStock) return marketCapMovements;
    
    const movementMarketCap = movementStock.last * movementStock.volumeLot;
    
    for (const stock of allStocks) {
      if (stock.stockSymbol === movement.symbol) continue;
      
      const stockMarketCap = stock.last * stock.volumeLot;
      
      // Check if market cap is within 50% range
      if (stockMarketCap > movementMarketCap * 0.5 && stockMarketCap < movementMarketCap * 1.5) {
        const prices = await this.stockPricesService.findBySymbolAndDateRange(
          stock.stockSymbol,
          new Date(movement.startTime.getTime() - 24 * 60 * 60 * 1000),
          new Date(movement.endTime.getTime() + 24 * 60 * 60 * 1000)
        );
        
        if (prices.length >= 2) {
          const startPrice = prices[0].last;
          const endPrice = prices[prices.length - 1].last;
          const changePercent = ((endPrice - startPrice) / startPrice) * 100;
          
          if (Math.abs(changePercent) > 2) {
            marketCapMovements.push({
              symbol: stock.stockSymbol,
              name: stock.stockName,
              changePercent: Math.round(changePercent * 100) / 100,
              startPrice,
              endPrice,
              startTime: prices[0].lastUpdate,
              endTime: prices[prices.length - 1].lastUpdate,
              volume: prices[prices.length - 1].volumeLot,
              correlationType: 'MARKET_CAP'
            });
          }
        }
      }
    }
    
    return marketCapMovements;
  }

  /**
   * Find movements with correlation patterns
   */
  private async findCorrelationRelatedMovements(movement: any): Promise<any[]> {
    const allStocks = await this.stockPricesService.findAllLatest();
    const correlationMovements: any[] = [];
    
    for (const stock of allStocks.slice(0, 20)) { // Limit to first 20 stocks for performance
      if (stock.stockSymbol === movement.symbol) continue;
      
      const prices = await this.stockPricesService.findBySymbolAndDateRange(
        stock.stockSymbol,
        new Date(movement.startTime.getTime() - 2 * 60 * 60 * 1000), // 2 hours before
        new Date(movement.endTime.getTime() + 2 * 60 * 60 * 1000)   // 2 hours after
      );
      
      if (prices.length >= 2) {
        const startPrice = prices[0].last;
        const endPrice = prices[prices.length - 1].last;
        const changePercent = ((endPrice - startPrice) / startPrice) * 100;
        
        // Check for correlation (same direction, similar magnitude)
        const directionMatch = Math.sign(changePercent) === Math.sign(movement.changePercent);
        const magnitudeSimilar = Math.abs(changePercent - movement.changePercent) < 5;
        
        if (directionMatch && magnitudeSimilar && Math.abs(changePercent) > 2) {
          correlationMovements.push({
            symbol: stock.stockSymbol,
            name: stock.stockName,
            changePercent: Math.round(changePercent * 100) / 100,
            startPrice,
            endPrice,
            startTime: prices[0].lastUpdate,
            endTime: prices[prices.length - 1].lastUpdate,
            volume: prices[prices.length - 1].volumeLot,
            correlationType: 'CORRELATION',
            correlationStrength: Math.abs(changePercent - movement.changePercent)
          });
        }
      }
    }
    
    return correlationMovements;
  }

  /**
   * Get sector prefix from stock symbol
   */
  private getSectorPrefix(stockSymbol: string): string {
    // Extract first 3-4 characters as sector prefix
    if (stockSymbol.length >= 4) {
      return stockSymbol.substring(0, 4);
    }
    return stockSymbol.substring(0, 3);
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
    try {
      const retrospectiveAnalysis = new RetrospectiveAnalysis();
      retrospectiveAnalysis.stockSymbol = analysis.stockSymbol;
      retrospectiveAnalysis.movementPercent = analysis.movementPercent;
      retrospectiveAnalysis.analysisDate = new Date();
      retrospectiveAnalysis.movementStartTime = analysis.startTime || new Date();
      retrospectiveAnalysis.movementEndTime = analysis.endTime || new Date();
      retrospectiveAnalysis.precedingNewsCount = analysis.precedingNewsCount;
      retrospectiveAnalysis.existingPredictionsCount = analysis.existingPredictionsCount || 0;
      retrospectiveAnalysis.missedOpportunity = true;
      retrospectiveAnalysis.missedReasons = JSON.stringify(analysis.missedReasons);
      retrospectiveAnalysis.retrospectiveAccuracy = 0; // No accuracy for missed opportunities
      retrospectiveAnalysis.analysisData = JSON.stringify({
        newsCategories: analysis.newsCategories,
        newsSentiments: analysis.newsSentiments,
        averageSentiment: analysis.averageSentiment,
        analysisTimestamp: new Date().toISOString()
      });
      retrospectiveAnalysis.createdAt = new Date();
      retrospectiveAnalysis.updatedAt = new Date();
      
      await this.retrospectiveAnalysisRepository.save(retrospectiveAnalysis);
      
      this.logger.log(`Missed opportunity analysis saved for ${analysis.stockSymbol}`);
    } catch (error) {
      this.logger.error('Error saving missed opportunity analysis:', error);
    }
  }

  /**
   * Save retrospective insights
   */
  private async saveRetrospectiveInsights(insights: any): Promise<void> {
    try {
      // Create a general retrospective analysis record for insights
      const retrospectiveAnalysis = new RetrospectiveAnalysis();
      retrospectiveAnalysis.stockSymbol = 'MARKET_WIDE'; // Indicates market-wide insights
      retrospectiveAnalysis.movementPercent = insights.averageMovement || 0;
      retrospectiveAnalysis.analysisDate = new Date();
      retrospectiveAnalysis.movementStartTime = new Date();
      retrospectiveAnalysis.movementEndTime = new Date();
      retrospectiveAnalysis.precedingNewsCount = 0;
      retrospectiveAnalysis.existingPredictionsCount = insights.totalMovements || 0;
      retrospectiveAnalysis.missedOpportunity = false;
      retrospectiveAnalysis.missedReasons = JSON.stringify([]);
      retrospectiveAnalysis.retrospectiveAccuracy = insights.predictionAccuracy || 0;
      retrospectiveAnalysis.analysisData = JSON.stringify({
        totalMovements: insights.totalMovements,
        averageMovement: insights.averageMovement,
        topGainers: insights.topGainers,
        topLosers: insights.topLosers,
        missedOpportunities: insights.missedOpportunities,
        predictionAccuracy: insights.predictionAccuracy,
        insightsTimestamp: new Date().toISOString(),
        type: 'MARKET_WIDE_INSIGHTS'
      });
      retrospectiveAnalysis.createdAt = new Date();
      retrospectiveAnalysis.updatedAt = new Date();
      
      await this.retrospectiveAnalysisRepository.save(retrospectiveAnalysis);
      
      this.logger.log('Retrospective insights saved successfully');
    } catch (error) {
      this.logger.error('Error saving retrospective insights:', error);
    }
  }
}
