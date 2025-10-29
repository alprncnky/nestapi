/**
 * Job execution status enumeration
 */
export enum ExecutionStatusEnum {
  /**
   * Job executed successfully
   */
  SUCCESS = 'SUCCESS',

  /**
   * Job execution failed with error
   */
  FAILED = 'FAILED',

  /**
   * Job execution was skipped (e.g., already running or shouldRun returned false)
   */
  SKIPPED = 'SKIPPED',
}

