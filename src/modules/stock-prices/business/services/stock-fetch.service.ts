import { Injectable, Logger } from '@nestjs/common';
import { BistApiService, BistApiStockData } from './bist-api.service';
import { StockPricesService } from './stock-prices.service';

@Injectable()
export class StockFetchService {
  private readonly logger = new Logger(StockFetchService.name);

  constructor(
    private readonly bistApiService: BistApiService,
    private readonly stockPricesService: StockPricesService,
  ) {}

  async fetchAndSaveStocks(): Promise<{ saved: number; errors: number; skipped: number }> {
    this.validateApiConfiguration();

    // Check if we should skip API call entirely
    const shouldSkipApiCall = await this.shouldSkipApiCall();
    if (shouldSkipApiCall) {
      this.logger.log('⏭️ Skipping API call - no new data expected');
      return { saved: 0, errors: 0, skipped: 0 };
    }

    const stockData = await this.bistApiService.fetchBist100Prices();
    
    if (stockData.length === 0) {
      this.logger.warn('No stock data received from API');
      return { saved: 0, errors: 0, skipped: 0 };
    }

    // Check if API data is newer than database data (all stocks have same lastUpdate)
    const apiLastUpdate = this.parseLastUpdate(stockData[0].last_update);
    const shouldSaveAll = await this.shouldSaveAllStocks(apiLastUpdate);
    
    if (!shouldSaveAll) {
      this.logger.log(`⏭️ Skipping all stocks - API data (${apiLastUpdate.toISOString()}) is not newer than database`);
      return { saved: 0, errors: 0, skipped: stockData.length };
    }

    let saved = 0;
    let errors = 0;

    for (const stock of stockData) {
      try {
        await this.saveStockPrice(stock);
        saved++;
      } catch (error) {
        this.logger.error(`Failed to save stock ${stock.code}: ${error.message}`);
        errors++;
      }
    }

    return { saved, errors, skipped: 0 };
  }

  private async shouldSkipApiCall(): Promise<boolean> {
    // Get the most recent fetch time from database
    const latestStocks = await this.stockPricesService.findAllLatest();
    
    if (latestStocks.length === 0) {
      // No data in database, should call API
      return false;
    }
    
    // Find the most recent fetchedAt time
    const mostRecentFetch = latestStocks.reduce((latest, stock) => {
      return stock.fetchedAt > latest ? stock.fetchedAt : latest;
    }, latestStocks[0].fetchedAt);
    
    // If we fetched data less than 12 minutes ago, skip API call (safety margin for 15-min schedule)
    const twelveMinutesAgo = new Date(Date.now() - 12 * 60 * 1000);
    const shouldSkip = mostRecentFetch > twelveMinutesAgo;
    
    if (shouldSkip) {
      this.logger.debug(`Skipping API call - last fetch was ${mostRecentFetch.toISOString()}, less than 12 minutes ago`);
    }
    
    return shouldSkip;
  }

  private async shouldSaveAllStocks(apiLastUpdate: Date): Promise<boolean> {
    // Get the most recent lastUpdate from database (any stock will do since they're all the same)
    const latestStocks = await this.stockPricesService.findAllLatest();
    
    if (latestStocks.length === 0) {
      // No data in database, should save all
      return true;
    }
    
    // Find the most recent lastUpdate time (all stocks from same fetch have same lastUpdate)
    const mostRecentLastUpdate = latestStocks.reduce((latest, stock) => {
      return stock.lastUpdate > latest ? stock.lastUpdate : latest;
    }, latestStocks[0].lastUpdate);
    
    const isNewer = apiLastUpdate > mostRecentLastUpdate;
    
    if (isNewer) {
      this.logger.debug(`API data (${apiLastUpdate.toISOString()}) is newer than DB (${mostRecentLastUpdate.toISOString()})`);
    } else {
      this.logger.debug(`API data (${apiLastUpdate.toISOString()}) is not newer than DB (${mostRecentLastUpdate.toISOString()})`);
    }
    
    return isNewer;
  }

  private async saveStockPrice(stock: BistApiStockData): Promise<void> {
    const lastUpdate = this.parseLastUpdate(stock.last_update);

    await this.stockPricesService.save({
      stockSymbol: stock.code,
      open: stock.open,
      close: stock.close,
      high: stock.high,
      low: stock.low,
      last: stock.last,
      dailyChangePrice: stock.daily_change_price,
      dailyChangePercent: stock.daily_change_percent,
      volumeTurkishLira: stock.volume_turkish_lira,
      volumeLot: stock.volume_lot,
      volatility: stock.volatility,
      exchange: 'BIST100',
      currency: 'TRY',
      lastUpdate: lastUpdate,
      fetchedAt: new Date(),
    });

    this.logger.debug(`Saved stock: ${stock.code} - Last: ${stock.last} TRY (${stock.daily_change_percent}%)`);
  }

  private parseLastUpdate(dateStr: string): Date {
    // Format: "14.04.2025 16:30:14"
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('.');
    const [hour, minute, second] = timePart.split(':');
    
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second),
    );
  }

  private validateApiConfiguration(): void {
    if (!this.bistApiService.isConfigured()) {
      throw new Error('BIST API is not configured. Check environment variables.');
    }
  }
}
