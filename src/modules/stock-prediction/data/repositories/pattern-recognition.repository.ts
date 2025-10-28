import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../../common/base/base-repository';
import { PatternRecognition } from '../entities/pattern-recognition.entity';

@Injectable()
export class PatternRecognitionRepository extends BaseRepository<PatternRecognition> {
  constructor(@InjectRepository(PatternRecognition) repository: Repository<PatternRecognition>) {
    super(repository);
  }

  async findByPatternType(patternType: string): Promise<PatternRecognition[]> {
    return await this.findBy({ patternType } as any);
  }

  async findHighConfidencePatterns(minConfidence: number = 70): Promise<PatternRecognition[]> {
    return await this.repository
      .createQueryBuilder('pattern')
      .where('pattern.confidence >= :minConfidence', { minConfidence })
      .orderBy('pattern.confidence', 'DESC')
      .getMany();
  }

  async findRecentPatterns(days: number = 30): Promise<PatternRecognition[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await this.repository
      .createQueryBuilder('pattern')
      .where('pattern.createdAt >= :startDate', { startDate })
      .orderBy('pattern.createdAt', 'DESC')
      .getMany();
  }

  async findByLastSeen(startDate: Date, endDate: Date): Promise<PatternRecognition[]> {
    return await this.repository
      .createQueryBuilder('pattern')
      .where('pattern.lastSeen BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('pattern.lastSeen', 'DESC')
      .getMany();
  }

  async findHighOccurrencePatterns(minOccurrences: number = 5): Promise<PatternRecognition[]> {
    return await this.repository
      .createQueryBuilder('pattern')
      .where('pattern.occurrences >= :minOccurrences', { minOccurrences })
      .orderBy('pattern.occurrences', 'DESC')
      .getMany();
  }

  async findHighAccuracyPatterns(minAccuracy: number = 70): Promise<PatternRecognition[]> {
    return await this.repository
      .createQueryBuilder('pattern')
      .where('pattern.accuracy >= :minAccuracy', { minAccuracy })
      .orderBy('pattern.accuracy', 'DESC')
      .getMany();
  }
}
