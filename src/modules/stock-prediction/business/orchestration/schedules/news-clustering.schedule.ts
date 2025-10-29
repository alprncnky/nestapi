import { Injectable, Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { NewsClusteringService } from '../../services/news-clustering.service';
import { NewsService } from '../../../../news/business/services/news.service';
import { NewsStatusEnum } from '../../../../news/contracts/enums/news-status.enum';
import { IScheduledTask } from '../../../../../common/interfaces/scheduled-task.interface';

/**
 * News Clustering Schedule - Orchestration Layer
 * 
 * Coordinates the clustering of related news articles.
 * Runs every hour at :00 to cluster PROCESSED articles.
 * 
 * Note: Articles must be PROCESSED first (by ArticleProcessorSchedule) before clustering.
 */
@Injectable()
export class NewsClusteringSchedule implements IScheduledTask {
  readonly name = 'NewsClusteringSchedule';
  readonly schedule = CronExpression.EVERY_HOUR;

  private readonly logger = new Logger(NewsClusteringSchedule.name);

  constructor(
    private readonly newsClusteringService: NewsClusteringService,
    private readonly newsService: NewsService,
  ) {}

  async execute(): Promise<void> {
    this.logger.log('🔄 Starting news clustering job...');
    const startTime = Date.now();

    try {
      // Get PROCESSED articles from the last 24 hours (clustering should happen after processing)
      const processedArticles = await this.newsService.findByStatus(NewsStatusEnum.PROCESSED);
      
      // Filter to only articles from the last 24 hours
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentProcessedArticles = processedArticles.filter(
        article => article.publishedAt >= cutoffDate
      );

      this.logger.log(`Processing ${recentProcessedArticles.length} processed articles for clustering`);

      let clusteredCount = 0;
      let errorCount = 0;

      for (const article of recentProcessedArticles) {
        try {
          // Perform clustering (article is already PROCESSED)
          await this.newsClusteringService.clusterRelatedNews(article.id);
          
          clusteredCount++;
          
          // Small delay to avoid overwhelming the system
          await this.delay(100);
        } catch (error) {
          this.logger.error(`Error clustering article ${article.id}:`, error);
          errorCount++;
        }
      }
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(`✅ News clustering job completed in ${duration}s`);
      this.logger.log(`📊 Summary: ${clusteredCount} articles clustered, ${errorCount} errors`);
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.error(`❌ News clustering job failed after ${duration}s: ${error.message}`, error.stack);
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
