import { ResponseFieldConfig } from '../../../../common/decorators/auto-response.decorator';
import { ExecutionStatusEnum } from '../enums/execution-status.enum';

export const JobExecutionHistoryResponseMapping: Record<
  string,
  ResponseFieldConfig
> = {
  jobName: {
    description: 'Name of the scheduled job',
    example: 'RssFetchSchedule',
    required: true,
    type: String,
  },
  status: {
    description: 'Execution status',
    example: ExecutionStatusEnum.SUCCESS,
    required: true,
    enum: ExecutionStatusEnum,
  },
  startTime: {
    description: 'Job execution start time',
    example: '2024-01-01T10:00:00Z',
    required: true,
    type: Date,
  },
  endTime: {
    description: 'Job execution end time',
    example: '2024-01-01T10:05:00Z',
    required: false,
    type: Date,
  },
  duration: {
    description: 'Job execution duration in milliseconds',
    example: 300000,
    required: false,
    type: Number,
  },
  errorMessage: {
    description: 'Error message if execution failed',
    example: 'Network timeout',
    required: false,
    type: String,
  },
  errorStack: {
    description: 'Error stack trace if execution failed',
    example: 'Error: Network timeout\n    at fetch...',
    required: false,
    type: String,
  },
};

