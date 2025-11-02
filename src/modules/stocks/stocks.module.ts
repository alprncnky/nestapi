import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockSchema } from './data/schemas/stock.schema';
import { StocksController } from './controllers/stocks.controller';
import { StocksService } from './business/services/stocks.service';
import { OyakFetchService } from './business/services/oyak-fetch.service';
import { StockRepository } from './data/repositories/stock.repository';
import { StockFetchSchedule } from './business/orchestration/schedules/stock-fetch.schedule';
import { BaseSchedulerService } from '../../common/services/base-scheduler.service';

/**
 * Stocks Module
 * Manages stock market data from various exchanges
 * 
 * Features:
 * - CRUD operations for stocks
 * - Web scraping from OYAK Yatırım (BIST 100)
 * - Scheduled data fetching every 30 minutes
 * - Historical data management
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([StockSchema]),
  ],
  controllers: [StocksController],
  providers: [
    StocksService,
    OyakFetchService,
    StockRepository,
    StockFetchSchedule,
  ],
  exports: [
    StocksService,
    OyakFetchService,
    StockRepository,
  ],
})
export class StocksModule implements OnModuleInit {
  constructor(
    private readonly baseScheduler: BaseSchedulerService,
    private readonly stockFetchSchedule: StockFetchSchedule,
  ) {}

  /**
   * Register module schedules on initialization
   * Registers stock fetch job that runs every 30 minutes
   */
  async onModuleInit() {
    // Register stock fetch schedule with base scheduler
    this.baseScheduler.registerTask(this.stockFetchSchedule);
  }
}

