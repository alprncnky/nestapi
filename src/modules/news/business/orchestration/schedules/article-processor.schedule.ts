import { Injectable, Logger } from '@nestjs/common';
import { ArticleProcessorService } from '../../services/article-processor.service';
import { NewsService } from '../../services/news.service';
import { NewsStatusEnum } from '../../../contracts/enums/news-status.enum';
import { IScheduledTask } from '../../../../../common/interfaces/scheduled-task.interface';

/**
 * Article Processor Schedule - Orchestration Layer
 * 
 * Coordinates the processing of PENDING news articles.
 * Runs every hour at :05 and :35 minutes past the hour (after RSS fetch at :00 and :30).
 * 
 * Processing includes:
 * - Sentiment analysis
 * - Categorization
 * - Impact level calculation
 * - Stock symbol extraction
 * - Entity extraction (NER)
 * - Tag extraction
 * - Status update to PROCESSED
 */
@Injectable()
export class ArticleProcessorSchedule implements IScheduledTask {
  readonly name = 'ArticleProcessorSchedule';
  readonly schedule = '0 5,35 * * * *'; // Every hour at :05 and :35

  private readonly logger = new Logger(ArticleProcessorSchedule.name);

  constructor(
    private readonly articleProcessorService: ArticleProcessorService,
    private readonly newsService: NewsService,
  ) {}

  async execute(): Promise<void> {
    this.logger.log('🔄 Starting article processing job...');
    const startTime = Date.now();

    try {
      const pendingArticles = await this.newsService.findByStatus(NewsStatusEnum.PENDING);
      
      if (pendingArticles.length === 0) {
        this.logger.log('ℹ️  No pending articles to process');
        return;
      }

      this.logger.log(`📝 Processing ${pendingArticles.length} pending articles`);

      let processedCount = 0;
      let errorCount = 0;

      for (const article of pendingArticles) {
        try {
          await this.articleProcessorService.processArticle(article.id);
          processedCount++;
          
          // Small delay between articles (rate limiting for OpenAI API)
          await this.delay(1000);
        } catch (error) {
          this.logger.error(`❌ Error processing article ${article.id}:`, error);
          errorCount++;
          // Continue processing other articles even if one fails
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(`✅ Article processing job completed in ${duration}s`);
      this.logger.log(`📊 Summary: ${processedCount} processed, ${errorCount} errors`);
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.error(`❌ Article processing job failed after ${duration}s: ${error.message}`, error.stack);
    }
  }

  /**
   * Delay helper for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
