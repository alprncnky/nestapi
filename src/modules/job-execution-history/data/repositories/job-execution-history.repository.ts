import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../../common/base/base-repository';
import { JobExecutionHistory } from '../entities/job-execution-history.entity';
import { ExecutionStatusEnum } from '../../contracts/enums/execution-status.enum';

@Injectable()
export class JobExecutionHistoryRepository extends BaseRepository<JobExecutionHistory> {
  constructor(@InjectRepository(JobExecutionHistory) repository: Repository<JobExecutionHistory>) {
    super(repository);
  }

  async findByJobName(jobName: string): Promise<JobExecutionHistory[]> {
    return await this.findBy({ jobName } as any, { order: { startTime: 'DESC' } });
  }

  async findByStatus(status: ExecutionStatusEnum): Promise<JobExecutionHistory[]> {
    return await this.findBy({ status } as any, { order: { startTime: 'DESC' } });
  }

  async findRecent(limit: number = 100): Promise<JobExecutionHistory[]> {
    return await this.repository.find({order: { startTime: 'DESC' }, take: limit});
  }

  async findByJobNameAndDateRange(jobName: string, startDate: Date, endDate: Date): Promise<JobExecutionHistory[]> {
    return await this.repository.createQueryBuilder('history').where('history.jobName = :jobName', { jobName }).andWhere('history.startTime >= :startDate', { startDate }).andWhere('history.startTime <= :endDate', { endDate }).orderBy('history.startTime', 'DESC').getMany();
  }

  async getJobStatistics(jobName: string, days: number = 7): Promise<{total: number; successful: number; failed: number; skipped: number; averageDuration: number}> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const executions = await this.repository.createQueryBuilder('history').where('history.jobName = :jobName', { jobName }).andWhere('history.startTime >= :startDate', { startDate }).getMany();
    const total = executions.length;
    const successful = executions.filter((e) => e.status === ExecutionStatusEnum.SUCCESS).length;
    const failed = executions.filter((e) => e.status === ExecutionStatusEnum.FAILED).length;
    const skipped = executions.filter((e) => e.status === ExecutionStatusEnum.SKIPPED).length;
    const successfulExecutions = executions.filter((e) => e.status === ExecutionStatusEnum.SUCCESS && e.duration);
    const averageDuration = successfulExecutions.length > 0 ? successfulExecutions.reduce((sum, e) => sum + (e.duration || 0), 0) / successfulExecutions.length : 0;
    return {total, successful, failed, skipped, averageDuration: leaps(averageDuration, 2)};
  }
}

function leaps(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

