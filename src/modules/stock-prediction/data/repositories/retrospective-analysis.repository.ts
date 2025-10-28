import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../../common/base/base-repository';
import { RetrospectiveAnalysis } from '../entities/retrospective-analysis.entity';

@Injectable()
export class RetrospectiveAnalysisRepository extends BaseRepository<RetrospectiveAnalysis> {
  constructor(@InjectRepository(RetrospectiveAnalysis) repository: Repository<RetrospectiveAnalysis>) {
    super(repository);
  }

  async findByStockAndDateRange(stockSymbol: string, startDate: Date, endDate: Date): Promise<RetrospectiveAnalysis[]> {
    return await this.repository
      .createQueryBuilder('analysis')
      .where('analysis.stockSymbol = :stockSymbol', { stockSymbol })
      .andWhere('analysis.analysisDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('analysis.analysisDate', 'DESC')
      .getMany();
  }

  async findByStockSymbol(stockSymbol: string): Promise<RetrospectiveAnalysis[]> {
    return await this.findBy({ stockSymbol } as any);
  }

  async findMissedOpportunities(): Promise<RetrospectiveAnalysis[]> {
    return await this.findBy({ missedOpportunity: true } as any);
  }

  async findSignificantMovements(minMovementPercent: number = 5): Promise<RetrospectiveAnalysis[]> {
    return await this.repository
      .createQueryBuilder('analysis')
      .where('ABS(analysis.movementPercent) >= :minMovementPercent', { minMovementPercent })
      .orderBy('ABS(analysis.movementPercent)', 'DESC')
      .getMany();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<RetrospectiveAnalysis[]> {
    return await this.repository
      .createQueryBuilder('analysis')
      .where('analysis.analysisDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('analysis.analysisDate', 'DESC')
      .getMany();
  }

  async findHighAccuracyAnalyses(minAccuracy: number = 70): Promise<RetrospectiveAnalysis[]> {
    return await this.repository
      .createQueryBuilder('analysis')
      .where('analysis.retrospectiveAccuracy >= :minAccuracy', { minAccuracy })
      .orderBy('analysis.retrospectiveAccuracy', 'DESC')
      .getMany();
  }
}
