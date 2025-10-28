import { BaseDto } from '../../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../../common/decorators/auto-apply.decorator';
import { SaveStockPriceMapping } from './mapping';

@AutoApplyDecorators(SaveStockPriceMapping)
export class SaveStockPriceDto extends BaseDto {
  id?: number;
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
