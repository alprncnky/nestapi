import { EntitySchema } from 'typeorm';
import { StockPrice } from '../entities/stock-price.entity';

export const StockPriceSchema = new EntitySchema<StockPrice>({
  name: 'StockPrice',
  target: StockPrice,
  tableName: 'stock_prices',
  columns: {
    id: { type: Number, primary: true, generated: true },
    stockSymbol: { type: String, length: 10 },
    stockName: { type: String, length: 255, nullable: true },
    open: { type: 'decimal', precision: 18, scale: 4 },
    close: { type: 'decimal', precision: 18, scale: 4 },
    high: { type: 'decimal', precision: 18, scale: 4 },
    low: { type: 'decimal', precision: 18, scale: 4 },
    last: { type: 'decimal', precision: 18, scale: 4 },
    dailyChangePrice: { type: 'decimal', precision: 18, scale: 4 },
    dailyChangePercent: { type: 'decimal', precision: 10, scale: 4 },
    volumeTurkishLira: { type: 'decimal', precision: 20, scale: 2 },
    volumeLot: { type: 'bigint' },
    volatility: { type: 'decimal', precision: 10, scale: 4 },
    exchange: { type: String, length: 50, default: 'BIST100' },
    currency: { type: String, length: 10, default: 'TRY' },
    lastUpdate: { type: 'timestamp' },
    fetchedAt: { type: 'timestamp' },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  indices: [
    { name: 'IDX_stock_symbol_date', columns: ['stockSymbol', 'lastUpdate'] },
    { name: 'IDX_fetched_at', columns: ['fetchedAt'] },
  ],
});
