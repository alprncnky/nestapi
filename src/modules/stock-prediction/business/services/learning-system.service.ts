import { Injectable, Logger } from '@nestjs/common';
import { NewsReliabilityService } from '../../../news-reliability/business/services/news-reliability.service';
import { PredictionRuleRepository } from '../../data/repositories/prediction-rule.repository';
import { PredictionRule } from '../../data/entities/prediction-rule.entity';
import { RuleTypeEnum } from '../../contracts/enums/rule-type.enum';

@Injectable()
export class LearningSystemService {
  private readonly logger = new Logger(LearningSystemService.name);

  constructor(
    private readonly reliabilityService: NewsReliabilityService,
    private readonly ruleRepository: PredictionRuleRepository,
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
    // TODO: Implement advanced pattern analysis
    // - Time-based patterns (hour of day, day of week)
    // - Market condition patterns (volatility, volume)
    // - Cross-correlation patterns between different stocks
    // - Seasonal patterns
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
    // TODO: Implement daily report saving
    this.logger.debug('Saving daily learning report to database');
  }

  /**
   * Update learning system with missed opportunity data
   */
  async updateWithMissedOpportunity(analysis: any): Promise<void> {
    this.logger.log(`Learning from missed opportunity: ${analysis.stockSymbol} moved ${analysis.movementPercent}%`);
    
    // TODO: Implement missed opportunity learning
    // - Update rules to be more sensitive to certain patterns
    // - Adjust confidence thresholds
    // - Learn from the reasons why we missed it
  }

  /**
   * Update learning system with retrospective data
   */
  async updateWithRetrospectiveData(retrospectiveData: any): Promise<void> {
    this.logger.log(`Learning from retrospective analysis: ${retrospectiveData.movement.symbol}`);
    
    // TODO: Implement retrospective learning
    // - Update patterns based on retrospective findings
    // - Adjust prediction algorithms
    // - Learn from market-wide movements
  }
}
