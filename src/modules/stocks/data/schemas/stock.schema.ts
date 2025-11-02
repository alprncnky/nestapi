import { EntitySchema } from 'typeorm';
import { Stock } from '../entities/stock.entity';
import { MarketTypeEnum } from '../../contracts/enums/market-type.enum';

export const StockSchema = new EntitySchema<Stock>({
  name: 'Stock',
  target: Stock,
  tableName: 'stocks',
  columns: {
    id: { type: Number, primary: true, generated: true },
    symbol: { type: String, length: 10 },
    name: { type: String, length: 255 },
    lastPrice: { type: 'decimal', precision: 18, scale: 4 },
    highestPrice: { type: 'decimal', precision: 18, scale: 4 },
    lowestPrice: { type: 'decimal', precision: 18, scale: 4 },
    volume: { type: 'decimal', precision: 20, scale: 2 },
    marketType: { type: 'enum', enum: MarketTypeEnum },
    dailyPercent: { type: 'decimal', precision: 10, scale: 4, nullable: true },
    weeklyPercent: { type: 'decimal', precision: 10, scale: 4, nullable: true },
    monthlyPercent: { type: 'decimal', precision: 10, scale: 4, nullable: true },
    yearlyPercent: { type: 'decimal', precision: 10, scale: 4, nullable: true },
    fetchedAt: { type: 'timestamp' },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  indices: [
    { name: 'idx_symbol_market_type', columns: ['symbol', 'market_type'] },
    { name: 'idx_market_type', columns: ['market_type'] },
    { name: 'idx_fetched_at', columns: ['fetched_at'] },
  ],
});

