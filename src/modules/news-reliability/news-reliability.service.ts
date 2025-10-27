import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsReliabilityTracking } from './entities/news-reliability-tracking.entity';
import { SaveReliabilityTrackingDto } from './dto/save-reliability-tracking.dto';
import { PredictionImpactEnum } from './enums/prediction-impact.enum';

/**
 * Service for News Reliability Tracking operations
 * Handles prediction tracking and accuracy calculation
 */
@Injectable()
export class NewsReliabilityService {
  constructor(
    @InjectRepository(NewsReliabilityTracking)
    private readonly reliabilityRepository: Repository<NewsReliabilityTracking>,
  ) {}

  /**
   * Save a reliability tracking record (create or update)
   * .NET-style upsert method
   */
  async save(
    saveDto: SaveReliabilityTrackingDto,
  ): Promise<NewsReliabilityTracking> {
    const id = saveDto.id;

    if (id) {
      // Update existing tracking record
      const tracking = await this.findOne(id);

      Object.assign(tracking, {
        ...saveDto,
        updatedAt: new Date(),
      });

      return await this.reliabilityRepository.save(tracking);
    } else {
      // Create new tracking record
      const tracking = new NewsReliabilityTracking();
      Object.assign(tracking, {
        ...saveDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return await this.reliabilityRepository.save(tracking);
    }
  }

  /**
   * Create a new reliability tracking prediction
   * Alias for save() to maintain backward compatibility
   */
  async createPrediction(
    createDto: SaveReliabilityTrackingDto,
  ): Promise<NewsReliabilityTracking> {
    return await this.save(createDto);
  }

  /**
   * Find all tracking records
   */
  async findAll(): Promise<NewsReliabilityTracking[]> {
    return await this.reliabilityRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  /**
   * Find one tracking record by ID
   */
  async findOne(id: number): Promise<NewsReliabilityTracking> {
    const tracking = await this.reliabilityRepository.findOne({
      where: { id },
    });

    if (!tracking) {
      throw new NotFoundException(
        `Reliability Tracking record with ID ${id} not found`,
      );
    }

    return tracking;
  }

  /**
   * Find tracking records by article
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
   * Update with actual impact and calculate accuracy
   */
  async updateActualImpact(
    id: number,
    actualImpact: PredictionImpactEnum,
    actualChangePercent: number,
  ): Promise<void> {
    const tracking = await this.findOne(id);
    
    // Calculate accuracy
    const accuracy = this.calculateAccuracy(
      tracking.predictedImpact,
      actualImpact,
      tracking.predictedChangePercent,
      actualChangePercent,
    );

    await this.reliabilityRepository.update(id, {
      actualImpact,
      actualChangePercent,
      predictionAccuracy: accuracy,
      evaluationDate: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Remove a tracking record
   */
  async remove(id: number): Promise<void> {
    const tracking = await this.findOne(id);
    await this.reliabilityRepository.remove(tracking);
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

  /**
   * Private: Calculate prediction accuracy
   */
  private calculateAccuracy(
    predictedImpact: PredictionImpactEnum | null,
    actualImpact: PredictionImpactEnum,
    predictedChange: number | null,
    actualChange: number,
  ): number {
    if (!predictedImpact || predictedChange === null) {
      return 0;
    }

    // Direction accuracy (50%)
    const directionCorrect = predictedImpact === actualImpact ? 50 : 0;

    // Magnitude accuracy (50%)
    const changeDiff = Math.abs(predictedChange - actualChange);
    const magnitudeAccuracy = Math.max(0, 50 - changeDiff * 10);

    return directionCorrect + magnitudeAccuracy;
  }
}

