import { BaseResponseDto } from '../../../../common/base/base-dto';
import { AutoResponse } from '../../../../common/decorators/auto-response.decorator';
import { StockPriceResponseMapping } from './mapping';

@AutoResponse(StockPriceResponseMapping)
export class StockPriceResponseDto extends BaseResponseDto {
  stockSymbol: string;
  stockName?: string;
  open: number;
  close: number;
  high: number;
  low: number;
  last: number;
  dailyChangePrice: number;
  dailyChangePercent: number;
  volumeTurkishLira: number;
  volumeLot: number;
  volatility: number;
  exchange: string;
  currency: string;
  lastUpdate: Date;
  fetchedAt: Date;
}
