import { Injectable, NotFoundException } from '@nestjs/common';
import { JobExecutionHistory } from '../../data/entities/job-execution-history.entity';
import { JobExecutionHistoryRepository } from '../../data/repositories/job-execution-history.repository';
import { ExecutionStatusEnum } from '../../contracts/enums/execution-status.enum';

@Injectable()
export class JobExecutionHistoryService {
  constructor(private readonly jobExecutionHistoryRepository: JobExecutionHistoryRepository) {}

  async logExecutionStart(jobName: string): Promise<JobExecutionHistory> {
    const history = new JobExecutionHistory();
    Object.assign(history, {jobName, status: ExecutionStatusEnum.SUCCESS, startTime: new Date(), createdAt: new Date()});
    return await this.jobExecutionHistoryRepository.save(history);
  }

  async logExecutionSuccess(historyId: number, duration: number): Promise<void> {
    const history = await this.jobExecutionHistoryRepository.findById(historyId);
    if (!history) {
      throw new NotFoundException(`Job execution history with ID ${historyId} not found`);
    }
    history.status = ExecutionStatusEnum.SUCCESS;
    history.endTime = new Date();
    history.duration = duration;
    await this.jobExecutionHistoryRepository.save(history);
  }

  async logExecutionFailure(historyId: number, duration: number, error: Error): Promise<void> {
    const history = await this.jobExecutionHistoryRepository.findById(historyId);
    if (!history) {
      throw new NotFoundException(`Job execution history with ID ${historyId} not found`);
    }
    history.status = ExecutionStatusEnum.FAILED;
    history.endTime = new Date();
    history.duration = duration;
    history.errorMessage = error.message;
    history.errorStack = error.stack;
    await this.jobExecutionHistoryRepository.save(history);
  }

  async logExecutionSkipped(jobName: string, reason?: string): Promise<JobExecutionHistory> {
    const history = new JobExecutionHistory();
    Object.assign(history, {jobName, status: ExecutionStatusEnum.SKIPPED, startTime: new Date(), endTime: new Date(), duration: 0, errorMessage: reason, createdAt: new Date()});
    return await this.jobExecutionHistoryRepository.save(history);
  }

  async findByJobName(jobName: string): Promise<JobExecutionHistory[]> {
    return await this.jobExecutionHistoryRepository.findByJobName(jobName);
  }

  async getJobStatistics(jobName: string, days: number = 7): Promise<{total: number; successful: number; failed: number; skipped: number; averageDuration: number}> {
    return await this.jobExecutionHistoryRepository.getJobStatistics(jobName, days);
  }

  async findRecent(limit: number = 100): Promise<JobExecutionHistory[]> {
    return await this.jobExecutionHistoryRepository.findRecent(limit);
  }
}
