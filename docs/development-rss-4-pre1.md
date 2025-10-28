# Stock Prediction & Learning System - Advanced Implementation

## 📋 Document Overview

**Document Purpose**: This document outlines the implementation of an advanced stock prediction and learning system that analyzes news articles, makes predictions about stock movements, tracks actual outcomes, and continuously improves its accuracy through machine learning.

**Target Audience**: Development team implementing the prediction engine
**Document Version**: 1.0
**Last Updated**: 2025-01-26
**Status**: Implementation Ready

---

## 🎯 System Architecture Overview

### Core Philosophy
**"Learn from Every Prediction & Every Market Movement"** - The system creates a dual-loop learning architecture:

#### **Prediction Loop** (Real-time)
1. **News Analysis** → AI generates stock predictions
2. **Real-time Tracking** → Monitor actual stock price movements  
3. **Outcome Evaluation** → Compare predictions with reality
4. **Learning & Improvement** → Update rules and algorithms based on results

#### **Retrospective Learning Loop** (Batch Processing)
1. **Market Movement Detection** → Identify significant stock movements
2. **Backward News Analysis** → Analyze news that preceded the movement
3. **Pattern Recognition** → Discover missed patterns and correlations
4. **System Enhancement** → Improve prediction algorithms and rules

### Key Considerations
- **Multi-source News**: Multiple sources may report the same event
- **Non-stock News**: Not all news mentions stocks directly
- **Similar Stocks**: Related stocks may be affected by the same news
- **Holistic Analysis**: System needs to see the complete picture
- **Learning Phases**: Both predictive and retrospective learning modes

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   News Module   │───▶│ Prediction      │───▶│ Stock Prices    │
│ (Multi-source)  │    │ Engine          │    │ Module          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ News Reliability │◀───│ Actual Impact   │◀───│ Learning        │
│ Tracking         │    │ Tracker         │    │ System          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Retrospective    │    │ News Clustering  │    │ Pattern         │
│ Learning Engine  │◀───│ & Correlation    │◀───│ Recognition     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Daily Reports    │    │ Prediction      │    │ Dashboard       │
│ & Analytics      │    │ Rules           │    │ Integration     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🏗️ Module Structure

### New Module: `stock-prediction/`

```
src/modules/stock-prediction/
├── controllers/
│   └── stock-prediction.controller.ts
├── business/
│   ├── services/
│   │   ├── prediction-engine.service.ts      # Core prediction logic
│   │   ├── actual-impact-tracker.service.ts  # Real-time outcome tracking
│   │   ├── learning-system.service.ts        # ML and rule learning
│   │   ├── daily-report.service.ts           # Analytics and reporting
│   │   ├── retrospective-learning.service.ts # Backward analysis engine
│   │   ├── news-clustering.service.ts        # Multi-source news grouping
│   │   └── pattern-recognition.service.ts    # Advanced pattern analysis
│   └── orchestration/
│       └── schedules/
│           ├── prediction-processor.schedule.ts
│           ├── daily-analysis.schedule.ts
│           └── retrospective-learning.schedule.ts
├── data/
│   ├── entities/
│   │   ├── prediction-rule.entity.ts
│   │   ├── daily-report.entity.ts
│   │   ├── prediction-insight.entity.ts
│   │   ├── news-cluster.entity.ts
│   │   ├── retrospective-analysis.entity.ts
│   │   └── pattern-recognition.entity.ts
│   ├── repositories/
│   │   ├── prediction-rule.repository.ts
│   │   ├── daily-report.repository.ts
│   │   ├── prediction-insight.repository.ts
│   │   ├── news-cluster.repository.ts
│   │   ├── retrospective-analysis.repository.ts
│   │   └── pattern-recognition.repository.ts
│   └── schemas/
│       ├── prediction-rule.schema.ts
│       ├── daily-report.schema.ts
│       ├── prediction-insight.schema.ts
│       ├── news-cluster.schema.ts
│       ├── retrospective-analysis.schema.ts
│       └── pattern-recognition.schema.ts
└── contracts/
    ├── requests/
    │   ├── create-prediction.dto.ts
    │   ├── update-prediction.dto.ts
    │   ├── retrospective-analysis.dto.ts
    │   └── mapping.ts
    ├── responses/
    │   ├── prediction-response.dto.ts
    │   ├── daily-report-response.dto.ts
    │   ├── retrospective-analysis-response.dto.ts
    │   └── mapping.ts
    └── enums/
        ├── prediction-status.enum.ts
        ├── rule-type.enum.ts
        ├── insight-type.enum.ts
        ├── learning-mode.enum.ts
        └── cluster-type.enum.ts
```

---

## 🔧 Implementation Details

### 1. Prediction Engine Service

**File**: `src/modules/stock-prediction/business/services/prediction-engine.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { NewsService } from '../../news/news.service';
import { StockPricesService } from '../../stock-prices/business/services/stock-prices.service';
import { NewsReliabilityService } from '../../news-reliability/business/services/news-reliability.service';
import { OpenAIService } from '../../../common/services/openai.service';
import { PredictionImpactEnum } from '../contracts/enums/prediction-impact.enum';
import { Cron, CronExpression } from '@nestjs/schedule';

export interface StockPrediction {
  impact: PredictionImpactEnum;
  changePercent: number;
  confidence: number;
  reasoning: string;
  timeWindow: string;
  factors: string[];
}

@Injectable()
export class PredictionEngineService {
  private readonly logger = new Logger(PredictionEngineService.name);

  constructor(
    private readonly newsService: NewsService,
    private readonly stockPricesService: StockPricesService,
    private readonly reliabilityService: NewsReliabilityService,
    private readonly openaiService: OpenAIService,
  ) {}

  /**
   * Main prediction function - Analyzes news and generates stock predictions
   * Runs every 15 minutes to process new articles
   */
  @Cron(CronExpression.EVERY_15_MINUTES)
  async processNewArticles(): Promise<void> {
    try {
      // Get articles processed in the last 15 minutes
      const recentArticles = await this.newsService.findRecentProcessedArticles(15);
      
      for (const article of recentArticles) {
        await this.predictStockImpact(article.id);
      }
      
      this.logger.log(`Processed ${recentArticles.length} articles for predictions`);
    } catch (error) {
      this.logger.error('Error in prediction processing:', error);
    }
  }

  /**
   * Generate predictions for a specific article
   */
  async predictStockImpact(articleId: number): Promise<void> {
    try {
      const article = await this.newsService.findById(articleId);
      const stockMentions = await this.newsService.getStockMentions(articleId);
      
      if (stockMentions.length === 0) {
        this.logger.debug(`No stock mentions found for article ${articleId}`);
        return;
      }
      
      for (const mention of stockMentions) {
        // 1. Generate AI prediction
        const prediction = await this.generatePrediction(article, mention);
        
        // 2. Apply learning rules
        const adjustedPrediction = await this.applyLearningRules(prediction, article);
        
        // 3. Save prediction
        await this.reliabilityService.save({
          articleId: article.id,
          stockSymbol: mention.stockSymbol,
          predictedImpact: adjustedPrediction.impact,
          predictedChangePercent: adjustedPrediction.changePercent,
          predictionConfidence: adjustedPrediction.confidence,
          timeWindow: adjustedPrediction.timeWindow,
        });
        
        this.logger.log(
          `Prediction created for ${mention.stockSymbol}: ${adjustedPrediction.impact} ${adjustedPrediction.changePercent}% (confidence: ${adjustedPrediction.confidence}%)`
        );
      }
    } catch (error) {
      this.logger.error(`Failed to predict impact for article ${articleId}:`, error);
    }
  }

  /**
   * Generate AI-powered prediction using OpenAI
   */
  private async generatePrediction(article: any, stockMention: any): Promise<StockPrediction> {
    const prompt = `
Türkçe finansal haber analizi yaparak hisse senedi tahmini yap.

HABER BAŞLIĞI: ${article.title}
HABER İÇERİĞİ: ${article.contentPlain?.substring(0, 1500)}
HİSSE KODU: ${stockMention.stockSymbol}
HABER SENTIMENT: ${article.sentimentScore}
HABER KATEGORİSİ: ${article.mainCategory}
ETKİ SEVİYESİ: ${article.impactLevel}

Geçmiş başarılı tahminlerden öğrenilen kurallar:
- Pozitif haberler genellikle %2-8 artış getirir
- Negatif haberler %3-12 düşüş getirir  
- Yüksek impact haberler daha büyük değişimler yaratır
- Şirket haberleri daha güvenilir tahminlerdir
- Makro ekonomi haberleri daha geniş etki yaratır

JSON formatında dön:
{
  "impact": "UP/DOWN/NEUTRAL",
  "changePercent": -15 ile +15 arası sayı,
  "confidence": 0-100 arası güven skoru,
  "reasoning": "tahmin gerekçesi",
  "timeWindow": "1H/4H/1D/1W",
  "factors": ["faktör1", "faktör2"]
}
`;

    try {
      const response = await this.openaiService.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 500,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        impact: result.impact as PredictionImpactEnum,
        changePercent: result.changePercent || 0,
        confidence: result.confidence || 50,
        reasoning: result.reasoning || 'AI analysis',
        timeWindow: result.timeWindow || '1D',
        factors: result.factors || [],
      };
    } catch (error) {
      this.logger.error('AI prediction failed:', error);
      
      // Fallback to rule-based prediction
      return this.generateRuleBasedPrediction(article, stockMention);
    }
  }

  /**
   * Fallback rule-based prediction when AI fails
   */
  private generateRuleBasedPrediction(article: any, stockMention: any): StockPrediction {
    let impact = PredictionImpactEnum.NEUTRAL;
    let changePercent = 0;
    let confidence = 30;

    // Sentiment-based rules
    if (article.sentimentScore > 0.3) {
      impact = PredictionImpactEnum.UP;
      changePercent = Math.min(8, article.sentimentScore * 15);
      confidence = 60;
    } else if (article.sentimentScore < -0.3) {
      impact = PredictionImpactEnum.DOWN;
      changePercent = Math.max(-12, article.sentimentScore * 15);
      confidence = 60;
    }

    // Impact level adjustment
    if (article.impactLevel === 'HIGH') {
      changePercent *= 1.5;
      confidence += 10;
    } else if (article.impactLevel === 'LOW') {
      changePercent *= 0.5;
      confidence -= 10;
    }

    return {
      impact,
      changePercent: Math.round(changePercent * 100) / 100,
      confidence: Math.max(10, Math.min(90, confidence)),
      reasoning: 'Rule-based fallback prediction',
      timeWindow: '1D',
      factors: ['sentiment', 'impact_level'],
    };
  }

  /**
   * Apply learned rules to adjust prediction
   */
  private async applyLearningRules(prediction: StockPrediction, article: any): Promise<StockPrediction> {
    // TODO: Implement rule application logic
    // This will be implemented in LearningSystemService
    return prediction;
  }
}
```

### 2. Actual Impact Tracker Service

**File**: `src/modules/stock-prediction/business/services/actual-impact-tracker.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StockPricesService } from '../../stock-prices/business/services/stock-prices.service';
import { NewsReliabilityService } from '../../news-reliability/business/services/news-reliability.service';
import { PredictionImpactEnum } from '../contracts/enums/prediction-impact.enum';

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
  @Cron(CronExpression.EVERY_30_MINUTES)
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
    const timeMap = {
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
```

### 3. Learning System Service

**File**: `src/modules/stock-prediction/business/services/learning-system.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { NewsReliabilityService } from '../../news-reliability/business/services/news-reliability.service';
import { PredictionRuleRepository } from '../data/repositories/prediction-rule.repository';
import { PredictionRule } from '../data/entities/prediction-rule.entity';
import { RuleTypeEnum } from '../contracts/enums/rule-type.enum';

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
  @Cron(CronExpression.EVERY_DAY_AT_6PM)
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
}
```

### 4. Retrospective Learning Service

**File**: `src/modules/stock-prediction/business/services/retrospective-learning.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StockPricesService } from '../../stock-prices/business/services/stock-prices.service';
import { NewsService } from '../../news/news.service';
import { NewsReliabilityService } from '../../news-reliability/business/services/news-reliability.service';
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
  @Cron(CronExpression.EVERY_DAY_AT_7PM)
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
```

### 5. News Clustering Service

**File**: `src/modules/stock-prediction/business/services/news-clustering.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { NewsService } from '../../news/news.service';
import { NewsCluster } from '../data/entities/news-cluster.entity';
import { NewsClusterRepository } from '../data/repositories/news-cluster.repository';
import { ClusterTypeEnum } from '../contracts/enums/cluster-type.enum';

@Injectable()
export class NewsClusteringService {
  private readonly logger = new Logger(NewsClusteringService.name);

  constructor(
    private readonly newsService: NewsService,
    private readonly clusterRepository: NewsClusterRepository,
  ) {}

  /**
   * Cluster related news articles
   */
  async clusterRelatedNews(articleId: number): Promise<void> {
    try {
      const article = await this.newsService.findById(articleId);
      
      // 1. Find similar articles by content
      const contentSimilar = await this.findSimilarByContent(article);
      
      // 2. Find similar articles by stock mentions
      const stockSimilar = await this.findSimilarByStockMentions(article);
      
      // 3. Find similar articles by time proximity
      const timeSimilar = await this.findSimilarByTime(article);
      
      // 4. Combine and deduplicate
      const allSimilar = [...new Set([...contentSimilar, ...stockSimilar, ...timeSimilar])];
      
      if (allSimilar.length > 1) {
        // 5. Create or update cluster
        await this.createOrUpdateCluster(article, allSimilar);
      }
      
    } catch (error) {
      this.logger.error(`Error clustering news for article ${articleId}:`, error);
    }
  }

  /**
   * Find similar articles by content similarity
   */
  private async findSimilarByContent(article: any): Promise<number[]> {
    // Get articles from the same day
    const sameDayArticles = await this.newsService.findByDateRange(
      new Date(article.publishedAt.getTime() - 24 * 60 * 60 * 1000),
      new Date(article.publishedAt.getTime() + 24 * 60 * 60 * 1000)
    );
    
    const similar: number[] = [];
    
    for (const otherArticle of sameDayArticles) {
      if (otherArticle.id === article.id) continue;
      
      // Calculate content similarity
      const similarity = this.calculateContentSimilarity(article, otherArticle);
      
      if (similarity > 0.7) { // 70% similarity threshold
        similar.push(otherArticle.id);
      }
    }
    
    return similar;
  }

  /**
   * Calculate content similarity between two articles
   */
  private calculateContentSimilarity(article1: any, article2: any): number {
    // Simple keyword-based similarity
    const keywords1 = this.extractKeywords(article1.title + ' ' + (article1.contentPlain || ''));
    const keywords2 = this.extractKeywords(article2.title + ' ' + (article2.contentPlain || ''));
    
    const intersection = keywords1.filter(k => keywords2.includes(k));
    const union = [...new Set([...keywords1, ...keywords2])];
    
    return union.length > 0 ? intersection.length / union.length : 0;
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    const stopwords = new Set(['bir', 'bu', 've', 'ile', 'için', 'olan', 'ancak', 'gibi', 'daha', 'çok']);
    
    return text
      .toLowerCase()
      .match(/\b[a-zçğıöşü]{3,}\b/g) || []
      .filter(word => !stopwords.has(word))
      .slice(0, 20); // Top 20 keywords
  }

  /**
   * Find similar articles by stock mentions
   */
  private async findSimilarByStockMentions(article: any): Promise<number[]> {
    const stockMentions = await this.newsService.getStockMentions(article.id);
    
    if (stockMentions.length === 0) return [];
    
    const similar: number[] = [];
    
    for (const mention of stockMentions) {
      // Find other articles mentioning the same stock
      const relatedArticles = await this.reliabilityService.findByStockAndDateRange(
        mention.stockSymbol,
        new Date(article.publishedAt.getTime() - 24 * 60 * 60 * 1000),
        new Date(article.publishedAt.getTime() + 24 * 60 * 60 * 1000)
      );
      
      similar.push(...relatedArticles.map(r => r.articleId));
    }
    
    return [...new Set(similar)];
  }

  /**
   * Find similar articles by time proximity
   */
  private async findSimilarByTime(article: any): Promise<number[]> {
    const timeWindow = 2 * 60 * 60 * 1000; // 2 hours
    const startTime = new Date(article.publishedAt.getTime() - timeWindow);
    const endTime = new Date(article.publishedAt.getTime() + timeWindow);
    
    const nearbyArticles = await this.newsService.findByDateRange(startTime, endTime);
    
    return nearbyArticles
      .filter(a => a.id !== article.id)
      .map(a => a.id);
  }

  /**
   * Create or update news cluster
   */
  private async createOrUpdateCluster(mainArticle: any, similarArticles: number[]): Promise<void> {
    // Check if main article is already in a cluster
    const existingCluster = await this.clusterRepository.findByArticleId(mainArticle.id);
    
    if (existingCluster) {
      // Update existing cluster
      await this.updateCluster(existingCluster, similarArticles);
    } else {
      // Create new cluster
      await this.createNewCluster(mainArticle, similarArticles);
    }
  }

  /**
   * Create new cluster
   */
  private async createNewCluster(mainArticle: any, similarArticles: number[]): Promise<void> {
    const cluster = new NewsCluster();
    cluster.clusterType = ClusterTypeEnum.CONTENT_SIMILARITY;
    cluster.mainArticleId = mainArticle.id;
    cluster.articleIds = JSON.stringify([mainArticle.id, ...similarArticles]);
    cluster.clusterScore = this.calculateClusterScore(mainArticle, similarArticles);
    cluster.createdAt = new Date();
    
    await this.clusterRepository.save(cluster);
    
    this.logger.log(`Created new cluster with ${similarArticles.length + 1} articles`);
  }

  /**
   * Update existing cluster
   */
  private async updateCluster(cluster: NewsCluster, newArticles: number[]): Promise<void> {
    const existingArticles = JSON.parse(cluster.articleIds);
    const allArticles = [...new Set([...existingArticles, ...newArticles])];
    
    cluster.articleIds = JSON.stringify(allArticles);
    cluster.clusterScore = this.calculateClusterScore(cluster.mainArticle, allArticles);
    cluster.updatedAt = new Date();
    
    await this.clusterRepository.save(cluster);
    
    this.logger.log(`Updated cluster with ${allArticles.length} articles`);
  }

  /**
   * Calculate cluster score
   */
  private calculateClusterScore(mainArticle: any, articleIds: number[]): number {
    // Simple scoring based on article count and similarity
    return Math.min(100, articleIds.length * 20);
  }
}
```

### 6. Daily Report Service

**File**: `src/modules/stock-prediction/business/services/daily-report.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsService } from '../../news/news.service';
import { StockPricesService } from '../../stock-prices/business/services/stock-prices.service';
import { NewsReliabilityService } from '../../news-reliability/business/services/news-reliability.service';

export interface DailyReport {
  date: string;
  newsStats: {
    totalArticles: number;
    processedArticles: number;
    categories: Record<string, number>;
    sentimentDistribution: Record<string, number>;
  };
  stockPerformance: {
    totalStocks: number;
    gainers: number;
    losers: number;
    averageChange: number;
  };
  predictionAccuracy: {
    totalPredictions: number;
    averageAccuracy: number;
    successfulPredictions: number;
    categoryBreakdown: Record<string, number>;
  };
  topMovers: {
    topGainers: any[];
    topLosers: any[];
  };
  insights: string[];
  recommendations: string[];
}

@Injectable()
export class DailyReportService {
  private readonly logger = new Logger(DailyReportService.name);

  constructor(
    private readonly newsService: NewsService,
    private readonly stockPricesService: StockPricesService,
    private readonly reliabilityService: NewsReliabilityService,
  ) {}

  /**
   * Generate daily analysis report at 6 PM
   */
  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async generateDailyAnalysis(): Promise<void> {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      this.logger.log('Generating daily analysis report...');
      
      // 1. Daily news statistics
      const newsStats = await this.getDailyNewsStats(yesterday, today);
      
      // 2. Stock performance analysis
      const stockPerformance = await this.analyzeStockPerformance(yesterday, today);
      
      // 3. Prediction accuracy analysis
      const predictionAccuracy = await this.analyzePredictionAccuracy(yesterday, today);
      
      // 4. Top movers analysis
      const topMovers = await this.findTopMovers(yesterday, today);
      
      // 5. Generate insights
      const insights = await this.generateInsights(newsStats, stockPerformance, predictionAccuracy);
      
      // 6. Generate recommendations
      const recommendations = await this.generateRecommendations(predictionAccuracy);
      
      // 7. Create comprehensive report
      const report: DailyReport = {
        date: yesterday.toISOString().split('T')[0],
        newsStats,
        stockPerformance,
        predictionAccuracy,
        topMovers,
        insights,
        recommendations,
      };
      
      this.logger.log('Daily Analysis Report Generated:', JSON.stringify(report, null, 2));
      
      // Save report
      await this.saveDailyReport(report);
      
    } catch (error) {
      this.logger.error('Error generating daily analysis:', error);
    }
  }

  /**
   * Get daily news statistics
   */
  private async getDailyNewsStats(startDate: Date, endDate: Date): Promise<any> {
    const articles = await this.newsService.findByDateRange(startDate, endDate);
    
    const categories = {};
    const sentimentDistribution = { positive: 0, negative: 0, neutral: 0 };
    
    articles.forEach(article => {
      // Category distribution
      const category = article.mainCategory || 'UNKNOWN';
      categories[category] = (categories[category] || 0) + 1;
      
      // Sentiment distribution
      if (article.sentimentScore > 0.3) {
        sentimentDistribution.positive++;
      } else if (article.sentimentScore < -0.3) {
        sentimentDistribution.negative++;
      } else {
        sentimentDistribution.neutral++;
      }
    });
    
    return {
      totalArticles: articles.length,
      processedArticles: articles.filter(a => a.status === 'PROCESSED').length,
      categories,
      sentimentDistribution,
    };
  }

  /**
   * Analyze stock performance
   */
  private async analyzeStockPerformance(startDate: Date, endDate: Date): Promise<any> {
    const allStocks = await this.stockPricesService.findAllLatest();
    const performance = [];
    
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
        
        performance.push({
          symbol: stock.stockSymbol,
          name: stock.stockName,
          changePercent,
          startPrice,
          endPrice,
        });
      }
    }
    
    const gainers = performance.filter(p => p.changePercent > 0).length;
    const losers = performance.filter(p => p.changePercent < 0).length;
    const averageChange = performance.reduce((sum, p) => sum + p.changePercent, 0) / performance.length;
    
    return {
      totalStocks: performance.length,
      gainers,
      losers,
      averageChange: Math.round(averageChange * 100) / 100,
    };
  }

  /**
   * Analyze prediction accuracy
   */
  private async analyzePredictionAccuracy(startDate: Date, endDate: Date): Promise<any> {
    const predictions = await this.reliabilityService.findByDateRange(startDate, endDate);
    
    const categoryBreakdown = {};
    predictions.forEach(prediction => {
      const category = prediction.article?.mainCategory || 'UNKNOWN';
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = [];
      }
      categoryBreakdown[category].push(prediction.predictionAccuracy || 0);
    });
    
    // Calculate average accuracy per category
    for (const category in categoryBreakdown) {
      const accuracies = categoryBreakdown[category];
      categoryBreakdown[category] = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    }
    
    const averageAccuracy = predictions.reduce((sum, p) => sum + (p.predictionAccuracy || 0), 0) / predictions.length;
    const successfulPredictions = predictions.filter(p => (p.predictionAccuracy || 0) > 70).length;
    
    return {
      totalPredictions: predictions.length,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      successfulPredictions,
      categoryBreakdown,
    };
  }

  /**
   * Find top movers and their related news
   */
  private async findTopMovers(startDate: Date, endDate: Date): Promise<any> {
    const allStocks = await this.stockPricesService.findAllLatest();
    const movers = [];
    
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
        
        if (Math.abs(changePercent) > 3) { // More than 3% change
          // Find related news
          const relatedNews = await this.findNewsForStock(stock.stockSymbol, startDate, endDate);
          
          movers.push({
            symbol: stock.stockSymbol,
            name: stock.stockName,
            changePercent: Math.round(changePercent * 100) / 100,
            startPrice,
            endPrice,
            relatedNews,
          });
        }
      }
    }
    
    return {
      topGainers: movers
        .filter(m => m.changePercent > 0)
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 5),
      topLosers: movers
        .filter(m => m.changePercent < 0)
        .sort((a, b) => a.changePercent - b.changePercent)
        .slice(0, 5),
    };
  }

  /**
   * Find news related to a specific stock
   */
  private async findNewsForStock(symbol: string, startDate: Date, endDate: Date): Promise<any[]> {
    const mentions = await this.reliabilityService.findByStockAndDateRange(symbol, startDate, endDate);
    
    return mentions.map(mention => ({
      articleId: mention.articleId,
      title: mention.article?.title,
      sentiment: mention.article?.sentimentScore,
      impact: mention.article?.impactLevel,
      predictedImpact: mention.predictedImpact,
      actualChangePercent: mention.actualChangePercent,
      accuracy: mention.predictionAccuracy,
    }));
  }

  /**
   * Generate insights from analysis
   */
  private async generateInsights(newsStats: any, stockPerformance: any, predictionAccuracy: any): Promise<string[]> {
    const insights: string[] = [];
    
    // News volume insights
    if (newsStats.totalArticles > 100) {
      insights.push(`Yüksek haber hacmi: ${newsStats.totalArticles} haber işlendi`);
    }
    
    // Sentiment insights
    const totalSentiment = newsStats.sentimentDistribution.positive + 
                          newsStats.sentimentDistribution.negative + 
                          newsStats.sentimentDistribution.neutral;
    
    if (newsStats.sentimentDistribution.positive / totalSentiment > 0.6) {
      insights.push('Pozitif sentiment hakim: Piyasa genelinde olumlu haberler');
    } else if (newsStats.sentimentDistribution.negative / totalSentiment > 0.6) {
      insights.push('Negatif sentiment hakim: Piyasa genelinde olumsuz haberler');
    }
    
    // Prediction accuracy insights
    if (predictionAccuracy.averageAccuracy > 75) {
      insights.push(`Yüksek tahmin doğruluğu: %${predictionAccuracy.averageAccuracy}`);
    } else if (predictionAccuracy.averageAccuracy < 50) {
      insights.push(`Düşük tahmin doğruluğu: %${predictionAccuracy.averageAccuracy} - Algoritma iyileştirmesi gerekli`);
    }
    
    // Stock performance insights
    if (stockPerformance.gainers > stockPerformance.losers * 1.5) {
      insights.push('Güçlü yükseliş trendi: Kazanan hisse sayısı kaybedenlerden fazla');
    } else if (stockPerformance.losers > stockPerformance.gainers * 1.5) {
      insights.push('Düşüş trendi: Kaybeden hisse sayısı kazananlardan fazla');
    }
    
    return insights;
  }

  /**
   * Generate recommendations
   */
  private async generateRecommendations(predictionAccuracy: any): Promise<string[]> {
    const recommendations: string[] = [];
    
    // Category-based recommendations
    for (const [category, accuracy] of Object.entries(predictionAccuracy.categoryBreakdown)) {
      if (accuracy > 80) {
        recommendations.push(`${category} kategorisindeki haberler için güvenilir tahminler yapılabilir`);
      } else if (accuracy < 50) {
        recommendations.push(`${category} kategorisindeki haberler için tahmin algoritması gözden geçirilmeli`);
      }
    }
    
    // Overall recommendations
    if (predictionAccuracy.averageAccuracy > 75) {
      recommendations.push('Sistem genel olarak iyi performans gösteriyor');
    } else {
      recommendations.push('Sistem performansı iyileştirilmeli - daha fazla veri ve algoritma optimizasyonu gerekli');
    }
    
    return recommendations;
  }

  /**
   * Save daily report to database
   */
  private async saveDailyReport(report: DailyReport): Promise<void> {
    // TODO: Implement report saving to database
    this.logger.debug('Saving daily report to database');
  }
}
```

### 7. Entity Definitions

**File**: `src/modules/stock-prediction/data/entities/prediction-rule.entity.ts`

```typescript
import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';

@AutoEntity()
export class PredictionRule {
  id: number;
  ruleType: string; // 'CATEGORY', 'SENTIMENT', 'IMPACT_LEVEL', 'SOURCE'
  ruleValue: string; // 'COMPANY_NEWS', 'POSITIVE', 'HIGH', etc.
  totalPredictions: number;
  averageAccuracy: number;
  averageChangePercent: number;
  successRate: number;
  successfulPredictions: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**File**: `src/modules/stock-prediction/data/entities/daily-report.entity.ts`

```typescript
import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';

@AutoEntity()
export class DailyReport {
  id: number;
  reportDate: Date;
  reportData: any; // JSON data containing the full report
  totalArticles: number;
  totalPredictions: number;
  averageAccuracy: number;
  topGainers: string; // JSON array of top gainers
  topLosers: string; // JSON array of top losers
  insights: string; // JSON array of insights
  recommendations: string; // JSON array of recommendations
  createdAt: Date;
  updatedAt: Date;
}
```

**File**: `src/modules/stock-prediction/data/entities/news-cluster.entity.ts`

```typescript
import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';

@AutoEntity()
export class NewsCluster {
  id: number;
  clusterType: string; // 'CONTENT_SIMILARITY', 'STOCK_MENTION', 'TIME_PROXIMITY'
  mainArticleId: number;
  articleIds: string; // JSON array of article IDs
  clusterScore: number; // 0-100 confidence score
  createdAt: Date;
  updatedAt: Date;
}
```

**File**: `src/modules/stock-prediction/data/entities/retrospective-analysis.entity.ts`

```typescript
import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';

@AutoEntity()
export class RetrospectiveAnalysis {
  id: number;
  stockSymbol: string;
  movementPercent: number;
  analysisDate: Date;
  movementStartTime: Date;
  movementEndTime: Date;
  precedingNewsCount: number;
  existingPredictionsCount: number;
  missedOpportunity: boolean;
  missedReasons: string; // JSON array of reasons
  retrospectiveAccuracy: number;
  analysisData: any; // JSON data containing full analysis
  createdAt: Date;
  updatedAt: Date;
}
```

**File**: `src/modules/stock-prediction/data/entities/pattern-recognition.entity.ts`

```typescript
import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';

@AutoEntity()
export class PatternRecognition {
  id: number;
  patternType: string; // 'TIME_BASED', 'SECTOR_CORRELATION', 'VOLUME_PATTERN'
  patternData: any; // JSON data containing pattern details
  confidence: number; // 0-100 confidence score
  occurrences: number; // How many times this pattern occurred
  accuracy: number; // Prediction accuracy when this pattern is present
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 8. Enums

**File**: `src/modules/stock-prediction/contracts/enums/rule-type.enum.ts`

```typescript
export enum RuleTypeEnum {
  CATEGORY = 'CATEGORY',
  SENTIMENT = 'SENTIMENT',
  IMPACT_LEVEL = 'IMPACT_LEVEL',
  SOURCE = 'SOURCE',
  TIME_OF_DAY = 'TIME_OF_DAY',
  DAY_OF_WEEK = 'DAY_OF_WEEK',
  MARKET_CONDITION = 'MARKET_CONDITION',
  CLUSTER_TYPE = 'CLUSTER_TYPE',
}
```

**File**: `src/modules/stock-prediction/contracts/enums/prediction-status.enum.ts`

```typescript
export enum PredictionStatusEnum {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}
```

**File**: `src/modules/stock-prediction/contracts/enums/learning-mode.enum.ts`

```typescript
export enum LearningModeEnum {
  PREDICTIVE = 'PREDICTIVE',     // Learning from predictions
  RETROSPECTIVE = 'RETROSPECTIVE', // Learning from missed opportunities
  PATTERN_BASED = 'PATTERN_BASED', // Learning from patterns
  HYBRID = 'HYBRID',             // Combined learning approach
}
```

**File**: `src/modules/stock-prediction/contracts/enums/cluster-type.enum.ts`

```typescript
export enum ClusterTypeEnum {
  CONTENT_SIMILARITY = 'CONTENT_SIMILARITY',
  STOCK_MENTION = 'STOCK_MENTION',
  TIME_PROXIMITY = 'TIME_PROXIMITY',
  SECTOR_RELATED = 'SECTOR_RELATED',
  EVENT_BASED = 'EVENT_BASED',
}
```

**File**: `src/modules/stock-prediction/contracts/enums/insight-type.enum.ts`

```typescript
export enum InsightTypeEnum {
  MISSED_OPPORTUNITY = 'MISSED_OPPORTUNITY',
  PATTERN_DISCOVERY = 'PATTERN_DISCOVERY',
  ACCURACY_IMPROVEMENT = 'ACCURACY_IMPROVEMENT',
  SOURCE_RELIABILITY = 'SOURCE_RELIABILITY',
  MARKET_CONDITION = 'MARKET_CONDITION',
  CORRELATION_FOUND = 'CORRELATION_FOUND',
}
```

---

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure (3-4 days)
- [ ] Create `stock-prediction` module structure
- [ ] Implement `PredictionEngineService` with multi-source support
- [ ] Implement `ActualImpactTrackerService`
- [ ] Create basic entities and schemas
- [ ] Set up database migrations
- [ ] Add news clustering capabilities

### Phase 2: Learning System (4-5 days)
- [ ] Implement `LearningSystemService`
- [ ] Implement `RetrospectiveLearningService`
- [ ] Create `PredictionRule` entity and repository
- [ ] Implement rule-based learning algorithms
- [ ] Add pattern analysis capabilities
- [ ] Test learning system with sample data

### Phase 3: Advanced Analysis (3-4 days)
- [ ] Implement `NewsClusteringService`
- [ ] Implement `PatternRecognitionService`
- [ ] Add multi-source news correlation
- [ ] Implement missed opportunity analysis
- [ ] Add retrospective learning algorithms
- [ ] Test advanced analysis features

### Phase 4: Reporting System (2-3 days)
- [ ] Implement `DailyReportService`
- [ ] Create daily analysis reports
- [ ] Add insights generation
- [ ] Implement recommendations engine
- [ ] Create report storage system
- [ ] Add retrospective insights

### Phase 5: Integration & Testing (3-4 days)
- [ ] Integrate with existing modules
- [ ] Add API endpoints
- [ ] Implement error handling
- [ ] Add comprehensive logging
- [ ] End-to-end testing
- [ ] Performance optimization

### Phase 6: Dashboard Integration (2-3 days)
- [ ] Add prediction data to dashboard
- [ ] Create prediction accuracy charts
- [ ] Add daily report views
- [ ] Implement real-time updates
- [ ] Add retrospective analysis views
- [ ] Create learning progress indicators

---

## 📊 Expected Outcomes

### Short-term (1-2 weeks)
- ✅ Automated stock predictions from news analysis
- ✅ Real-time prediction tracking
- ✅ Basic learning system operational
- ✅ Daily reports generated

### Medium-term (1-2 months)
- ✅ Improved prediction accuracy through learning
- ✅ Pattern recognition capabilities
- ✅ Advanced analytics and insights
- ✅ Source reliability scoring

### Long-term (3-6 months)
- ✅ Self-improving prediction system
- ✅ Market condition adaptation
- ✅ Cross-asset correlation analysis
- ✅ Advanced ML algorithms integration

---

## 🔧 Technical Requirements

### Dependencies
```bash
# Already installed
npm install @nestjs/schedule
npm install openai

# Additional dependencies needed
npm install moment
npm install lodash
npm install @types/lodash --save-dev
```

### Environment Variables
```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini

# Prediction System Configuration
PREDICTION_CONFIDENCE_THRESHOLD=70
LEARNING_SYSTEM_ENABLED=true
DAILY_REPORT_ENABLED=true
```

### Database Schema Updates
- New tables: `prediction_rules`, `daily_reports`, `prediction_insights`
- Indexes for performance optimization
- Foreign key relationships

---

## 📈 Success Metrics

### Prediction Accuracy
- Target: >75% accuracy for direction prediction
- Target: >60% accuracy for magnitude prediction
- Track accuracy by category, sentiment, and source

### Learning Effectiveness
- Rule improvement over time
- Pattern recognition success rate
- System adaptation to market changes

### System Performance
- Prediction processing time < 5 seconds
- Daily report generation time < 30 seconds
- Database query optimization

---

## 🎯 Next Steps

1. **Create Module Structure**
   ```bash
   mkdir -p src/modules/stock-prediction/{controllers,business/{services,orchestration/schedules},data/{entities,repositories,schemas},contracts/{requests,responses,enums}}
   ```

2. **Implement Core Services**
   - Start with `PredictionEngineService`
   - Add `ActualImpactTrackerService`
   - Implement `LearningSystemService`

3. **Database Setup**
   - Create migration files
   - Set up entity schemas
   - Configure relationships

4. **Testing**
   - Unit tests for each service
   - Integration tests
   - End-to-end testing

5. **Documentation**
   - API documentation
   - User guides
   - System architecture docs

---

**Document Status**: Ready for Implementation  
**Estimated Timeline**: 17-23 days  
**Priority**: High  
**Dependencies**: OpenAI API, existing modules (news, stock-prices, news-reliability)

---

## 🔄 Key Improvements Made

### **1. Dual-Loop Learning Architecture**
- **Prediction Loop**: Real-time learning from predictions
- **Retrospective Loop**: Learning from missed opportunities and market movements

### **2. Multi-Source News Handling**
- **News Clustering**: Groups related news from multiple sources
- **Content Similarity**: Identifies duplicate/similar news
- **Time Proximity**: Groups news by time windows

### **3. Retrospective Learning**
- **Missed Opportunity Analysis**: Analyzes why predictions were missed
- **Backward News Analysis**: Finds news that preceded movements
- **Pattern Recognition**: Discovers hidden correlations

### **4. Enhanced Learning System**
- **Multiple Learning Modes**: Predictive, retrospective, pattern-based
- **Advanced Pattern Recognition**: Time-based, sector correlation, volume patterns
- **Comprehensive Rule Updates**: Category, sentiment, impact, source-based rules

### **5. Holistic Analysis**
- **Related Stock Analysis**: Finds stocks affected by same news
- **Sector Correlation**: Analyzes sector-wide movements
- **Market Condition Adaptation**: Adjusts to market volatility

### **6. Advanced Reporting**
- **Retrospective Insights**: Analysis of missed opportunities
- **Learning Progress**: Tracks system improvement over time
- **Pattern Discovery**: Reports on new patterns found
