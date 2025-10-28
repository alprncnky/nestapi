import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../../common/base/base-repository';
import { DailyReport } from '../entities/daily-report.entity';

@Injectable()
export class DailyReportRepository extends BaseRepository<DailyReport> {
  constructor(@InjectRepository(DailyReport) repository: Repository<DailyReport>) {
    super(repository);
  }

  async findByDate(date: Date): Promise<DailyReport | null> {
    return await this.findOne({ reportDate: date } as any);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<DailyReport[]> {
    return await this.repository
      .createQueryBuilder('report')
      .where('report.reportDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('report.reportDate', 'DESC')
      .getMany();
  }

  async findLatest(limit: number = 10): Promise<DailyReport[]> {
    return await this.repository.find({
      order: { reportDate: 'DESC' },
      take: limit,
    });
  }

  async findHighAccuracyReports(minAccuracy: number = 70): Promise<DailyReport[]> {
    return await this.repository
      .createQueryBuilder('report')
      .where('report.averageAccuracy >= :minAccuracy', { minAccuracy })
      .orderBy('report.averageAccuracy', 'DESC')
      .getMany();
  }
}
