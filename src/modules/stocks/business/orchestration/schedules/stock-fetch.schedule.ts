import { Injectable, Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { IScheduledTask } from '../../../../../common/interfaces/scheduled-task.interface';
import { StocksService } from '../../services/stocks.service';

@Injectable()
export class StockFetchSchedule implements IScheduledTask {
  readonly name = 'StockFetchSchedule';
  readonly schedule = CronExpression.EVERY_HOUR;
  private readonly logger = new Logger(StockFetchSchedule.name);

  constructor(private readonly stocksService: StocksService) {}

  async execute(): Promise<void> {
    this.logger.log('🔄 Starting BIST 100 stock fetch job...');
    const startTime = Date.now();

    try {
      const result = await this.stocksService.fetchAndSaveBist100();

      if (result.saved === 0) {
        this.logger.warn('⚠️  No stocks fetched or saved');
        return;
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(`✨ Stock fetch job completed in ${duration}s`);
      this.logger.log(`📊 Summary: ${result.saved} saved, ${result.errors} errors`);

      if (result.saved > 0) {
        await this.stocksService.cleanOldData(200);
      }
    } catch (error) {
      this.logger.error(`💥 Stock fetch job failed: ${error.message}`, error.stack);
    }
  }
}

