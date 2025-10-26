import { CronExpression } from '@nestjs/schedule';

/**
 * Interface for scheduled tasks
 * Each module implements this to register scheduled jobs
 * 
 * Usage:
 * 1. Create a class implementing IScheduledTask
 * 2. Define schedule configuration (name, cron expression)
 * 3. Implement execute() method with orchestration logic
 * 4. Register in module's OnModuleInit
 */
export interface IScheduledTask {
  /**
   * Unique name for the scheduled task
   */
  name: string;

  /**
   * Cron expression or interval
   * Examples:
   * - CronExpression.EVERY_10_MINUTES
   * - '0 * * * *' (every hour)
   * - Interval in milliseconds: 60000 (1 minute)
   */
  schedule: string | number;

  /**
   * Execute the scheduled task
   * Should delegate to business service
   * NO business logic here - only orchestration!
   */
  execute(): Promise<void>;

  /**
   * Optional: Check if task should run
   * Use for conditional execution
   * 
   * @returns true if task should execute, false to skip
   */
  shouldRun?(): Promise<boolean>;

  /**
   * Optional: Handle task errors
   * Called when execute() throws an error
   * 
   * @param error - The error that occurred
   */
  onError?(error: Error): Promise<void>;
}

/**
 * Schedule metadata for monitoring and control
 */
export interface ScheduleMetadata {
  name: string;
  schedule: string | number;
  description?: string;
  isEnabled?: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

