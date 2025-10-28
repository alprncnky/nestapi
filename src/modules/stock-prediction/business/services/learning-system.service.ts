import { Injectable, Logger } from '@nestjs/common';
import { NewsReliabilityService } from '../../../news-reliability/business/services/news-reliability.service';
import { PredictionRuleRepository } from '../../data/repositories/prediction-rule.repository';
import { PredictionRule } from '../../data/entities/prediction-rule.entity';
import { RuleTypeEnum } from '../../contracts/enums/rule-type.enum';
import { PatternRecognitionRepository } from '../../data/repositories/pattern-recognition.repository';
import { PatternRecognition } from '../../data/entities/pattern-recognition.entity';
import { StockPricesService } from '../../../stock-prices/business/services/stock-prices.service';
import { DailyReportRepository } from '../../data/repositories/daily-report.repository';
import { DailyReport } from '../../data/entities/daily-report.entity';

@Injectable()
export class LearningSystemService {
  private readonly logger = new Logger(LearningSystemService.name);

  constructor(
    private readonly reliabilityService: NewsReliabilityService,
    private readonly ruleRepository: PredictionRuleRepository,
    private readonly patternRepository: PatternRecognitionRepository,
    private readonly stockPricesService: StockPricesService,
    private readonly dailyReportRepository: DailyReportRepository,
  ) {}

  /**
   * Update learning system with new prediction outcome
   */
  async updateLearningSystem(
    prediction: any,
    actualImpact: any,
    actualChangePercent: number,
    accuracy: number
  ): Promise<void> {
    try {
      const article = prediction.article;
      
      // 1. Update category-based rules
      await this.updateCategoryRule(article.mainCategory, prediction, actualChangePercent, accuracy);
      
      // 2. Update sentiment-based rules
      await this.updateSentimentRule(article.sentimentScore, prediction, actualChangePercent, accuracy);
      
      // 3. Update impact-level rules
      await this.updateImpactLevelRule(article.impactLevel, prediction, actualChangePercent, accuracy);
      
      // 4. Update source-based rules
      await this.updateSourceRule(article.sourceId, prediction, actualChangePercent, accuracy);
      
      // 5. Analyze patterns
      await this.analyzePatterns(prediction, actualChangePercent, accuracy);
      
    } catch (error) {
      this.logger.error('Error updating learning system:', error);
    }
  }

  /**
   * Update category-based prediction rules
   */
  private async updateCategoryRule(
    category: string,
    prediction: any,
    actualChangePercent: number,
    accuracy: number
  ): Promise<void> {
    const rule = await this.findOrCreateRule(RuleTypeEnum.CATEGORY, category);
    
    const newWeight = rule.totalPredictions + 1;
    const newAccuracy = ((rule.averageAccuracy * rule.totalPredictions) + accuracy) / newWeight;
    const newChangePercent = ((rule.averageChangePercent * rule.totalPredictions) + actualChangePercent) / newWeight;
    
    rule.totalPredictions = newWeight;
    rule.averageAccuracy = newAccuracy;
    rule.averageChangePercent = newChangePercent;
    rule.successRate = (rule.successfulPredictions + (accuracy > 70 ? 1 : 0)) / newWeight;
    rule.lastUpdated = new Date();
    
    await this.ruleRepository.save(rule);
    
    this.logger.debug(`Updated category rule for ${category}: accuracy ${newAccuracy.toFixed(1)}%`);
  }

  /**
   * Update sentiment-based prediction rules
   */
  private async updateSentimentRule(
    sentimentScore: number,
    prediction: any,
    actualChangePercent: number,
    accuracy: number
  ): Promise<void> {
    const sentimentCategory = sentimentScore > 0.3 ? 'POSITIVE' : 
                             sentimentScore < -0.3 ? 'NEGATIVE' : 'NEUTRAL';
    
    const rule = await this.findOrCreateRule(RuleTypeEnum.SENTIMENT, sentimentCategory);
    
    const newWeight = rule.totalPredictions + 1;
    const newAccuracy = ((rule.averageAccuracy * rule.totalPredictions) + accuracy) / newWeight;
    const newChangePercent = ((rule.averageChangePercent * rule.totalPredictions) + actualChangePercent) / newWeight;
    
    rule.totalPredictions = newWeight;
    rule.averageAccuracy = newAccuracy;
    rule.averageChangePercent = newChangePercent;
    rule.successRate = (rule.successfulPredictions + (accuracy > 70 ? 1 : 0)) / newWeight;
    rule.lastUpdated = new Date();
    
    await this.ruleRepository.save(rule);
  }

  /**
   * Update impact-level prediction rules
   */
  private async updateImpactLevelRule(
    impactLevel: string,
    prediction: any,
    actualChangePercent: number,
    accuracy: number
  ): Promise<void> {
    const rule = await this.findOrCreateRule(RuleTypeEnum.IMPACT_LEVEL, impactLevel);
    
    const newWeight = rule.totalPredictions + 1;
    const newAccuracy = ((rule.averageAccuracy * rule.totalPredictions) + accuracy) / newWeight;
    const newChangePercent = ((rule.averageChangePercent * rule.totalPredictions) + actualChangePercent) / newWeight;
    
    rule.totalPredictions = newWeight;
    rule.averageAccuracy = newAccuracy;
    rule.averageChangePercent = newChangePercent;
    rule.successRate = (rule.successfulPredictions + (accuracy > 70 ? 1 : 0)) / newWeight;
    rule.lastUpdated = new Date();
    
    await this.ruleRepository.save(rule);
  }

  /**
   * Update source-based prediction rules
   */
  private async updateSourceRule(
    sourceId: number,
    prediction: any,
    actualChangePercent: number,
    accuracy: number
  ): Promise<void> {
    const rule = await this.findOrCreateRule(RuleTypeEnum.SOURCE, sourceId.toString());
    
    const newWeight = rule.totalPredictions + 1;
    const newAccuracy = ((rule.averageAccuracy * rule.totalPredictions) + accuracy) / newWeight;
    const newChangePercent = ((rule.averageChangePercent * rule.totalPredictions) + actualChangePercent) / newWeight;
    
    rule.totalPredictions = newWeight;
    rule.averageAccuracy = newAccuracy;
    rule.averageChangePercent = newChangePercent;
    rule.successRate = (rule.successfulPredictions + (accuracy > 70 ? 1 : 0)) / newWeight;
    rule.lastUpdated = new Date();
    
    await this.ruleRepository.save(rule);
  }

  /**
   * Find existing rule or create new one
   */
  private async findOrCreateRule(ruleType: RuleTypeEnum, ruleValue: string): Promise<PredictionRule> {
    let rule = await this.ruleRepository.findByTypeAndValue(ruleType, ruleValue);
    
    if (!rule) {
      rule = new PredictionRule();
      rule.ruleType = ruleType;
      rule.ruleValue = ruleValue;
      rule.totalPredictions = 0;
      rule.averageAccuracy = 0;
      rule.averageChangePercent = 0;
      rule.successRate = 0;
      rule.successfulPredictions = 0;
      rule.createdAt = new Date();
    }
    
    return rule;
  }

  /**
   * Analyze patterns in prediction outcomes
   */
  private async analyzePatterns(
    prediction: any,
    actualChangePercent: number,
    accuracy: number
  ): Promise<void> {
    try {
      const article = prediction.article;
      const predictionTime = prediction.createdAt;
      
      // 1. Time-based patterns (hour of day, day of week)
      await this.analyzeTimeBasedPatterns(predictionTime, accuracy, actualChangePercent);
      
      // 2. Market condition patterns (volatility, volume)
      await this.analyzeMarketConditionPatterns(prediction, actualChangePercent, accuracy);
      
      // 3. Cross-correlation patterns between different stocks
      await this.analyzeCrossCorrelationPatterns(prediction, actualChangePercent);
      
      // 4. Seasonal patterns
      await this.analyzeSeasonalPatterns(predictionTime, accuracy, actualChangePercent);
      
    } catch (error) {
      this.logger.error('Error analyzing patterns:', error);
    }
  }

  /**
   * Analyze time-based patterns
   */
  private async analyzeTimeBasedPatterns(predictionTime: Date, accuracy: number, actualChangePercent: number): Promise<void> {
    const hour = predictionTime.getHours();
    const dayOfWeek = predictionTime.getDay();
    
    // Hour-based pattern
    const hourPattern = await this.patternRepository.findByPatternType(`HOUR_${hour}`);
    if (hourPattern.length > 0) {
      const pattern = hourPattern[0];
      pattern.occurrences += 1;
      pattern.accuracy = ((pattern.accuracy * (pattern.occurrences - 1)) + accuracy) / pattern.occurrences;
      pattern.lastSeen = predictionTime;
      await this.patternRepository.save(pattern);
    } else {
      const newPattern = new PatternRecognition();
      newPattern.patternType = `HOUR_${hour}`;
      newPattern.patternData = JSON.stringify({ hour, description: `Predictions made at ${hour}:00` });
      newPattern.confidence = 50;
      newPattern.occurrences = 1;
      newPattern.accuracy = accuracy;
      newPattern.lastSeen = predictionTime;
      newPattern.createdAt = new Date();
      await this.patternRepository.save(newPattern);
    }
    
    // Day of week pattern
    const dayPattern = await this.patternRepository.findByPatternType(`DAY_${dayOfWeek}`);
    if (dayPattern.length > 0) {
      const pattern = dayPattern[0];
      pattern.occurrences += 1;
      pattern.accuracy = ((pattern.accuracy * (pattern.occurrences - 1)) + accuracy) / pattern.occurrences;
      pattern.lastSeen = predictionTime;
      await this.patternRepository.save(pattern);
    } else {
      const newPattern = new PatternRecognition();
      newPattern.patternType = `DAY_${dayOfWeek}`;
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      newPattern.patternData = JSON.stringify({ dayOfWeek, dayName: dayNames[dayOfWeek] });
      newPattern.confidence = 50;
      newPattern.occurrences = 1;
      newPattern.accuracy = accuracy;
      newPattern.lastSeen = predictionTime;
      newPattern.createdAt = new Date();
      await this.patternRepository.save(newPattern);
    }
  }

  /**
   * Analyze market condition patterns
   */
  private async analyzeMarketConditionPatterns(prediction: any, actualChangePercent: number, accuracy: number): Promise<void> {
    // Get stock price data around prediction time
    const stockPrices = await this.stockPricesService.findBySymbolAndDateRange(
      prediction.stockSymbol,
      new Date(prediction.createdAt.getTime() - 24 * 60 * 60 * 1000), // 24 hours before
      new Date(prediction.createdAt.getTime() + 24 * 60 * 60 * 1000)  // 24 hours after
    );
    
    if (stockPrices.length > 0) {
      const latestPrice = stockPrices[stockPrices.length - 1];
      const volatility = latestPrice.volatility || 0;
      const volume = latestPrice.volumeLot || 0;
      
      // Volatility-based pattern
      const volatilityCategory = volatility > 2 ? 'HIGH' : volatility > 1 ? 'MEDIUM' : 'LOW';
      const volatilityPattern = await this.patternRepository.findByPatternType(`VOLATILITY_${volatilityCategory}`);
      
      if (volatilityPattern.length > 0) {
        const pattern = volatilityPattern[0];
        pattern.occurrences += 1;
        pattern.accuracy = ((pattern.accuracy * (pattern.occurrences - 1)) + accuracy) / pattern.occurrences;
        pattern.lastSeen = prediction.createdAt;
        await this.patternRepository.save(pattern);
      } else {
        const newPattern = new PatternRecognition();
        newPattern.patternType = `VOLATILITY_${volatilityCategory}`;
        newPattern.patternData = JSON.stringify({ 
          volatilityCategory, 
          volatility, 
          description: `Market volatility: ${volatilityCategory}` 
        });
        newPattern.confidence = 50;
        newPattern.occurrences = 1;
        newPattern.accuracy = accuracy;
        newPattern.lastSeen = prediction.createdAt;
        newPattern.createdAt = new Date();
        await this.patternRepository.save(newPattern);
      }
      
      // Volume-based pattern
      const volumeCategory = volume > 1000000 ? 'HIGH' : volume > 100000 ? 'MEDIUM' : 'LOW';
      const volumePattern = await this.patternRepository.findByPatternType(`VOLUME_${volumeCategory}`);
      
      if (volumePattern.length > 0) {
        const pattern = volumePattern[0];
        pattern.occurrences += 1;
        pattern.accuracy = ((pattern.accuracy * (pattern.occurrences - 1)) + accuracy) / pattern.occurrences;
        pattern.lastSeen = prediction.createdAt;
        await this.patternRepository.save(pattern);
      } else {
        const newPattern = new PatternRecognition();
        newPattern.patternType = `VOLUME_${volumeCategory}`;
        newPattern.patternData = JSON.stringify({ 
          volumeCategory, 
          volume, 
          description: `Trading volume: ${volumeCategory}` 
        });
        newPattern.confidence = 50;
        newPattern.occurrences = 1;
        newPattern.accuracy = accuracy;
        newPattern.lastSeen = prediction.createdAt;
        newPattern.createdAt = new Date();
        await this.patternRepository.save(newPattern);
      }
    }
  }

  /**
   * Analyze cross-correlation patterns
   */
  private async analyzeCrossCorrelationPatterns(prediction: any, actualChangePercent: number): Promise<void> {
    // Find other stocks that moved in similar direction around the same time
    const timeWindow = 2 * 60 * 60 * 1000; // 2 hours
    const startTime = new Date(prediction.createdAt.getTime() - timeWindow);
    const endTime = new Date(prediction.createdAt.getTime() + timeWindow);
    
    const allStocks = await this.stockPricesService.findAllLatest();
    const correlatedMovements = [];
    
    for (const stock of allStocks.slice(0, 10)) { // Limit to first 10 stocks for performance
      if (stock.stockSymbol === prediction.stockSymbol) continue;
      
      const prices = await this.stockPricesService.findBySymbolAndDateRange(
        stock.stockSymbol,
        startTime,
        endTime
      );
      
      if (prices.length >= 2) {
        const startPrice = prices[0].last;
        const endPrice = prices[prices.length - 1].last;
        const changePercent = ((endPrice - startPrice) / startPrice) * 100;
        
        // Check if movement is correlated (same direction, similar magnitude)
        if (Math.abs(changePercent) > 2 && 
            Math.sign(changePercent) === Math.sign(actualChangePercent) &&
            Math.abs(changePercent - actualChangePercent) < 5) {
          correlatedMovements.push({
            symbol: stock.stockSymbol,
            changePercent: Math.round(changePercent * 100) / 100
          });
        }
      }
    }
    
    if (correlatedMovements.length > 0) {
      const correlationPattern = await this.patternRepository.findByPatternType('CORRELATION');
      if (correlationPattern.length > 0) {
        const pattern = correlationPattern[0];
        pattern.occurrences += 1;
        pattern.patternData = JSON.stringify({
          ...JSON.parse(pattern.patternData || '{}'),
          lastCorrelation: correlatedMovements,
          totalCorrelations: (JSON.parse(pattern.patternData || '{}').totalCorrelations || 0) + 1
        });
        pattern.lastSeen = prediction.createdAt;
        await this.patternRepository.save(pattern);
      } else {
        const newPattern = new PatternRecognition();
        newPattern.patternType = 'CORRELATION';
        newPattern.patternData = JSON.stringify({
          correlatedMovements,
          totalCorrelations: 1,
          description: 'Cross-stock correlation patterns'
        });
        newPattern.confidence = 60;
        newPattern.occurrences = 1;
        newPattern.accuracy = 70; // Base accuracy for correlation patterns
        newPattern.lastSeen = prediction.createdAt;
        newPattern.createdAt = new Date();
        await this.patternRepository.save(newPattern);
      }
    }
  }

  /**
   * Analyze seasonal patterns
   */
  private async analyzeSeasonalPatterns(predictionTime: Date, accuracy: number, actualChangePercent: number): Promise<void> {
    const month = predictionTime.getMonth();
    const quarter = Math.floor(month / 3) + 1;
    
    // Monthly pattern
    const monthPattern = await this.patternRepository.findByPatternType(`MONTH_${month + 1}`);
    if (monthPattern.length > 0) {
      const pattern = monthPattern[0];
      pattern.occurrences += 1;
      pattern.accuracy = ((pattern.accuracy * (pattern.occurrences - 1)) + accuracy) / pattern.occurrences;
      pattern.lastSeen = predictionTime;
      await this.patternRepository.save(pattern);
    } else {
      const newPattern = new PatternRecognition();
      newPattern.patternType = `MONTH_${month + 1}`;
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      newPattern.patternData = JSON.stringify({ 
        month: month + 1, 
        monthName: monthNames[month],
        description: `Predictions in ${monthNames[month]}`
      });
      newPattern.confidence = 50;
      newPattern.occurrences = 1;
      newPattern.accuracy = accuracy;
      newPattern.lastSeen = predictionTime;
      newPattern.createdAt = new Date();
      await this.patternRepository.save(newPattern);
    }
    
    // Quarterly pattern
    const quarterPattern = await this.patternRepository.findByPatternType(`QUARTER_${quarter}`);
    if (quarterPattern.length > 0) {
      const pattern = quarterPattern[0];
      pattern.occurrences += 1;
      pattern.accuracy = ((pattern.accuracy * (pattern.occurrences - 1)) + accuracy) / pattern.occurrences;
      pattern.lastSeen = predictionTime;
      await this.patternRepository.save(pattern);
    } else {
      const newPattern = new PatternRecognition();
      newPattern.patternType = `QUARTER_${quarter}`;
      newPattern.patternData = JSON.stringify({ 
        quarter, 
        description: `Q${quarter} predictions`
      });
      newPattern.confidence = 50;
      newPattern.occurrences = 1;
      newPattern.accuracy = accuracy;
      newPattern.lastSeen = predictionTime;
      newPattern.createdAt = new Date();
      await this.patternRepository.save(newPattern);
    }
  }

  /**
   * Generate daily learning report
   */
  async generateDailyLearningReport(): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const predictions = await this.reliabilityService.findByDateRange(today, new Date());
      
      const report = {
        date: today.toISOString().split('T')[0],
        totalPredictions: predictions.length,
        averageAccuracy: predictions.reduce((sum, p) => sum + (p.predictionAccuracy || 0), 0) / predictions.length,
        successfulPredictions: predictions.filter(p => (p.predictionAccuracy || 0) > 70).length,
        topPerformingRules: await this.getTopPerformingRules(),
        recommendations: await this.generateRecommendations(predictions),
        insights: await this.generateInsights(predictions),
      };
      
      this.logger.log('Daily Learning Report:', JSON.stringify(report, null, 2));
      
      // Save report to database
      await this.saveDailyReport(report);
      
    } catch (error) {
      this.logger.error('Error generating daily learning report:', error);
    }
  }

  /**
   * Get top performing prediction rules
   */
  private async getTopPerformingRules(): Promise<any[]> {
    const rules = await this.ruleRepository.findTopPerforming(10);
    
    return rules.map(rule => ({
      type: rule.ruleType,
      value: rule.ruleValue,
      accuracy: rule.averageAccuracy,
      successRate: rule.successRate,
      totalPredictions: rule.totalPredictions,
    }));
  }

  /**
   * Generate recommendations based on learning
   */
  private async generateRecommendations(predictions: any[]): Promise<string[]> {
    const recommendations: string[] = [];
    
    // Analyze category performance
    const categoryAccuracy = new Map<string, number[]>();
    predictions.forEach(p => {
      const category = p.article?.mainCategory;
      if (category) {
        if (!categoryAccuracy.has(category)) {
          categoryAccuracy.set(category, []);
        }
        categoryAccuracy.get(category)!.push(p.predictionAccuracy || 0);
      }
    });
    
    for (const [category, accuracies] of categoryAccuracy) {
      const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
      if (avgAccuracy > 75) {
        recommendations.push(`${category} kategorisindeki haberler %${avgAccuracy.toFixed(1)} doğrulukla tahmin edilebiliyor`);
      } else if (avgAccuracy < 50) {
        recommendations.push(`${category} kategorisindeki haberler için tahmin algoritması iyileştirilmeli`);
      }
    }
    
    return recommendations;
  }

  /**
   * Generate insights from prediction data
   */
  private async generateInsights(predictions: any[]): Promise<string[]> {
    const insights: string[] = [];
    
    // Time-based insights
    const hourlyAccuracy = new Map<number, number[]>();
    predictions.forEach(p => {
      const hour = p.createdAt.getHours();
      if (!hourlyAccuracy.has(hour)) {
        hourlyAccuracy.set(hour, []);
      }
      hourlyAccuracy.get(hour)!.push(p.predictionAccuracy || 0);
    });
    
    for (const [hour, accuracies] of hourlyAccuracy) {
      const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
      if (avgAccuracy > 80) {
        insights.push(`${hour}:00 saatlerinde yapılan tahminler %${avgAccuracy.toFixed(1)} doğrulukla sonuçlanıyor`);
      }
    }
    
    return insights;
  }

  /**
   * Save daily report to database
   */
  private async saveDailyReport(report: any): Promise<void> {
    try {
      const dailyReport = new DailyReport();
      dailyReport.reportDate = new Date(report.date);
      dailyReport.reportData = JSON.stringify(report);
      dailyReport.totalArticles = report.totalPredictions || 0;
      dailyReport.totalPredictions = report.totalPredictions || 0;
      dailyReport.averageAccuracy = report.averageAccuracy || 0;
      dailyReport.topGainers = JSON.stringify(report.topPerformingRules || []);
      dailyReport.topLosers = JSON.stringify([]); // Not applicable for learning reports
      dailyReport.insights = JSON.stringify(report.recommendations || []);
      dailyReport.recommendations = JSON.stringify(report.recommendations || []);
      dailyReport.createdAt = new Date();
      dailyReport.updatedAt = new Date();
      
      await this.dailyReportRepository.save(dailyReport);
      
      this.logger.log(`Daily learning report saved for ${report.date}`);
    } catch (error) {
      this.logger.error('Error saving daily learning report:', error);
    }
  }

  /**
   * Update learning system with missed opportunity data
   */
  async updateWithMissedOpportunity(analysis: any): Promise<void> {
    try {
      this.logger.log(`Learning from missed opportunity: ${analysis.stockSymbol} moved ${analysis.movementPercent}%`);
      
      // 1. Update rules to be more sensitive to certain patterns
      await this.updateRulesForMissedOpportunity(analysis);
      
      // 2. Adjust confidence thresholds
      await this.adjustConfidenceThresholds(analysis);
      
      // 3. Learn from the reasons why we missed it
      await this.learnFromMissedReasons(analysis);
      
      // 4. Create pattern for missed opportunity
      await this.createMissedOpportunityPattern(analysis);
      
    } catch (error) {
      this.logger.error('Error learning from missed opportunity:', error);
    }
  }

  /**
   * Update rules based on missed opportunity
   */
  private async updateRulesForMissedOpportunity(analysis: any): Promise<void> {
    // Update category rules to be more sensitive
    for (const category of analysis.newsCategories) {
      const rule = await this.findOrCreateRule(RuleTypeEnum.CATEGORY, category);
      
      // Increase sensitivity for categories that led to missed opportunities
      rule.averageChangePercent = rule.averageChangePercent * 1.1; // Increase sensitivity by 10%
      rule.lastUpdated = new Date();
      
      await this.ruleRepository.save(rule);
    }
  }

  /**
   * Adjust confidence thresholds based on missed opportunities
   */
  private async adjustConfidenceThresholds(analysis: any): Promise<void> {
    // Create a pattern for confidence threshold adjustment
    const thresholdPattern = await this.patternRepository.findByPatternType('CONFIDENCE_THRESHOLD');
    
    if (thresholdPattern.length > 0) {
      const pattern = thresholdPattern[0];
      pattern.occurrences += 1;
      pattern.patternData = JSON.stringify({
        ...JSON.parse(pattern.patternData || '{}'),
        missedOpportunities: (JSON.parse(pattern.patternData || '{}').missedOpportunities || 0) + 1,
        lastMissedOpportunity: {
          symbol: analysis.stockSymbol,
          movementPercent: analysis.movementPercent,
          averageSentiment: analysis.averageSentiment
        }
      });
      pattern.lastSeen = new Date();
      await this.patternRepository.save(pattern);
    } else {
      const newPattern = new PatternRecognition();
      newPattern.patternType = 'CONFIDENCE_THRESHOLD';
      newPattern.patternData = JSON.stringify({
        missedOpportunities: 1,
        lastMissedOpportunity: {
          symbol: analysis.stockSymbol,
          movementPercent: analysis.movementPercent,
          averageSentiment: analysis.averageSentiment
        },
        description: 'Confidence threshold adjustment patterns'
      });
      newPattern.confidence = 70;
      newPattern.occurrences = 1;
      newPattern.accuracy = 0; // No accuracy for missed opportunities
      newPattern.lastSeen = new Date();
      newPattern.createdAt = new Date();
      await this.patternRepository.save(newPattern);
    }
  }

  /**
   * Learn from missed reasons
   */
  private async learnFromMissedReasons(analysis: any): Promise<void> {
    for (const reason of analysis.missedReasons) {
      const reasonPattern = await this.patternRepository.findByPatternType(`MISSED_REASON_${reason.replace(/\s+/g, '_').toUpperCase()}`);
      
      if (reasonPattern.length > 0) {
        const pattern = reasonPattern[0];
        pattern.occurrences += 1;
        pattern.lastSeen = new Date();
        await this.patternRepository.save(pattern);
      } else {
        const newPattern = new PatternRecognition();
        newPattern.patternType = `MISSED_REASON_${reason.replace(/\s+/g, '_').toUpperCase()}`;
        newPattern.patternData = JSON.stringify({
          reason,
          description: `Pattern for missed opportunity reason: ${reason}`
        });
        newPattern.confidence = 60;
        newPattern.occurrences = 1;
        newPattern.accuracy = 0;
        newPattern.lastSeen = new Date();
        newPattern.createdAt = new Date();
        await this.patternRepository.save(newPattern);
      }
    }
  }

  /**
   * Create pattern for missed opportunity
   */
  private async createMissedOpportunityPattern(analysis: any): Promise<void> {
    const missedPattern = await this.patternRepository.findByPatternType('MISSED_OPPORTUNITY');
    
    if (missedPattern.length > 0) {
      const pattern = missedPattern[0];
      pattern.occurrences += 1;
      pattern.patternData = JSON.stringify({
        ...JSON.parse(pattern.patternData || '{}'),
        totalMissed: (JSON.parse(pattern.patternData || '{}').totalMissed || 0) + 1,
        lastMissed: {
          symbol: analysis.stockSymbol,
          movementPercent: analysis.movementPercent,
          precedingNewsCount: analysis.precedingNewsCount,
          averageSentiment: analysis.averageSentiment
        }
      });
      pattern.lastSeen = new Date();
      await this.patternRepository.save(pattern);
    } else {
      const newPattern = new PatternRecognition();
      newPattern.patternType = 'MISSED_OPPORTUNITY';
      newPattern.patternData = JSON.stringify({
        totalMissed: 1,
        lastMissed: {
          symbol: analysis.stockSymbol,
          movementPercent: analysis.movementPercent,
          precedingNewsCount: analysis.precedingNewsCount,
          averageSentiment: analysis.averageSentiment
        },
        description: 'General missed opportunity patterns'
      });
      newPattern.confidence = 50;
      newPattern.occurrences = 1;
      newPattern.accuracy = 0;
      newPattern.lastSeen = new Date();
      newPattern.createdAt = new Date();
      await this.patternRepository.save(newPattern);
    }
  }

  /**
   * Update learning system with retrospective data
   */
  async updateWithRetrospectiveData(retrospectiveData: any): Promise<void> {
    try {
      this.logger.log(`Learning from retrospective analysis: ${retrospectiveData.movement.symbol}`);
      
      // 1. Update patterns based on retrospective findings
      await this.updatePatternsFromRetrospective(retrospectiveData);
      
      // 2. Adjust prediction algorithms
      await this.adjustPredictionAlgorithms(retrospectiveData);
      
      // 3. Learn from market-wide movements
      await this.learnFromMarketMovements(retrospectiveData);
      
      // 4. Update rules based on retrospective insights
      await this.updateRulesFromRetrospective(retrospectiveData);
      
    } catch (error) {
      this.logger.error('Error learning from retrospective data:', error);
    }
  }

  /**
   * Update patterns based on retrospective findings
   */
  private async updatePatternsFromRetrospective(retrospectiveData: any): Promise<void> {
    const movement = retrospectiveData.movement;
    const precedingNews = retrospectiveData.precedingNews;
    
    // Create pattern for retrospective movement
    const retrospectivePattern = await this.patternRepository.findByPatternType('RETROSPECTIVE_MOVEMENT');
    
    if (retrospectivePattern.length > 0) {
      const pattern = retrospectivePattern[0];
      pattern.occurrences += 1;
      pattern.patternData = JSON.stringify({
        ...JSON.parse(pattern.patternData || '{}'),
        totalRetrospective: (JSON.parse(pattern.patternData || '{}').totalRetrospective || 0) + 1,
        lastMovement: {
          symbol: movement.symbol,
          movementPercent: movement.changePercent,
          precedingNewsCount: precedingNews.length,
          analysisDate: retrospectiveData.analysisDate
        }
      });
      pattern.lastSeen = new Date();
      await this.patternRepository.save(pattern);
    } else {
      const newPattern = new PatternRecognition();
      newPattern.patternType = 'RETROSPECTIVE_MOVEMENT';
      newPattern.patternData = JSON.stringify({
        totalRetrospective: 1,
        lastMovement: {
          symbol: movement.symbol,
          movementPercent: movement.changePercent,
          precedingNewsCount: precedingNews.length,
          analysisDate: retrospectiveData.analysisDate
        },
        description: 'Retrospective movement analysis patterns'
      });
      newPattern.confidence = 70;
      newPattern.occurrences = 1;
      newPattern.accuracy = 0;
      newPattern.lastSeen = new Date();
      newPattern.createdAt = new Date();
      await this.patternRepository.save(newPattern);
    }
  }

  /**
   * Adjust prediction algorithms based on retrospective data
   */
  private async adjustPredictionAlgorithms(retrospectiveData: any): Promise<void> {
    const movement = retrospectiveData.movement;
    const existingPredictions = retrospectiveData.existingPredictions;
    
    // Analyze prediction accuracy for this movement
    if (existingPredictions.length > 0) {
      const avgAccuracy = existingPredictions.reduce((sum: number, p: any) => sum + (p.predictionAccuracy || 0), 0) / existingPredictions.length;
      
      // Create algorithm adjustment pattern
      const algorithmPattern = await this.patternRepository.findByPatternType('ALGORITHM_ADJUSTMENT');
      
      if (algorithmPattern.length > 0) {
        const pattern = algorithmPattern[0];
        pattern.occurrences += 1;
        pattern.accuracy = ((pattern.accuracy * (pattern.occurrences - 1)) + avgAccuracy) / pattern.occurrences;
        pattern.patternData = JSON.stringify({
          ...JSON.parse(pattern.patternData || '{}'),
          adjustments: (JSON.parse(pattern.patternData || '{}').adjustments || 0) + 1,
          lastAdjustment: {
            symbol: movement.symbol,
            averageAccuracy: avgAccuracy,
            predictionCount: existingPredictions.length
          }
        });
        pattern.lastSeen = new Date();
        await this.patternRepository.save(pattern);
      } else {
        const newPattern = new PatternRecognition();
        newPattern.patternType = 'ALGORITHM_ADJUSTMENT';
        newPattern.patternData = JSON.stringify({
          adjustments: 1,
          lastAdjustment: {
            symbol: movement.symbol,
            averageAccuracy: avgAccuracy,
            predictionCount: existingPredictions.length
          },
          description: 'Algorithm adjustment patterns based on retrospective analysis'
        });
        newPattern.confidence = 80;
        newPattern.occurrences = 1;
        newPattern.accuracy = avgAccuracy;
        newPattern.lastSeen = new Date();
        newPattern.createdAt = new Date();
        await this.patternRepository.save(newPattern);
      }
    }
  }

  /**
   * Learn from market-wide movements
   */
  private async learnFromMarketMovements(retrospectiveData: any): Promise<void> {
    const relatedMovements = retrospectiveData.relatedMovements;
    
    if (relatedMovements.length > 0) {
      const marketPattern = await this.patternRepository.findByPatternType('MARKET_WIDE_MOVEMENT');
      
      if (marketPattern.length > 0) {
        const pattern = marketPattern[0];
        pattern.occurrences += 1;
        pattern.patternData = JSON.stringify({
          ...JSON.parse(pattern.patternData || '{}'),
          marketMovements: (JSON.parse(pattern.patternData || '{}').marketMovements || 0) + 1,
          lastMarketMovement: {
            relatedMovementsCount: relatedMovements.length,
            averageMovement: relatedMovements.reduce((sum: number, m: any) => sum + Math.abs(m.changePercent), 0) / relatedMovements.length
          }
        });
        pattern.lastSeen = new Date();
        await this.patternRepository.save(pattern);
      } else {
        const newPattern = new PatternRecognition();
        newPattern.patternType = 'MARKET_WIDE_MOVEMENT';
        newPattern.patternData = JSON.stringify({
          marketMovements: 1,
          lastMarketMovement: {
            relatedMovementsCount: relatedMovements.length,
            averageMovement: relatedMovements.reduce((sum: number, m: any) => sum + Math.abs(m.changePercent), 0) / relatedMovements.length
          },
          description: 'Market-wide movement patterns'
        });
        newPattern.confidence = 75;
        newPattern.occurrences = 1;
        newPattern.accuracy = 70;
        newPattern.lastSeen = new Date();
        newPattern.createdAt = new Date();
        await this.patternRepository.save(newPattern);
      }
    }
  }

  /**
   * Update rules based on retrospective insights
   */
  private async updateRulesFromRetrospective(retrospectiveData: any): Promise<void> {
    const movement = retrospectiveData.movement;
    const precedingNews = retrospectiveData.precedingNews;
    
    // Update rules based on news categories that preceded significant movements
    const categoryCounts = new Map<string, number>();
    precedingNews.forEach((news: any) => {
      const category = news.mainCategory || 'UNKNOWN';
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    });
    
    for (const [category, count] of categoryCounts) {
      const rule = await this.findOrCreateRule(RuleTypeEnum.CATEGORY, category);
      
      // Increase sensitivity for categories that preceded significant movements
      if (Math.abs(movement.changePercent) > 5) {
        rule.averageChangePercent = rule.averageChangePercent * 1.05; // Increase sensitivity by 5%
        rule.lastUpdated = new Date();
        await this.ruleRepository.save(rule);
      }
    }
  }
}
