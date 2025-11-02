import { Injectable, Logger } from '@nestjs/common';
import { Stock } from '../../data/entities/stock.entity';
import { StockRepository } from '../../data/repositories/stock.repository';
import { OyakFetchService } from './oyak-fetch.service';
import { MarketTypeEnum } from '../../contracts/enums/market-type.enum';

@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);

  constructor(
    private readonly stockRepository: StockRepository,
    private readonly oyakFetchService: OyakFetchService,
  ) {}

  async fetchAndSaveBist100(): Promise<{ saved: number; errors: number }> {
    try {
      this.logger.log('Starting BIST 100 fetch and save operation...');

      const oyakStocks = await this.oyakFetchService.fetchBist100Prices();
      this.logger.log(`Fetched ${oyakStocks.length} stocks from OYAK`);

      let saved = 0;
      let errors = 0;

      for (const oyakData of oyakStocks) {
        try {
          const stockEntity = this.oyakFetchService.convertToStockEntity(oyakData);
          await this.stockRepository.save(stockEntity);
          saved++;
        } catch (error) {
          this.logger.error(`Failed to save stock ${oyakData.symbol}: ${error.message}`);
          errors++;
        }
      }

      this.logger.log(`BIST 100 fetch completed: ${saved} saved, ${errors} errors`);
      return { saved, errors };
    } catch (error) {
      this.logger.error(`BIST 100 fetch and save failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getLatestByMarketType(marketType: MarketTypeEnum): Promise<Stock[]> {
    return await this.stockRepository.findLatestByMarketType(marketType);
  }

  async cleanOldData(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    this.logger.log(`Cleaning stock data older than ${cutoffDate.toISOString()}`);
    await this.stockRepository.deleteOlderThan(cutoffDate);
    this.logger.log('Old stock data cleaned successfully');
  }
}

