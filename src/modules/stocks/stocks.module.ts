import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockSchema } from './data/schemas/stock.schema';
import { StocksController } from './controllers/stocks.controller';
import { StocksService } from './business/services/stocks.service';
import { OyakFetchService } from './business/services/oyak-fetch.service';
import { StockRepository } from './data/repositories/stock.repository';
import { StockFetchSchedule } from './business/orchestration/schedules/stock-fetch.schedule';
import { BaseSchedulerService } from '../../common/services/base-scheduler.service';

@Module({
  imports: [TypeOrmModule.forFeature([StockSchema])],
  controllers: [StocksController],
  providers: [StocksService, OyakFetchService, StockRepository, StockFetchSchedule],
  exports: [StocksService, OyakFetchService, StockRepository],
})
export class StocksModule implements OnModuleInit {
  constructor(private readonly baseScheduler: BaseSchedulerService, private readonly stockFetchSchedule: StockFetchSchedule) {}

  async onModuleInit() {
    this.baseScheduler.registerTask(this.stockFetchSchedule);
  }
}

