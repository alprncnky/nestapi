import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';
import { ExecutionStatusEnum } from '../../contracts/enums/execution-status.enum';

/**
 * Job Execution History Entity
 * Tracks scheduled job executions for monitoring and history logging
 */
@AutoEntity()
export class JobExecutionHistory {
  id: number;
  jobName: string;
  status: ExecutionStatusEnum;
  startTime: Date;
  endTime?: Date;
  duration?: number; // Duration in milliseconds
  errorMessage?: string;
  errorStack?: string;
  createdAt: Date;
}

