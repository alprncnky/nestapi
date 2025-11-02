import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../../common/base/base-repository';
import { Stock } from '../entities/stock.entity';
import { MarketTypeEnum } from '../../contracts/enums/market-type.enum';
import { SQLQueries } from './stock.queries';

@Injectable()
export class StockRepository extends BaseRepository<Stock> {
  constructor(
    @InjectRepository(Stock)
    protected readonly repository: Repository<Stock>,
  ) {
    super(repository);
  }

  async findLatestByMarketType(marketType: MarketTypeEnum): Promise<Stock[]> {
    return await this.repository.query(SQLQueries.findLatestByMarketType, [marketType]);
  }

  async deleteOlderThan(date: Date): Promise<void> {
    await this.repository.query(SQLQueries.deleteOlderThan, [date]);
  }
}

