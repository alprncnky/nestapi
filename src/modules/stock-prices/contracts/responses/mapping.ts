import { ResponseFieldConfig } from '../../../../common/decorators/auto-response.decorator';

export const StockPriceResponseMapping: Record<string, ResponseFieldConfig> = {
  stockSymbol: { description: 'Stock symbol code', example: 'A1CAP', required: true, type: String },
  stockName: { description: 'Stock full name', example: 'A1 Capital', required: false, type: String },
  open: { description: 'Opening price', example: 4.75, required: true, type: Number },
  close: { description: 'Closing price', example: 5.03, required: true, type: Number },
  high: { description: 'Highest price', example: 5.09, required: true, type: Number },
  low: { description: 'Lowest price', example: 4.75, required: true, type: Number },
  last: { description: 'Last price', example: 5.03, required: true, type: Number },
  dailyChangePrice: { description: 'Daily price change', example: 0.32, required: true, type: Number },
  dailyChangePercent: { description: 'Daily change percent', example: 6.79, required: true, type: Number },
  volumeTurkishLira: { description: 'Trading volume in TRY', example: 66992310.95, required: true, type: Number },
  volumeLot: { description: 'Trading volume in lots', example: 13437680, required: true, type: Number },
  volatility: { description: 'Price volatility', example: 7.22, required: true, type: Number },
  exchange: { description: 'Stock exchange', example: 'BIST100', required: true, type: String },
  currency: { description: 'Currency code', example: 'TRY', required: true, type: String },
  lastUpdate: { description: 'Last update from exchange', example: new Date(), required: true, type: Date },
  fetchedAt: { description: 'Data fetch timestamp', example: new Date(), required: true, type: Date },
};
