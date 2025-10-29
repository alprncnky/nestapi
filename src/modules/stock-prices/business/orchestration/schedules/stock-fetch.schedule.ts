import { Injectable, Logger } from '@nestjs/common';
import { StockFetchService } from '../../services/stock-fetch.service';
import { IScheduledTask } from '../../../../../common/interfaces/scheduled-task.interface';
import { MarketHoursUtil } from '../../../../../common/utils/market-hours.util';

/**
 * Stock Fetch Schedule - Orchestration Layer
 * 
 * Fetches BIST100 stock prices from external API.
 * Optimized to run only during market hours (09:00-18:00, weekdays).
 * 
 * During market hours: Runs every 30 minutes (:00 and :30)
 * After market hours: Skips execution (no price changes)
 */
@Injectable()
export class StockFetchSchedule implements IScheduledTask {
  readonly name = 'StockFetchSchedule';
  readonly schedule = '0 */30 * * * *'; // Every 30 minutes (will check market hours in execute)

  private readonly logger = new Logger(StockFetchSchedule.name);

  constructor(private readonly stockFetchService: StockFetchService) {}

  async execute(): Promise<void> {
    // Skip if market is closed
    if (!MarketHoursUtil.isMarketOpen()) {
      this.logger.debug('⏸️  Market is closed, skipping stock fetch');
      return;
    }

    this.logger.log('📈 Starting BIST100 stock fetch job...');
    const startTime = Date.now();

    try {
      const stats = await this.stockFetchService.fetchAndSaveStocks();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(`✅ Stock fetch job completed in ${duration}s`);
      this.logger.log(`📊 Summary: ${stats.saved} saved, ${stats.skipped} skipped, ${stats.errors} errors`);
      
      if (stats.skipped > 0) {
        this.logger.log(`💡 ${stats.skipped} stocks skipped - API data was not newer than database records`);
      }
    } catch (error) {
      this.logger.error(`❌ Stock fetch job failed: ${error.message}`, error.stack);
    }
  }
}
