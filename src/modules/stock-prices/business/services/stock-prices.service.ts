import { Injectable, NotFoundException } from '@nestjs/common';
import { StockPriceRepository } from '../../data/repositories/stock-price.repository';
import { StockPrice } from '../../data/entities/stock-price.entity';
import { SaveStockPriceDto } from '../../contracts/requests/save-stock-price.dto';

@Injectable()
export class StockPricesService {
  constructor(
    private readonly stockPriceRepository: StockPriceRepository,
  ) {}

  async save(dto: SaveStockPriceDto): Promise<StockPrice> {
    const stockPrice = new StockPrice();
    Object.assign(stockPrice, dto);
    return await this.stockPriceRepository.save(stockPrice);
  }

  async findById(id: number): Promise<StockPrice> {
    const stockPrice = await this.stockPriceRepository.findById(id);
    if (!stockPrice) {
      throw new NotFoundException(`Stock price with ID ${id} not found`);
    }
    return stockPrice;
  }

  async findLatestBySymbol(symbol: string): Promise<StockPrice | null> {
    return await this.stockPriceRepository.findLatestBySymbol(symbol);
  }

  async findBySymbolAndDateRange(
    symbol: string,
    startDate: Date,
    endDate: Date,
  ): Promise<StockPrice[]> {
    return await this.stockPriceRepository.findBySymbolAndDateRange(
      symbol,
      startDate,
      endDate,
    );
  }

  async findAllLatest(): Promise<StockPrice[]> {
    return await this.stockPriceRepository.findAllLatest();
  }
}
