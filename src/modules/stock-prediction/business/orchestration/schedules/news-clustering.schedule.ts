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
 * Runs every hour to cluster recent articles.
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
      // Get PENDING articles from the last 24 hours
      const pendingArticles = await this.newsService.findByStatus(NewsStatusEnum.PENDING);
      
      // Filter to only articles from the last 24 hours
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentPendingArticles = pendingArticles.filter(
        article => article.publishedAt >= cutoffDate
      );

      this.logger.log(`Processing ${recentPendingArticles.length} pending articles for clustering`);

      let clusteredCount = 0;
      let processedCount = 0;
      let errorCount = 0;

      for (const article of recentPendingArticles) {
        try {
          // Mark as PROCESSING before clustering
          await this.newsService.updateStatus(article.id, NewsStatusEnum.PROCESSING);
          
          // Perform clustering
          await this.newsClusteringService.clusterRelatedNews(article.id);
          
          // Mark as PROCESSED after successful clustering
          await this.newsService.updateStatus(article.id, NewsStatusEnum.PROCESSED);
          
          clusteredCount++;
          processedCount++;
          
          // Small delay to avoid overwhelming the system
          await this.delay(100);
        } catch (error) {
          this.logger.error(`Error clustering article ${article.id}:`, error);
          errorCount++;
          // Optionally mark as FAILED if needed
          // await this.newsService.updateStatus(article.id, NewsStatusEnum.FAILED);
        }
      }
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(`✅ News clustering job completed in ${duration}s`);
      this.logger.log(`📊 Summary: ${clusteredCount} articles clustered, ${processedCount} marked as PROCESSED, ${errorCount} errors`);
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
