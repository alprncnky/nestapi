import { Query, Body, ParseIntPipe, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CrudResource } from '../../../common/decorators/crud-resource.decorator';
import { BaseController } from '../../../common/base/base-controller';
import { CriteriaDto } from '../../../common/dto/criteria.dto';
import { JobExecutionHistory } from '../data/entities/job-execution-history.entity';
import { JobExecutionHistoryDto } from '../contracts/requests/job-execution-history.dto';
import { JobExecutionHistoryResponseDto } from '../contracts/responses/job-execution-history-response.dto';
import { JobExecutionHistoryListResponseDto } from '../contracts/responses/job-execution-history-list-response.dto';
import { JobExecutionHistoryService } from '../business/services/job-execution-history.service';
import { JobExecutionHistoryRepository } from '../data/repositories/job-execution-history.repository';

/**
 * Controller for job execution history (read-only)
 * Provides endpoints to view job execution logs for monitoring and history pages
 */
@CrudResource({
  path: 'job-execution-history',
  entityName: 'JobExecutionHistory',
  entity: JobExecutionHistory,
  requestDto: JobExecutionHistoryDto,
  responseDto: JobExecutionHistoryResponseDto,
  listResponseDto: JobExecutionHistoryListResponseDto,
})
export class JobExecutionHistoryController extends BaseController<
  JobExecutionHistory,
  JobExecutionHistoryDto,
  JobExecutionHistoryDto,
  JobExecutionHistoryResponseDto,
  JobExecutionHistoryListResponseDto
> {
  constructor(
    private readonly jobExecutionHistoryService: JobExecutionHistoryService,
    private readonly jobExecutionHistoryRepository: JobExecutionHistoryRepository,
  ) {
    super({
      service: jobExecutionHistoryService as any,
      repository: jobExecutionHistoryRepository,
      responseClass: JobExecutionHistoryResponseDto,
      listResponseClass: JobExecutionHistoryListResponseDto,
      entityName: 'JobExecutionHistory',
      requestClass: JobExecutionHistoryDto,
    });
  }

  // CRUD endpoints (get, getList) auto-registered by @CrudResource
  // Note: save and delete are not implemented as this is a read-only entity

  @Get('by-job-name')
  @ApiOperation({ summary: 'Get execution history for a specific job' })
  @ApiResponse({ status: 200, type: JobExecutionHistoryListResponseDto })
  async getByJobName(@Query('jobName') jobName: string): Promise<JobExecutionHistoryListResponseDto> {
    const executions = await this.jobExecutionHistoryService.findByJobName(jobName);
    const responseItems = executions.map((exec) => new JobExecutionHistoryResponseDto(exec));
    return new JobExecutionHistoryListResponseDto(responseItems, responseItems.length);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get job execution statistics' })
  @ApiResponse({ status: 200 })
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
    const stats = await this.jobExecutionHistoryService.getJobStatistics(jobName, days || 7);
    const successRate = stats.total > 0 ? Math.round((stats.successful / stats.total) * 100 * 100) / 100 : 0;

    return {
      jobName,
      ...stats,
      successRate,
    };
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent executions across all jobs' })
  @ApiResponse({ status: 200, type: JobExecutionHistoryListResponseDto })
  async getRecent(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number): Promise<JobExecutionHistoryListResponseDto> {
    const executions = await this.jobExecutionHistoryService.findRecent(limit || 100);
    const responseItems = executions.map((exec) => new JobExecutionHistoryResponseDto(exec));
    return new JobExecutionHistoryListResponseDto(responseItems, responseItems.length);
  }
}

