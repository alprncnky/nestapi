import { BaseDto } from '../../../../common/base/base-dto';

/**
 * Job Execution History DTO (Read-only entity)
 * This DTO is not used for creation/updates as job execution history is system-generated
 */
export class JobExecutionHistoryDto extends BaseDto {
  id?: number;
}

