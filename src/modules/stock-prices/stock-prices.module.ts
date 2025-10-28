import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockPriceSchema } from './data/schemas/stock-price.schema';
import { StockPricesController } from './controllers/stock-prices.controller';
import { StockPricesService } from './business/services/stock-prices.service';
import { BistApiService } from './business/services/bist-api.service';
import { StockFetchService } from './business/services/stock-fetch.service';
import { StockPriceRepository } from './data/repositories/stock-price.repository';
import { StockFetchSchedule } from './business/orchestration/schedules/stock-fetch.schedule';
import { BaseSchedulerService } from '../../common/services/base-scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockPriceSchema]),
  ],
  controllers: [StockPricesController],
  providers: [
    StockPricesService,
    BistApiService,
    StockFetchService,
    StockPriceRepository,
    StockFetchSchedule,
  ],
  exports: [
    StockPricesService,
    BistApiService,
    StockFetchService,
    StockPriceRepository,
  ],
})
export class StockPricesModule implements OnModuleInit {
  constructor(
    private readonly baseScheduler: BaseSchedulerService,
    private readonly stockFetchSchedule: StockFetchSchedule,
  ) {}

  async onModuleInit() {
    this.baseScheduler.registerTask(this.stockFetchSchedule);
  }
}
