import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';

@AutoEntity()
export class StockPrice {
  id: number;
  stockSymbol: string;      // "A1CAP", "ACSEL"
  stockName: string;        // Optional full name
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
  exchange: string;         // "BIST100"
  currency: string;         // "TRY"
  lastUpdate: Date;         // From API
  fetchedAt: Date;          // When we fetched it
  createdAt: Date;
  updatedAt: Date;
}
