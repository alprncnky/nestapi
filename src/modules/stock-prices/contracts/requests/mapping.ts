import { StringField, NumberField } from '../../../../common/decorators/field.decorator';

export const SaveStockPriceMapping = {
  stockSymbol: () => StringField('Stock symbol code', 'A1CAP', true),
  stockName: () => StringField('Stock full name', 'A1 Capital', false),
  open: () => NumberField('Opening price', 4.75, true),
  close: () => NumberField('Closing price', 5.03, true),
  high: () => NumberField('Highest price', 5.09, true),
  low: () => NumberField('Lowest price', 4.75, true),
  last: () => NumberField('Last price', 5.03, true),
  dailyChangePrice: () => NumberField('Daily price change', 0.32, true),
  dailyChangePercent: () => NumberField('Daily change percent', 6.79, true),
  volumeTurkishLira: () => NumberField('Volume in TRY', 66992310.95, true),
  volumeLot: () => NumberField('Volume in lots', 13437680, true),
  volatility: () => NumberField('Volatility', 7.22, true),
  exchange: () => StringField('Exchange name', 'BIST100', true),
  currency: () => StringField('Currency code', 'TRY', true),
  lastUpdate: () => StringField('Last update time from exchange', new Date().toISOString(), true),
  fetchedAt: () => StringField('Time when data was fetched', new Date().toISOString(), true),
};
