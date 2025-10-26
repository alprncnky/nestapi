import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { IScheduledTask } from '../interfaces/scheduled-task.interface';

/**
 * Base Scheduler Service - Central Registry for All Scheduled Tasks
 * 
 * Responsibilities:
 * - Register scheduled tasks from all modules
 * - Manage cron jobs lifecycle
 * - Provide task monitoring and control
 * - Handle overlapping execution prevention
 * - Centralized error handling and logging
 * 
 * Usage:
 * 1. Modules create schedule classes implementing IScheduledTask
 * 2. Register schedules in module's OnModuleInit via registerTask()
 * 3. BaseScheduler manages execution automatically
 * 
 * Example:
 * ```typescript
 * // In module
 * async onModuleInit() {
 *   this.baseScheduler.registerTask(this.rssFetchSchedule);
 * }
 * ```
 */
@Injectable()
export class BaseSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(BaseSchedulerService.name);
  private readonly tasks = new Map<string, IScheduledTask>();
  private readonly runningTasks = new Set<string>();

  constructor(private schedulerRegistry: SchedulerRegistry) {}

  /**
   * Initialize all registered tasks
   */
  async onModuleInit() {
    this.logger.log('🕐 Initializing Base Scheduler Service...');
    
    if (this.tasks.size === 0) {
      this.logger.warn('⚠️  No scheduled tasks registered yet (modules will register during init)');
      return;
    }

    this.logRegisteredTasks();
  }

  /**
   * Register a scheduled task
   * Called by modules during their OnModuleInit
   */
  registerTask(task: IScheduledTask): void {
    if (this.tasks.has(task.name)) {
      this.logger.warn(`⚠️  Task "${task.name}" already registered, skipping`);
      return;
    }

    this.tasks.set(task.name, task);
    this.setupCronJob(task);
    
    this.logger.log(`✅ Registered scheduled task: "${task.name}" (${task.schedule})`);
  }

  /**
   * Setup cron job for a task
   */
  private setupCronJob(task: IScheduledTask): void {
    try {
      const job = new CronJob(task.schedule as string, () => {
        this.executeTask(task);
      });

      this.schedulerRegistry.addCronJob(task.name, job);
      job.start();

      this.logger.debug(`🔧 Cron job started for "${task.name}"`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to setup cron job for "${task.name}": ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Execute a scheduled task with safeguards
   */
  private async executeTask(task: IScheduledTask): Promise<void> {
    // Prevent overlapping executions
    if (this.runningTasks.has(task.name)) {
      this.logger.warn(
        `⚠️  Task "${task.name}" is still running, skipping this execution`,
      );
      return;
    }

    // Check if task should run (optional condition)
    if (task.shouldRun) {
      try {
        const shouldExecute = await task.shouldRun();
        if (!shouldExecute) {
          this.logger.debug(
            `⏭️  Task "${task.name}" skipped (shouldRun returned false)`,
          );
          return;
        }
      } catch (error) {
        this.logger.error(
          `❌ Error in shouldRun() for "${task.name}": ${error.message}`,
        );
        return;
      }
    }

    this.runningTasks.add(task.name);
    const startTime = Date.now();

    try {
      this.logger.log(`🚀 Executing task: "${task.name}"`);
      
      await task.execute();
      
      const duration = Date.now() - startTime;
      this.logger.log(`✅ Task "${task.name}" completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `❌ Task "${task.name}" failed after ${duration}ms: ${error.message}`,
        error.stack,
      );

      // Call custom error handler if provided
      if (task.onError) {
        try {
          await task.onError(error);
        } catch (handlerError) {
          this.logger.error(
            `❌ Error handler for "${task.name}" also failed: ${handlerError.message}`,
          );
        }
      }
    } finally {
      this.runningTasks.delete(task.name);
    }
  }

  /**
   * Manually trigger a task (for testing/debugging)
   */
  async triggerTask(taskName: string): Promise<void> {
    const task = this.tasks.get(taskName);
    
    if (!task) {
      throw new Error(`Task "${taskName}" not found`);
    }

    this.logger.log(`🎯 Manually triggering task: "${taskName}"`);
    await this.executeTask(task);
  }

  /**
   * Get all registered tasks with their current status
   */
  getRegisteredTasks(): Array<{
    name: string;
    schedule: string | number;
    isRunning: boolean;
  }> {
    return Array.from(this.tasks.entries()).map(([name, task]) => ({
      name,
      schedule: task.schedule,
      isRunning: this.runningTasks.has(name),
    }));
  }

  /**
   * Stop a specific task
   */
  stopTask(taskName: string): void {
    try {
      const job = this.schedulerRegistry.getCronJob(taskName);
      job.stop();
      this.logger.log(`⏸️  Stopped task: "${taskName}"`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to stop task "${taskName}": ${error.message}`,
      );
    }
  }

  /**
   * Start a specific task
   */
  startTask(taskName: string): void {
    try {
      const job = this.schedulerRegistry.getCronJob(taskName);
      job.start();
      this.logger.log(`▶️  Started task: "${taskName}"`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to start task "${taskName}": ${error.message}`,
      );
    }
  }

  /**
   * Check if a task is currently running
   */
  isTaskRunning(taskName: string): boolean {
    return this.runningTasks.has(taskName);
  }

  /**
   * Get task by name
   */
  getTask(taskName: string): IScheduledTask | undefined {
    return this.tasks.get(taskName);
  }

  /**
   * Log all registered tasks (for debugging)
   */
  private logRegisteredTasks(): void {
    this.logger.log(`📋 Registered ${this.tasks.size} scheduled task(s):`);
    this.tasks.forEach((task, name) => {
      this.logger.log(`   • ${name}: ${task.schedule}`);
    });
  }
}

