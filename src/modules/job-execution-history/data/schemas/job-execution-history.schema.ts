import { EntitySchema } from 'typeorm';
import { JobExecutionHistory } from '../entities/job-execution-history.entity';
import { ExecutionStatusEnum } from '../../contracts/enums/execution-status.enum';

export const JobExecutionHistorySchema = new EntitySchema<JobExecutionHistory>({
  name: 'JobExecutionHistory',
  target: JobExecutionHistory,
  tableName: 'job_execution_history',
  columns: {
    id: { type: Number, primary: true, generated: true },
    jobName: { type: String, length: 255 },
    status: { type: 'enum', enum: ExecutionStatusEnum, enumName: 'job_execution_history_status_enum' },
    startTime: { type: 'timestamp' },
    endTime: { type: 'timestamp', nullable: true },
    duration: { type: Number, nullable: true, comment: 'Duration in milliseconds' },
    errorMessage: { type: 'text', nullable: true },
    errorStack: { type: 'text', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
  },
  indices: [
    {
      name: 'IDX_job_execution_history_job_name',
      columns: ['jobName'],
    },
    {
      name: 'IDX_job_execution_history_start_time',
      columns: ['startTime'],
    },
    {
      name: 'IDX_job_execution_history_status',
      columns: ['status'],
    },
  ],
});

