import { BaseResponseDto } from '../../../../common/base/base-dto';
import { AutoResponse } from '../../../../common/decorators/auto-response.decorator';
import { ExecutionStatusEnum } from '../enums/execution-status.enum';
import { JobExecutionHistoryResponseMapping } from './mapping';

/**
 * Job Execution History Response DTO
 */
@AutoResponse(JobExecutionHistoryResponseMapping)
export class JobExecutionHistoryResponseDto extends BaseResponseDto {
  jobName: string;
  status: ExecutionStatusEnum;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  errorMessage?: string;
  errorStack?: string;
}

