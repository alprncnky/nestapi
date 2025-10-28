import { Injectable, Logger } from '@nestjs/common';
import { NewsService } from '../../../news/business/services/news.service';
import { NewsReliabilityService } from '../../../news-reliability/business/services/news-reliability.service';
import { NewsCluster } from '../../data/entities/news-cluster.entity';
import { NewsClusterRepository } from '../../data/repositories/news-cluster.repository';
import { ClusterTypeEnum } from '../../contracts/enums/cluster-type.enum';

@Injectable()
export class NewsClusteringService {
  private readonly logger = new Logger(NewsClusteringService.name);

  constructor(
    private readonly newsService: NewsService,
    private readonly reliabilityService: NewsReliabilityService,
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
    cluster.clusterScore = this.calculateClusterScore({ id: cluster.mainArticleId }, allArticles);
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
