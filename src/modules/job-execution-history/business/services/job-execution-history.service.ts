import { Injectable, NotFoundException } from '@nestjs/common';
import { JobExecutionHistory } from '../../data/entities/job-execution-history.entity';
import { JobExecutionHistoryRepository } from '../../data/repositories/job-execution-history.repository';
import { ExecutionStatusEnum } from '../../contracts/enums/execution-status.enum';

/**
 * Service for managing job execution history
 * This service is used internally by BaseSchedulerService to log job executions
 */
@Injectable()
export class JobExecutionHistoryService {
  constructor(
    private readonly jobExecutionHistoryRepository: JobExecutionHistoryRepository,
  ) {}

  /**
   * Log a job execution start
   * Called when a job starts executing
   */
  async logExecutionStart(jobName: string): Promise<JobExecutionHistory> {
    const history = new JobExecutionHistory();
    Object.assign(history, {
      jobName,
      status: ExecutionStatusEnum.SUCCESS, // Will be updated on completion
      startTime: new Date(),
      createdAt: new Date(),
    });

    return await this.jobExecutionHistoryRepository.save(history);
  }

  /**
   * Log a successful job execution completion
   */
  async logExecutionSuccess(
    historyId: number,
    duration: number,
  ): Promise<void> {
    const history = await this.jobExecutionHistoryRepository.findById(
      historyId,
    );
    if (!history) {
      throw new NotFoundException(
        `Job execution history with ID ${historyId} not found`,
      );
    }

    history.status = ExecutionStatusEnum.SUCCESS;
    history.endTime = new Date();
    history.duration = duration;

    await this.jobExecutionHistoryRepository.save(history);
  }

  /**
   * Log a failed job execution
   */
  async logExecutionFailure(
    historyId: number,
    duration: number,
    error: Error,
  ): Promise<void> {
    const history = await this.jobExecutionHistoryRepository.findById(
      historyId,
    );
    if (!history) {
      throw new NotFoundException(
        `Job execution history with ID ${historyId} not found`,
      );
    }

    history.status = ExecutionStatusEnum.FAILED;
    history.endTime = new Date();
    history.duration = duration;
    history.errorMessage = error.message;
    history.errorStack = error.stack;

    await this.jobExecutionHistoryRepository.save(history);
  }

  /**
   * Log a skipped job execution (e.g., already running or shouldRun returned false)
   */
  async logExecutionSkipped(
    jobName: string,
    reason?: string,
  ): Promise<JobExecutionHistory> {
    const history = new JobExecutionHistory();
    Object.assign(history, {
      jobName,
      status: ExecutionStatusEnum.SKIPPED,
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      errorMessage: reason,
      createdAt: new Date(),
    });

    return await this.jobExecutionHistoryRepository.save(history);
  }

  /**
   * Find execution history by job name
   */
  async findByJobName(jobName: string): Promise<JobExecutionHistory[]> {
    return await this.jobExecutionHistoryRepository.findByJobName(jobName);
  }

  /**
   * Get execution statistics for a job
   */
  async getJobStatistics(
    jobName: string,
    days: number = 7,
  ): Promise<{
    total: number;
    successful: number;
    failed: number;
    skipped: number;
    averageDuration: number;
  }> {
    return await this.jobExecutionHistoryRepository.getJobStatistics(
      jobName,
      days,
    );
  }

  /**
   * Find recent executions
   */
  async findRecent(limit: number = 100): Promise<JobExecutionHistory[]> {
    return await this.jobExecutionHistoryRepository.findRecent(limit);
  }
}
