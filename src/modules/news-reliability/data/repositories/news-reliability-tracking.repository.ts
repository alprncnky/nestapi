import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../../common/base/base-repository';
import { NewsReliabilityTracking } from '../entities/news-reliability-tracking.entity';

/**
 * Repository for News Reliability Tracking operations
 * Extends BaseRepository for standard CRUD operations
 */
@Injectable()
export class NewsReliabilityTrackingRepository extends BaseRepository<NewsReliabilityTracking> {
  constructor(
    @InjectRepository(NewsReliabilityTracking)
    private readonly reliabilityRepository: Repository<NewsReliabilityTracking>,
  ) {
    super(reliabilityRepository);
  }

  /**
   * Find tracking records by article ID
   */
  async findByArticle(articleId: number): Promise<NewsReliabilityTracking[]> {
    return await this.reliabilityRepository.find({
      where: { articleId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find tracking records by stock symbol
   */
  async findByStock(stockSymbol: string): Promise<NewsReliabilityTracking[]> {
    return await this.reliabilityRepository.find({
      where: { stockSymbol },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  /**
   * Get pending predictions (no actual impact recorded yet)
   */
  async getPendingPredictions(): Promise<NewsReliabilityTracking[]> {
    return await this.reliabilityRepository
      .createQueryBuilder('tracking')
      .where('tracking.actualImpact IS NULL')
      .orderBy('tracking.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Get accuracy report for a source
   */
  async getSourceAccuracyReport(sourceId: number): Promise<{
    totalPredictions: number;
    correctDirectionPredictions: number;
    averageAccuracy: number;
  }> {
    const records = await this.reliabilityRepository
      .createQueryBuilder('tracking')
      .innerJoin('news_articles', 'article', 'article.id = tracking.articleId')
      .where('article.sourceId = :sourceId', { sourceId })
      .andWhere('tracking.actualImpact IS NOT NULL')
      .getMany();

    if (records.length === 0) {
      return {
        totalPredictions: 0,
        correctDirectionPredictions: 0,
        averageAccuracy: 0,
      };
    }

    const correctPredictions = records.filter(
      (r) => r.predictedImpact === r.actualImpact,
    ).length;

    const totalAccuracy = records.reduce(
      (sum, r) => sum + (r.predictionAccuracy || 0),
      0,
    );

    return {
      totalPredictions: records.length,
      correctDirectionPredictions: correctPredictions,
      averageAccuracy: totalAccuracy / records.length,
    };
  }
}
