import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockPrice } from '../entities/stock-price.entity';
import { BaseRepository } from '../../../../common/base/base-repository';

@Injectable()
export class StockPriceRepository extends BaseRepository<StockPrice> {
  constructor(
    @InjectRepository(StockPrice)
    protected readonly repository: Repository<StockPrice>,
  ) {
    super(repository);
  }

  async findLatestBySymbol(symbol: string): Promise<StockPrice | null> {
    return await this.repository.findOne({
      where: { stockSymbol: symbol },
      order: { fetchedAt: 'DESC' },
    });
  }

  async findBySymbolAndDateRange(
    symbol: string,
    startDate: Date,
    endDate: Date,
  ): Promise<StockPrice[]> {
    return await this.repository
      .createQueryBuilder('sp')
      .where('sp.stockSymbol = :symbol', { symbol })
      .andWhere('sp.lastUpdate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('sp.lastUpdate', 'ASC')
      .getMany();
  }

  async findAllLatest(): Promise<StockPrice[]> {
    return await this.repository
      .createQueryBuilder('sp')
      .distinctOn(['sp.stockSymbol'])
      .orderBy('sp.stockSymbol', 'ASC')
      .addOrderBy('sp.fetchedAt', 'DESC')
      .getMany();
  }
}
