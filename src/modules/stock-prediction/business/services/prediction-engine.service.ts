import { Injectable, Logger } from '@nestjs/common';
import { NewsService } from '../../../news/business/services/news.service';
import { StockPricesService } from '../../../stock-prices/business/services/stock-prices.service';
import { NewsReliabilityService } from '../../../news-reliability/business/services/news-reliability.service';
import { OpenAIService } from './openai.service';
import { PredictionImpactEnum } from '../../contracts/enums/prediction-impact.enum';
import { PredictionRuleRepository } from '../../data/repositories/prediction-rule.repository';
import { RuleTypeEnum } from '../../contracts/enums/rule-type.enum';

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
    private readonly ruleRepository: PredictionRuleRepository,
  ) {}

  /**
   * Main prediction function - Analyzes news and generates stock predictions
   * Runs every 15 minutes to process new articles
   */
  async processNewArticles(): Promise<void> {
    try {
      // Get articles processed in the last 15 minutes
      const recentArticles = await this.newsService.findRecentProcessedArticles(15);
      
      for (const article of recentArticles) {
        await this.predictStockImpact(article.id);
        
        // Small delay to avoid overwhelming the system
        await this.delay(1000);
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
      const response = await this.openaiService.generateCompletion(prompt);
      const result = JSON.parse(response);
      
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
    try {
      // Get active prediction rules
      const categoryRule = await this.ruleRepository.findByTypeAndValue(RuleTypeEnum.CATEGORY, article.mainCategory);
      const sentimentCategory = article.sentimentScore > 0.3 ? 'POSITIVE' : 
                               article.sentimentScore < -0.3 ? 'NEGATIVE' : 'NEUTRAL';
      const sentimentRule = await this.ruleRepository.findByTypeAndValue(RuleTypeEnum.SENTIMENT, sentimentCategory);
      const impactRule = await this.ruleRepository.findByTypeAndValue(RuleTypeEnum.IMPACT_LEVEL, article.impactLevel);

      let adjustedPrediction = { ...prediction };
      let totalWeight = 0;
      let weightedConfidence = 0;
      let weightedChangePercent = 0;

      // Apply category-based adjustments
      if (categoryRule && categoryRule.totalPredictions > 5) {
        const weight = Math.min(categoryRule.successRate, 1);
        weightedConfidence += prediction.confidence * weight;
        weightedChangePercent += prediction.changePercent * weight;
        totalWeight += weight;

        // Adjust confidence based on rule accuracy
        if (categoryRule.averageAccuracy > 70) {
          adjustedPrediction.confidence = Math.min(95, prediction.confidence + 5);
        } else if (categoryRule.averageAccuracy < 50) {
          adjustedPrediction.confidence = Math.max(20, prediction.confidence - 10);
        }
      }

      // Apply sentiment-based adjustments
      if (sentimentRule && sentimentRule.totalPredictions > 5) {
        const weight = Math.min(sentimentRule.successRate, 1);
        weightedConfidence += prediction.confidence * weight;
        weightedChangePercent += prediction.changePercent * weight;
        totalWeight += weight;

        // Adjust change percent based on historical accuracy
        if (sentimentRule.averageAccuracy > 70) {
          adjustedPrediction.changePercent = prediction.changePercent * 1.1;
        } else if (sentimentRule.averageAccuracy < 50) {
          adjustedPrediction.changePercent = prediction.changePercent * 0.9;
        }
      }

      // Apply impact-level adjustments
      if (impactRule && impactRule.totalPredictions > 5) {
        const weight = Math.min(impactRule.successRate, 1);
        weightedConfidence += prediction.confidence * weight;
        weightedChangePercent += prediction.changePercent * weight;
        totalWeight += weight;

        // Adjust based on impact level historical performance
        if (impactRule.averageAccuracy > 75) {
          adjustedPrediction.confidence = Math.min(95, prediction.confidence + 8);
        }
      }

      // Apply weighted adjustments if we have enough data
      if (totalWeight > 0) {
        adjustedPrediction.confidence = Math.round((weightedConfidence / totalWeight) * 100) / 100;
        adjustedPrediction.changePercent = Math.round((weightedChangePercent / totalWeight) * 100) / 100;
      }

      // Ensure values are within reasonable bounds
      adjustedPrediction.confidence = Math.max(10, Math.min(95, adjustedPrediction.confidence));
      adjustedPrediction.changePercent = Math.max(-20, Math.min(20, adjustedPrediction.changePercent));

      this.logger.debug(`Applied learning rules: Original confidence ${prediction.confidence}%, Adjusted ${adjustedPrediction.confidence}%`);
      
      return adjustedPrediction;
    } catch (error) {
      this.logger.error('Error applying learning rules:', error);
      return prediction; // Return original prediction if rule application fails
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
