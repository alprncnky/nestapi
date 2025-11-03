import { Controller, Post, Get, Query, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { BaseSchedulerService } from '../../../common/services/base-scheduler.service';

@Controller('scheduler')
@ApiTags('Scheduler')
export class SchedulerController {
  constructor(private readonly baseSchedulerService: BaseSchedulerService) {}

  @Get('tasks')
  @ApiOperation({ summary: 'Get all registered scheduled tasks' })
  @ApiResponse({
    status: 200,
    description: 'List of all registered tasks',
    schema: {
      type: 'object',
      properties: {
        tasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'RssFetchSchedule' },
              schedule: { type: 'string', example: '0 */30 * * * *' },
              isRunning: { type: 'boolean', example: false },
            },
          },
        },
      },
    },
  })
  async getTasks(): Promise<{tasks: Array<{name: string; schedule: string | number; isRunning: boolean}>}> {
    const tasks = this.baseSchedulerService.getRegisteredTasks();
    return { tasks };
  }

  @Post('trigger')
  @ApiOperation({ summary: 'Manually trigger a scheduled task' })
  @ApiQuery({
    name: 'taskName',
    required: true,
    description: 'Name of the task to trigger',
    example: 'RssFetchSchedule',
  })
  @ApiResponse({
    status: 200,
    description: 'Task triggered successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Task triggered successfully' },
        taskName: { type: 'string', example: 'RssFetchSchedule' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - taskName parameter is required',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  async triggerTask(@Query('taskName') taskName: string): Promise<{ message: string; taskName: string }> {
    if (!taskName) {
      throw new BadRequestException('taskName query parameter is required');
    }
    try {
      await this.baseSchedulerService.triggerTask(taskName);
      return {message: 'Task triggered successfully', taskName};
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException(`Task "${taskName}" not found`);
      }
      throw error;
    }
  }

  @Get('tasks/:taskName/status')
  @ApiOperation({ summary: 'Check if a task is currently running' })
  @ApiParam({ name: 'taskName', example: 'RssFetchSchedule' })
  @ApiResponse({
    status: 200,
    description: 'Task status',
    schema: {
      type: 'object',
      properties: {
        taskName: { type: 'string', example: 'RssFetchSchedule' },
        isRunning: { type: 'boolean', example: false },
      },
    },
  })
  async getTaskStatus(@Param('taskName') taskName: string): Promise<{ taskName: string; isRunning: boolean }> {
    const isRunning = this.baseSchedulerService.isTaskRunning(taskName);
    return { taskName, isRunning };
  }

  @Post('tasks/:taskName/stop')
  @ApiOperation({ summary: 'Stop a scheduled task (pause automatic execution)' })
  @ApiParam({ name: 'taskName', example: 'RssFetchSchedule' })
  @ApiResponse({
    status: 200,
    description: 'Task stopped successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Task stopped successfully (automatic execution paused)' },
        taskName: { type: 'string', example: 'RssFetchSchedule' },
      },
    },
  })
  async stopTask(@Param('taskName') taskName: string): Promise<{ message: string; taskName: string }> {
    this.baseSchedulerService.stopTask(taskName);
    return {message: 'Task stopped successfully (automatic execution paused)', taskName};
  }

  @Post('tasks/:taskName/start')
  @ApiOperation({ summary: 'Start a scheduled task (resume automatic execution)' })
  @ApiParam({ name: 'taskName', example: 'RssFetchSchedule' })
  @ApiResponse({
    status: 200,
    description: 'Task started successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Task started successfully (automatic execution resumed)' },
        taskName: { type: 'string', example: 'RssFetchSchedule' },
      },
    },
  })
  async startTask(@Param('taskName') taskName: string): Promise<{ message: string; taskName: string }> {
    this.baseSchedulerService.startTask(taskName);
    return {message: 'Task started successfully (automatic execution resumed)', taskName};
  }
}

