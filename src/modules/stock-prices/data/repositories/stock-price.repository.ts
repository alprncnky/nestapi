import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockPrice } from '../entities/stock-price.entity';
import { BaseRepository } from '../../../../common/base/base-repository';
import { SQLQueries } from './stock-price.query';

@Injectable()
export class StockPriceRepository extends BaseRepository<StockPrice> {
  constructor(
    @InjectRepository(StockPrice)
    protected readonly repository: Repository<StockPrice>,
  ) {
    super(repository);
  }

  async findLatestBySymbol(symbol: string): Promise<StockPrice | null> {
    const result = await this.repository.query(
      SQLQueries.findLatestBySymbol,
      [symbol]
    );
    return result.length > 0 ? result[0] : null;
  }

  async findBySymbolAndDateRange(
    symbol: string,
    startDate: Date,
    endDate: Date,
  ): Promise<StockPrice[]> {
    return await this.repository.query(
      SQLQueries.findBySymbolAndDateRange,
      [symbol, startDate, endDate]
    );
  }

  async findAllLatest(): Promise<StockPrice[]> {
    return await this.repository.query(SQLQueries.findAllLatest);
  }
}
