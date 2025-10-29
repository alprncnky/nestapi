import { Query, Body, ParseIntPipe, Get } from '@nestjs/common';
import { CrudController } from '../../../common/decorators/crud-controller.decorator';
import {
  GetEndpoint,
  GetListEndpoint,
} from '../../../common/decorators/endpoint.decorator';
import { BaseController } from '../../../common/base/base-controller';
import { CriteriaDto } from '../../../common/dto/criteria.dto';
import { JobExecutionHistory } from '../data/entities/job-execution-history.entity';
import { JobExecutionHistoryResponseDto } from '../contracts/responses/job-execution-history-response.dto';
import { JobExecutionHistoryListResponseDto } from '../contracts/responses/job-execution-history-list-response.dto';
import { JobExecutionHistoryService } from '../business/services/job-execution-history.service';
import { JobExecutionHistoryRepository } from '../data/repositories/job-execution-history.repository';

/**
 * Controller for job execution history (read-only)
 * Provides endpoints to view job execution logs for monitoring and history pages
 */
@CrudController('job-execution-history', 'JobExecutionHistory')
export class JobExecutionHistoryController extends BaseController<
  JobExecutionHistory,
  never,
  never,
  JobExecutionHistoryResponseDto,
  JobExecutionHistoryListResponseDto
> {
  constructor(
    private readonly jobExecutionHistoryService: JobExecutionHistoryService,
    private readonly jobExecutionHistoryRepository: JobExecutionHistoryRepository,
  ) {
    super(
      jobExecutionHistoryService as any, // Service doesn't implement full IBaseService, but we only need get/getList
      jobExecutionHistoryRepository,
      JobExecutionHistoryResponseDto,
      JobExecutionHistoryListResponseDto,
      'JobExecutionHistory',
      null as any, // No create/update DTOs needed
    );
  }

  @GetEndpoint('JobExecutionHistory', JobExecutionHistoryResponseDto)
  async get(
    @Query('id', ParseIntPipe) id: number,
  ): Promise<JobExecutionHistoryResponseDto> {
    return super.get(id);
  }

  @GetListEndpoint(
    'JobExecutionHistory',
    CriteriaDto,
    JobExecutionHistoryListResponseDto,
  )
  async getList(
    @Body() criteriaDto: CriteriaDto,
  ): Promise<JobExecutionHistoryListResponseDto> {
    return super.getList(criteriaDto);
  }

  /**
   * Get execution history for a specific job
   */
  @Get('by-job-name')
  async getByJobName(
    @Query('jobName') jobName: string,
  ): Promise<JobExecutionHistoryListResponseDto> {
    const executions =
      await this.jobExecutionHistoryService.findByJobName(jobName);
    const responseItems = executions.map(
      (exec) => new JobExecutionHistoryResponseDto(exec),
    );
    return new JobExecutionHistoryListResponseDto(
      responseItems,
      responseItems.length,
    );
  }

  /**
   * Get job execution statistics
   */
  @Get('statistics')
  async getStatistics(
    @Query('jobName') jobName: string,
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ): Promise<{
    jobName: string;
    total: number;
    successful: number;
    failed: number;
    skipped: number;
    averageDuration: number;
    successRate: number;
  }> {
    const stats = await this.jobExecutionHistoryService.getJobStatistics(
      jobName,
      days || 7,
    );
    const successRate =
      stats.total > 0
        ? Math.round((stats.successful / stats.total) * 100 * 100) / 100
        : 0;

    return {
      jobName,
      ...stats,
      successRate,
    };
  }

  /**
   * Get recent executions across all jobs
   */
  @Get('recent')
  async getRecent(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<JobExecutionHistoryListResponseDto> {
    const executions = await this.jobExecutionHistoryService.findRecent(
      limit || 100,
    );
    const responseItems = executions.map(
      (exec) => new JobExecutionHistoryResponseDto(exec),
    );
    return new JobExecutionHistoryListResponseDto(
      responseItems,
      responseItems.length,
    );
  }
}

