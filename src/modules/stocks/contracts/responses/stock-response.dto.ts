import { BaseResponseDto } from '../../../../common/base/base-dto';
import { AutoResponse } from '../../../../common/decorators/auto-response.decorator';
import { MarketTypeEnum } from '../enums/market-type.enum';
import { StockResponseMapping } from './mapping';

@AutoResponse(StockResponseMapping)
export class StockResponseDto extends BaseResponseDto {
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
}

