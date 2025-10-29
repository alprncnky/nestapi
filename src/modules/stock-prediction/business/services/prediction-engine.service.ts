import { Injectable, Logger } from '@nestjs/common';
import { NewsService } from '../../../news/business/services/news.service';
import { StockPricesService } from '../../../stock-prices/business/services/stock-prices.service';
import { NewsReliabilityService } from '../../../news-reliability/business/services/news-reliability.service';
import { OpenAIService } from './openai.service';
import { PredictionImpactEnum } from '../../contracts/enums/prediction-impact.enum';
import { PredictionRuleRepository } from '../../data/repositories/prediction-rule.repository';
import { RuleTypeEnum } from '../../contracts/enums/rule-type.enum';
import { RssSourceRepository } from '../../../rss-sources/data/repositories/rss-source.repository';
import { NewsClusterRepository } from '../../data/repositories/news-cluster.repository';
import { NewsCluster } from '../../data/entities/news-cluster.entity';

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
    private readonly rssSourceRepository: RssSourceRepository,
    private readonly clusterRepository: NewsClusterRepository,
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
      
      // Check if article is part of a cluster for multi-source prediction
      const cluster = await this.clusterRepository.findByArticleId(articleId);
      const isMultiSource = cluster && JSON.parse(cluster.articleIds || '[]').length > 1;
      
      if (isMultiSource) {
        this.logger.debug(`Article ${articleId} is part of cluster with multiple sources, using multi-source prediction`);
      }
      
      for (const mention of stockMentions) {
        let prediction: StockPrediction;
        
        if (isMultiSource) {
          // Multi-source prediction: Use cluster data
          prediction = await this.generateMultiSourcePrediction(cluster, mention);
        } else {
          // Single-source prediction: Original logic
          prediction = await this.generatePrediction(article, mention);
        }
        
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
        
        const sourceType = isMultiSource ? 'multi-source' : 'single-source';
        this.logger.log(
          `Prediction created for ${mention.stockSymbol} (${sourceType}): ${adjustedPrediction.impact} ${adjustedPrediction.changePercent}% (confidence: ${adjustedPrediction.confidence}%)`
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
      
      // Get source-based rule and source reliability
      const sourceRule = await this.ruleRepository.findByTypeAndValue(RuleTypeEnum.SOURCE, article.sourceId.toString());
      const source = await this.rssSourceRepository.findById(article.sourceId);
      const sourceReliability = source?.reliabilityScore || 50; // Default 50 if not found

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

      // Apply source-based adjustments (HIGHEST PRIORITY)
      if (sourceRule && sourceRule.totalPredictions > 5) {
        // Calculate source weight based on both rule accuracy and base reliability
        const sourceRuleWeight = Math.min(sourceRule.successRate, 1);
        const sourceReliabilityWeight = sourceReliability / 100; // Convert 0-100 to 0-1
        
        // Combined weight: 60% rule accuracy, 40% base reliability
        const combinedSourceWeight = (sourceRuleWeight * 0.6) + (sourceReliabilityWeight * 0.4);
        
        // Higher weight for source-based adjustments
        const sourceWeight = combinedSourceWeight * 1.5; // Boost source importance
        
        weightedConfidence += prediction.confidence * sourceWeight;
        weightedChangePercent += prediction.changePercent * sourceWeight;
        totalWeight += sourceWeight;

        // Source-specific confidence adjustments
        if (sourceRule.averageAccuracy > 80) {
          // High-performing source: boost confidence significantly
          adjustedPrediction.confidence = Math.min(95, prediction.confidence + (sourceReliability / 10));
          adjustedPrediction.changePercent = prediction.changePercent * (1 + sourceReliability / 200);
        } else if (sourceRule.averageAccuracy > 70) {
          // Good-performing source: moderate boost
          adjustedPrediction.confidence = Math.min(95, prediction.confidence + 5);
          adjustedPrediction.changePercent = prediction.changePercent * 1.05;
        } else if (sourceRule.averageAccuracy < 50) {
          // Low-performing source: reduce confidence
          adjustedPrediction.confidence = Math.max(20, prediction.confidence - (10 - sourceReliability / 10));
          adjustedPrediction.changePercent = prediction.changePercent * 0.9;
        }

        // Apply source reliability score as multiplier
        const sourceMultiplier = sourceReliability / 50; // 50 = baseline, 100 = 2x, 25 = 0.5x
        adjustedPrediction.confidence = Math.max(10, Math.min(95, 
          adjustedPrediction.confidence * sourceMultiplier
        ));
        
        this.logger.debug(
          `Source-based adjustment: Source ${article.sourceId} ` +
          `(reliability: ${sourceReliability}, rule accuracy: ${sourceRule.averageAccuracy.toFixed(1)}%, ` +
          `weight: ${combinedSourceWeight.toFixed(2)})`
        );
      }

      // Apply weighted adjustments if we have enough data
      if (totalWeight > 0) {
        adjustedPrediction.confidence = Math.round((weightedConfidence / totalWeight) * 100) / 100;
        adjustedPrediction.changePercent = Math.round((weightedChangePercent / totalWeight) * 100) / 100;
      }

      // Ensure values are within reasonable bounds
      adjustedPrediction.confidence = Math.max(10, Math.min(95, adjustedPrediction.confidence));
      adjustedPrediction.changePercent = Math.max(-20, Math.min(20, adjustedPrediction.changePercent));

      const sourceInfo = sourceRule ? `(Source weight: applied)` : `(Source weight: none)`;
      this.logger.debug(
        `Applied learning rules: Original confidence ${prediction.confidence}%, ` +
        `Adjusted ${adjustedPrediction.confidence}% ${sourceInfo}`
      );
      
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

  /**
   * Generate prediction using multiple related articles from cluster
   */
  private async generateMultiSourcePrediction(cluster: NewsCluster, stockMention: any): Promise<StockPrediction> {
    try {
      const articleIds = JSON.parse(cluster.articleIds || '[]') as number[];
      const articles = await Promise.all(
        articleIds.map((id: number) => this.newsService.findById(id))
      );
      
      // Filter out null articles
      const validArticles = articles.filter(a => a != null);
      
      if (validArticles.length === 0) {
        this.logger.warn(`No valid articles found in cluster ${cluster.id}`);
        return this.generateRuleBasedPrediction({}, stockMention);
      }
      
      // Calculate source weights for each article
      const sourceWeights = await Promise.all(
        validArticles.map(async (article) => {
          try {
            const sourceRule = await this.ruleRepository.findByTypeAndValue(
              RuleTypeEnum.SOURCE, 
              article.sourceId.toString()
            );
            const source = await this.rssSourceRepository.findById(article.sourceId);
            
            const sourceReliability = source?.reliabilityScore || 50;
            const sourceRuleAccuracy = sourceRule?.averageAccuracy || 50;
            
            // Calculate weight: 60% rule accuracy, 40% base reliability
            const weight = (sourceRuleAccuracy / 100 * 0.6) + (sourceReliability / 100 * 0.4);
            
            return {
              articleId: article.id,
              sourceId: article.sourceId,
              weight: weight,
              reliability: sourceReliability,
              ruleAccuracy: sourceRuleAccuracy,
            };
          } catch (error) {
            this.logger.warn(`Error calculating weight for source ${article.sourceId}:`, error);
            return {
              articleId: article.id,
              sourceId: article.sourceId,
              weight: 0.5, // Default weight
              reliability: 50,
              ruleAccuracy: 50,
            };
          }
        })
      );
      
      // Sort by weight (highest first)
      sourceWeights.sort((a, b) => b.weight - a.weight);
      
      // Aggregate data with source weights
      const aggregatedData = {
        titles: validArticles.map(a => a.title),
        contents: validArticles.map(a => a.contentPlain?.substring(0, 1000)).filter(Boolean),
        sentiments: validArticles.map(a => a.sentimentScore).filter(s => s != null),
        categories: validArticles.map(a => a.mainCategory).filter(Boolean),
        sources: validArticles.map(a => a.sourceId),
        sourceWeights: sourceWeights,
        weightedSentiment: this.calculateWeightedSentiment(validArticles, sourceWeights),
        dominantCategory: this.findDominantCategory(validArticles),
        topSource: sourceWeights[0], // Highest weighted source
      };
      
      const prompt = `
Türkçe finansal haber analizi yaparak hisse senedi tahmini yap.
Bu hisse hakkında BİRDEN FAZLA HABER KAYNAĞINDAN gelen haberler analiz edilmektedir.

HİSSE KODU: ${stockMention.stockSymbol}
HABER KAYNAĞI SAYISI: ${validArticles.length}

KAYNAK AĞIRLIKLANDIRMASI:
${sourceWeights.map((sw, idx) => 
  `${idx + 1}. Kaynak ${sw.sourceId}: Güvenilirlik ${sw.reliability}%, Kural Doğruluğu ${sw.ruleAccuracy.toFixed(1)}%, Ağırlık ${sw.weight.toFixed(2)}`
).join('\n')}

HABERLER (ağırlıklı sırayla):
${sourceWeights.map((sw, idx) => {
  const article = validArticles.find(a => a.id === sw.articleId);
  return `${idx + 1}. [Ağırlık: ${sw.weight.toFixed(2)}] ${article?.title || 'Unknown'}`;
}).join('\n')}

TOPLAM İÇERİK: ${aggregatedData.contents.join('\n---\n')}

AĞIRLIKLANDIRILMIŞ SENTIMENT: ${aggregatedData.weightedSentiment.toFixed(2)}
DOMİNANT KATEGORİ: ${aggregatedData.dominantCategory}
EN GÜVENİLİR KAYNAK: ${aggregatedData.topSource.sourceId} (Ağırlık: ${aggregatedData.topSource.weight.toFixed(2)})

Çoklu kaynak analizi kuralları:
- Yüksek ağırlıklı kaynakların haberleri daha önemlidir
- Birden fazla yüksek ağırlıklı kaynak aynı yönde tahmin ediyorsa, confidence artar
- Kaynak tutarlılığı önemlidir
- En güvenilir kaynağın sentiment'i dominant olmalıdır

JSON formatında dön:
{
  "impact": "UP/DOWN/NEUTRAL",
  "changePercent": -15 ile +15 arası sayı,
  "confidence": 0-100 arası güven skoru (kaynak sayısı ve ağırlıklarına göre artırılmalı),
  "reasoning": "tahmin gerekçesi (kaynak ağırlıkları dahil)",
  "timeWindow": "1H/4H/1D/1W",
  "factors": ["faktör1", "faktör2", "multi-source", "weighted-analysis"]
}
`;
      
      const response = await this.openaiService.generateCompletion(prompt);
      const result = JSON.parse(response);
      
      // Boost confidence based on source weights and count
      const avgSourceWeight = sourceWeights.reduce((sum, sw) => sum + sw.weight, 0) / sourceWeights.length;
      const sourceMultiplier = Math.min(1.3, 1 + (avgSourceWeight - 0.5) * 0.6);
      const countMultiplier = Math.min(1.2, 1 + (validArticles.length - 1) * 0.1);
      
      result.confidence = Math.min(95, result.confidence * sourceMultiplier * countMultiplier);
      
      return {
        impact: result.impact as PredictionImpactEnum,
        changePercent: result.changePercent || 0,
        confidence: result.confidence || 50,
        reasoning: result.reasoning || 'Multi-source weighted AI analysis',
        timeWindow: result.timeWindow || '1D',
        factors: [
          ...(result.factors || []), 
          'multi-source', 
          `sources:${validArticles.length}`,
          `avg-weight:${avgSourceWeight.toFixed(2)}`,
          `top-source:${aggregatedData.topSource.sourceId}`
        ],
      };
    } catch (error) {
      this.logger.error('Multi-source AI prediction failed:', error);
      // Fallback to rule-based prediction
      const articleIds = JSON.parse(cluster.articleIds || '[]');
      if (articleIds.length > 0) {
        const firstArticle = await this.newsService.findById(articleIds[0]);
        return this.generateMultiSourceRuleBasedPrediction(firstArticle || {}, stockMention);
      }
      return this.generateRuleBasedPrediction({}, stockMention);
    }
  }

  /**
   * Generate rule-based prediction for multi-source scenario
   */
  private generateMultiSourceRuleBasedPrediction(article: any, stockMention: any): StockPrediction {
    // Use weighted sentiment and aggregate data
    let impact = PredictionImpactEnum.NEUTRAL;
    let changePercent = 0;
    let confidence = 40; // Lower confidence for rule-based multi-source

    if (article.sentimentScore > 0.3) {
      impact = PredictionImpactEnum.UP;
      changePercent = Math.min(8, article.sentimentScore * 15);
      confidence = 55;
    } else if (article.sentimentScore < -0.3) {
      impact = PredictionImpactEnum.DOWN;
      changePercent = Math.max(-12, article.sentimentScore * 15);
      confidence = 55;
    }

    return {
      impact,
      changePercent: Math.round(changePercent * 100) / 100,
      confidence: Math.max(10, Math.min(90, confidence)),
      reasoning: 'Multi-source rule-based fallback prediction',
      timeWindow: '1D',
      factors: ['multi-source', 'sentiment', 'rule-based'],
    };
  }

  /**
   * Calculate weighted sentiment based on source reliability
   */
  private calculateWeightedSentiment(articles: any[], sourceWeights: any[]): number {
    let totalSentiment = 0;
    let totalWeight = 0;
    
    articles.forEach(article => {
      const weight = sourceWeights.find(sw => sw.articleId === article.id)?.weight || 0.5;
      if (article.sentimentScore != null) {
        totalSentiment += article.sentimentScore * weight;
        totalWeight += weight;
      }
    });
    
    return totalWeight > 0 ? totalSentiment / totalWeight : 0;
  }

  /**
   * Find dominant category across articles
   */
  private findDominantCategory(articles: any[]): string {
    const categories = articles.map(a => a.mainCategory).filter(Boolean);
    if (categories.length === 0) return 'UNKNOWN';
    
    const counts = new Map<string, number>();
    categories.forEach(cat => {
      counts.set(cat, (counts.get(cat) || 0) + 1);
    });
    
    let maxCount = 0;
    let dominant = '';
    counts.forEach((count, cat) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = cat;
      }
    });
    
    return dominant || categories[0] || 'UNKNOWN';
  }

  /**
   * Calculate average sentiment for articles
   */
  private calculateAverageSentiment(articles: any[]): number {
    const sentiments = articles.map(a => a.sentimentScore).filter(s => s != null);
    return sentiments.length > 0 
      ? sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length 
      : 0;
  }
}
