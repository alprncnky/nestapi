import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';
import { MarketTypeEnum } from '../../contracts/enums/market-type.enum';

@AutoEntity()
export class Stock {
  id: number;
  symbol: string;
  name: string;
  lastPrice: number;
  highestPrice: number;
  lowestPrice: number;
  volume: number;
  marketType: MarketTypeEnum;
  dailyPercent?: number;
  weeklyPercent?: number;
  monthlyPercent?: number;
  yearlyPercent?: number;
  fetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

