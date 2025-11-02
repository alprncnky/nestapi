import { ResponseFieldConfig } from '../../../../common/decorators/auto-response.decorator';
import { MarketTypeEnum } from '../enums/market-type.enum';

export const StockResponseMapping: Record<string, ResponseFieldConfig> = {
  symbol: { description: 'Stock symbol', example: 'AKBNK', required: true, type: String },
  name: { description: 'Stock name', example: 'AKBANK', required: true, type: String },
  lastPrice: { description: 'Last traded price', example: 60.8, required: true, type: Number },
  highestPrice: { description: 'Highest price of the period', example: 61.2, required: true, type: Number },
  lowestPrice: { description: 'Lowest price of the period', example: 59.5, required: true, type: Number },
  volume: { description: 'Trading volume', example: 8423783.29, required: true, type: Number },
  marketType: { description: 'Market type (1: BIST100, 2: Nasdaq)', example: MarketTypeEnum.BIST100, required: true, enum: MarketTypeEnum },
  dailyPercent: { description: 'Daily change percentage', example: 2.18, required: false, type: Number },
  weeklyPercent: { description: 'Weekly change percentage', example: 1.0, required: false, type: Number },
  monthlyPercent: { description: 'Monthly change percentage', example: -5.2, required: false, type: Number },
  yearlyPercent: { description: 'Yearly change percentage', example: -4.15, required: false, type: Number },
  fetchedAt: { description: 'Data fetch timestamp', example: '2024-01-01T00:00:00Z', required: true, type: Date },
};

