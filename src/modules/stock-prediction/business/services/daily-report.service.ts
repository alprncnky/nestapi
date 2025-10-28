import { Injectable, Logger } from '@nestjs/common';
import { NewsService } from '../../../news/business/services/news.service';
import { StockPricesService } from '../../../stock-prices/business/services/stock-prices.service';
import { NewsReliabilityService } from '../../../news-reliability/business/services/news-reliability.service';
import { DailyReportRepository } from '../../data/repositories/daily-report.repository';
import { DailyReport as DailyReportEntity } from '../../data/entities/daily-report.entity';

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
    private readonly dailyReportRepository: DailyReportRepository,
  ) {}

  /**
   * Generate daily analysis report at 6 PM
   */
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
    
    const categories: Record<string, number> = {};
    const sentimentDistribution = { positive: 0, negative: 0, neutral: 0 };
    
    articles.forEach((article: any) => {
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
      processedArticles: articles.filter((a: any) => a.status === 'PROCESSED').length,
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
    
    const categoryBreakdown: Record<string, number[]> = {};
    predictions.forEach((prediction: any) => {
      const category = prediction.article?.mainCategory || 'UNKNOWN';
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = [];
      }
      categoryBreakdown[category].push(prediction.predictionAccuracy || 0);
    });
    
    // Calculate average accuracy per category
    const categoryAverages: Record<string, number> = {};
    for (const category in categoryBreakdown) {
      const accuracies = categoryBreakdown[category];
      categoryAverages[category] = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    }
    
    const averageAccuracy = predictions.reduce((sum, p) => sum + (p.predictionAccuracy || 0), 0) / predictions.length;
    const successfulPredictions = predictions.filter(p => (p.predictionAccuracy || 0) > 70).length;
    
    return {
      totalPredictions: predictions.length,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      successfulPredictions,
      categoryBreakdown: categoryAverages,
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
      const accuracyValue = accuracy as number;
      if (accuracyValue > 80) {
        recommendations.push(`${category} kategorisindeki haberler için güvenilir tahminler yapılabilir`);
      } else if (accuracyValue < 50) {
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
    try {
      const dailyReportEntity = new DailyReportEntity();
      dailyReportEntity.reportDate = new Date(report.date);
      dailyReportEntity.reportData = JSON.stringify(report);
      dailyReportEntity.totalArticles = report.newsStats.totalArticles;
      dailyReportEntity.totalPredictions = report.predictionAccuracy.totalPredictions;
      dailyReportEntity.averageAccuracy = report.predictionAccuracy.averageAccuracy;
      dailyReportEntity.topGainers = JSON.stringify(report.topMovers.topGainers);
      dailyReportEntity.topLosers = JSON.stringify(report.topMovers.topLosers);
      dailyReportEntity.insights = JSON.stringify(report.insights);
      dailyReportEntity.recommendations = JSON.stringify(report.recommendations);
      dailyReportEntity.createdAt = new Date();
      dailyReportEntity.updatedAt = new Date();
      
      await this.dailyReportRepository.save(dailyReportEntity);
      
      this.logger.log(`Daily report saved for ${report.date}`);
    } catch (error) {
      this.logger.error('Error saving daily report:', error);
    }
  }
}
