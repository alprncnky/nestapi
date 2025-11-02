import { BaseDto } from '../../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../../common/decorators/auto-apply.decorator';
import { MarketTypeEnum } from '../enums/market-type.enum';
import { SaveStockMapping } from './mapping';

@AutoApplyDecorators(SaveStockMapping)
export class SaveStockDto extends BaseDto {
  id?: number;
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
}

