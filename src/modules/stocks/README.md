# Stocks Module

## Overview

The **Stocks Module** manages stock market data from various exchanges, with primary focus on BIST 100 (Borsa Istanbul) data. The module automatically fetches and stores stock prices every 30 minutes using web scraping from OYAK Yatırım website.

## Features

- ✅ **CRUD Operations**: Full Create, Read, Update, Delete operations for stocks
- ✅ **Web Scraping**: Automated data fetching from OYAK Yatırım (BIST 100)
- ✅ **Scheduled Jobs**: Automatic data refresh every 30 minutes
- ✅ **Multi-Market Support**: BIST 100, Nasdaq (extensible)
- ✅ **Historical Data**: Track price changes over time
- ✅ **Performance Metrics**: Daily, weekly, monthly, yearly percentages
- ✅ **Clean Architecture**: Separation of concerns (Controller/Business/Data/Contracts)
- ✅ **Type Safety**: Full TypeScript support with magic decorators

## Architecture

### Directory Structure

```
src/modules/stocks/
├── controllers/
│   └── stocks.controller.ts          # HTTP endpoints
├── business/
│   ├── services/
│   │   ├── stocks.service.ts         # Business logic
│   │   └── oyak-fetch.service.ts     # Web scraper
│   └── orchestration/
│       └── schedules/
│           └── stock-fetch.schedule.ts # 30-min job
├── data/
│   ├── entities/
│   │   └── stock.entity.ts           # Domain entity
│   ├── repositories/
│   │   └── stock.repository.ts       # Data access
│   └── schemas/
│       └── stock.schema.ts           # TypeORM schema
├── contracts/
│   ├── requests/
│   │   ├── save-stock.dto.ts         # Input DTO
│   │   └── mapping.ts                # Validation rules
│   ├── responses/
│   │   ├── stock-response.dto.ts     # Output DTO
│   │   ├── stock-list-response.dto.ts
│   │   └── mapping.ts                # Response config
│   └── enums/
│       └── market-type.enum.ts       # Market types
└── stocks.module.ts                   # Module config
```

## Database Schema

### Table: `stocks`

| Column         | Type           | Description                           |
|----------------|----------------|---------------------------------------|
| id             | SERIAL         | Primary key                           |
| symbol         | VARCHAR(10)    | Stock symbol (e.g., AKBNK)            |
| name           | VARCHAR(255)   | Stock name (e.g., AKBANK)             |
| last_price     | NUMERIC(18,4)  | Last traded price                     |
| highest_price  | NUMERIC(18,4)  | Highest price of period               |
| lowest_price   | NUMERIC(18,4)  | Lowest price of period                |
| volume         | NUMERIC(20,2)  | Trading volume                        |
| market_type    | INTEGER        | 1=BIST100, 2=Nasdaq                   |
| daily_percent  | NUMERIC(10,4)  | Daily change %                        |
| weekly_percent | NUMERIC(10,4)  | Weekly change %                       |
| monthly_percent| NUMERIC(10,4)  | Monthly change %                      |
| yearly_percent | NUMERIC(10,4)  | Yearly change %                       |
| fetched_at     | TIMESTAMP      | When data was fetched                 |
| created_at     | TIMESTAMP      | Record creation time                  |
| updated_at     | TIMESTAMP      | Record update time                    |

### Indexes

- `idx_symbol_market_type` - Fast lookup by symbol + market
- `idx_market_type` - Filter by market type
- `idx_fetched_at` - Time-based queries

## API Endpoints

### Base URL: `/api/v1/stocks`

### 1. Save Stock (Create/Update)

```http
POST /api/v1/stocks/save
Content-Type: application/json

{
  "symbol": "AKBNK",
  "name": "AKBANK",
  "lastPrice": 60.80,
  "highestPrice": 61.20,
  "lowestPrice": 59.50,
  "volume": 8423783.29,
  "marketType": 1,
  "dailyPercent": 2.18,
  "weeklyPercent": 1.00,
  "monthlyPercent": -5.20,
  "yearlyPercent": -4.15
}
```

**Response:**
```json
{
  "id": 1,
  "symbol": "AKBNK",
  "name": "AKBANK",
  "lastPrice": 60.80,
  "highestPrice": 61.20,
  "lowestPrice": 59.50,
  "volume": 8423783.29,
  "marketType": 1,
  "dailyPercent": 2.18,
  "weeklyPercent": 1.00,
  "monthlyPercent": -5.20,
  "yearlyPercent": -4.15,
  "fetchedAt": "2024-11-02T10:00:00Z",
  "createdAt": "2024-11-02T10:00:00Z",
  "updatedAt": "2024-11-02T10:00:00Z"
}
```

### 2. Get Stock by ID

```http
GET /api/v1/stocks/get?id=1
```

### 3. Get List of Stocks (Paginated)

```http
POST /api/v1/stocks/get-list
Content-Type: application/json

{
  "page": 1,
  "pageSize": 50,
  "filters": [
    {
      "field": "marketType",
      "operator": "equals",
      "value": 1
    }
  ],
  "sorts": [
    {
      "field": "symbol",
      "direction": "ASC"
    }
  ]
}
```

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "symbol": "AKBNK",
      "name": "AKBANK",
      "lastPrice": 60.80,
      ...
    }
  ],
  "total": 100
}
```

### 4. Delete Stock

```http
DELETE /api/v1/stocks/delete?id=1
```

### 5. Manual BIST 100 Fetch

```http
GET /api/v1/stocks/fetch/bist100
```

**Response:**
```json
{
  "message": "BIST 100 fetch completed",
  "saved": 100,
  "errors": 0
}
```

### 6. Get Latest Stocks by Market

```http
GET /api/v1/stocks/latest/1
```

Returns the most recently fetched stocks for market type 1 (BIST100).

## Scheduled Jobs

### Stock Fetch Schedule

**Cron Expression:** `0,30 * * * *` (Every 30 minutes at :00 and :30)  
**Timezone:** Europe/Istanbul  
**Task:** Fetch BIST 100 data from OYAK Yatırım and save to database

**What it does:**
1. Scrapes BIST 100 stock data from OYAK Yatırım website
2. Parses Turkish number format (1.234,56)
3. Validates stock symbols (3-6 uppercase letters)
4. Saves all 100 stocks to database
5. Cleans up data older than 30 days

**Execution Times (Istanbul Time):**
- 00:00, 00:30, 01:00, 01:30, ... 23:00, 23:30

**View Logs:**
```bash
# Check job execution history
GET /api/v1/job-execution-history/get-list
```

## Web Scraping Details

### OYAK Yatırım Integration

**Source URL:** https://www.oyakyatirim.com.tr/piyasa-verileri/XU100

**Technology:**
- HTTP Client: Node.js native `fetch`
- HTML Parser: Cheerio (jQuery-like API)
- User-Agent: Mimics Chrome browser

**Data Extraction:**
- Finds stock table rows (`table tbody tr`)
- Validates 10 columns per row
- Extracts: Symbol, Name, Last, High, Low, Volume, Daily%, Weekly%, Monthly%, Yearly%
- Validates stock symbols with regex: `/^[A-Z]{3,6}$/`

**Turkish Number Format:**
```
Turkish:  1.234.567,89  (dot = thousands, comma = decimal)
Parsed:   1234567.89    (English format)
```

### Error Handling

- Row-level: Skips invalid rows, continues parsing
- Service-level: Logs errors, throws exceptions
- Network errors: Retries handled by scheduler
- Invalid data: Returns 0 for unparseable numbers

## Usage Examples

### Programmatic Usage

```typescript
import { StocksService } from './modules/stocks/business/services/stocks.service';
import { OyakFetchService } from './modules/stocks/business/services/oyak-fetch.service';
import { MarketTypeEnum } from './modules/stocks/contracts/enums/market-type.enum';

// Inject services via constructor
constructor(
  private readonly stocksService: StocksService,
  private readonly oyakFetchService: OyakFetchService,
) {}

// Fetch and save BIST 100 stocks
async fetchStocks() {
  const result = await this.stocksService.fetchAndSaveBist100();
  console.log(`Saved ${result.saved} stocks, ${result.errors} errors`);
}

// Get latest BIST 100 stocks
async getLatestBist100() {
  const stocks = await this.stocksService.getLatestByMarketType(
    MarketTypeEnum.BIST100
  );
  return stocks;
}

// Test OYAK scraper
async testScraper() {
  await this.oyakFetchService.testFetch();
}

// Clean old data
async cleanOldData() {
  await this.stocksService.cleanOldData(30); // Keep last 30 days
}
```

### Shell Script Testing

```bash
#!/bin/bash
# test-stocks.sh

BASE_URL="http://localhost:3000/api/v1"

# 1. Fetch BIST 100 data
echo "Fetching BIST 100 stocks..."
curl -X GET "$BASE_URL/stocks/fetch/bist100"

# 2. Get latest BIST 100 stocks
echo "Getting latest BIST 100 stocks..."
curl -X GET "$BASE_URL/stocks/latest/1"

# 3. Get paginated list
echo "Getting paginated stock list..."
curl -X POST "$BASE_URL/stocks/get-list" \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "pageSize": 10,
    "filters": [{"field": "marketType", "operator": "equals", "value": 1}],
    "sorts": [{"field": "dailyPercent", "direction": "DESC"}]
  }'
```

## Configuration

### Environment Variables

No specific environment variables required. Uses global database configuration.

### Market Types

Defined in `contracts/enums/market-type.enum.ts`:

```typescript
export enum MarketTypeEnum {
  BIST100 = 1,  // Borsa Istanbul 100
  NASDAQ = 2,   // US Stock Market
}
```

To add new markets:
1. Add enum value
2. Create fetch service for that market
3. Update scheduled job to include new market

## Monitoring & Maintenance

### Check Job Status

```bash
# View recent job executions
GET /api/v1/job-execution-history/get-list

# Filter by job name
POST /api/v1/job-execution-history/get-list
{
  "filters": [
    {"field": "jobName", "operator": "equals", "value": "stock-fetch"}
  ],
  "sorts": [
    {"field": "executedAt", "direction": "DESC"}
  ],
  "page": 1,
  "pageSize": 20
}
```

### View Logs

```bash
# Application logs
npm run start:dev

# Filter by StocksService logs
grep "StocksService" logs/app.log

# Filter by OyakFetchService logs
grep "OyakFetchService" logs/app.log
```

### Database Queries

```sql
-- Count stocks by market type
SELECT market_type, COUNT(*) 
FROM stocks 
GROUP BY market_type;

-- Latest fetch time
SELECT market_type, MAX(fetched_at) as last_fetch
FROM stocks
GROUP BY market_type;

-- Top gainers today
SELECT symbol, name, daily_percent
FROM stocks
WHERE market_type = 1
  AND fetched_at >= CURRENT_DATE
ORDER BY daily_percent DESC
LIMIT 10;

-- Clean old data (manual)
DELETE FROM stocks 
WHERE fetched_at < NOW() - INTERVAL '30 days';
```

## Troubleshooting

### Issue: No stocks fetched

**Symptoms:** Empty array returned from fetch

**Possible Causes:**
- Website HTML structure changed
- Network connectivity issues
- User-Agent blocked

**Solutions:**
1. Check OYAK website manually
2. Inspect HTML structure with browser DevTools
3. Update selector in `oyak-fetch.service.ts`
4. Check User-Agent header

### Issue: Incorrect numbers

**Symptoms:** Wrong prices or volumes

**Possible Causes:**
- Turkish number format not handled
- Extra characters in HTML

**Solutions:**
1. Check `parseNumber()` method
2. Log raw values before parsing
3. Update cleaning regex if needed

### Issue: Job not running

**Symptoms:** No recent data in database

**Possible Causes:**
- Scheduler not registered
- Cron expression error
- Application not running

**Solutions:**
1. Check `stocks.module.ts` - ensure job registered
2. Verify cron expression: `0,30 * * * *`
3. Check logs for scheduler errors
4. Restart application

### Issue: Duplicate stocks

**Symptoms:** Multiple records for same symbol

**Possible Causes:**
- Unique constraint not enforced
- Different fetch times

**Solutions:**
1. Check `idx_symbol_market_type` index
2. Use `findLatestByMarketType()` for queries
3. Implement deduplication in service

## Performance Considerations

### Optimization Tips

1. **Batch Inserts**: Save stocks in batches instead of individually
2. **Caching**: Cache latest stock data for 5 minutes
3. **Indexes**: Ensure indexes are created (run migration)
4. **Data Retention**: Keep only 30 days of data
5. **Connection Pooling**: Use TypeORM connection pool

### Benchmarks

| Operation               | Time    | Notes                |
|-------------------------|---------|----------------------|
| Fetch 100 stocks        | ~1.3s   | Network + parsing    |
| Save 100 stocks         | ~2.0s   | Database insert      |
| Query latest 100 stocks | ~0.05s  | With proper indexes  |
| Clean old data          | ~0.2s   | Delete query         |

## Migration

### Run Migration

```bash
# Generate migration
npm run migration:generate -- -n CreateStocksTable

# Run migration
npm run migration:run

# Revert migration
npm run migration:revert
```

### Migration File

Location: `database/migrations/1730548800000-CreateStocksTable.ts`

## Testing

### Unit Tests

```typescript
// stocks.service.spec.ts
describe('StocksService', () => {
  it('should save stock', async () => {
    const dto = { symbol: 'AKBNK', ... };
    const result = await service.save(dto);
    expect(result.symbol).toBe('AKBNK');
  });
});
```

### Integration Tests

```bash
# Run all tests
npm test

# Run stocks module tests
npm test -- stocks

# E2E tests
npm run test:e2e
```

### Manual Testing

```bash
# 1. Start application
npm run start:dev

# 2. Test fetch endpoint
curl http://localhost:3000/api/v1/stocks/fetch/bist100

# 3. Check Swagger UI
open http://localhost:3000/api/docs
```

## Dependencies

### Required Packages

- `cheerio` - HTML parsing
- `@nestjs/schedule` - Cron jobs
- `typeorm` - Database ORM
- `@nestjs/typeorm` - NestJS TypeORM integration

All dependencies are already included in the project.

## Future Enhancements

### Planned Features

- [ ] Add Nasdaq data source integration
- [ ] Real-time WebSocket updates
- [ ] Price alerts and notifications
- [ ] Technical indicators (RSI, MACD, etc.)
- [ ] Historical chart data API
- [ ] Export to CSV/Excel
- [ ] Stock comparison tools
- [ ] Portfolio tracking

### Extensibility

To add a new stock market:

1. Create enum value in `market-type.enum.ts`
2. Create fetch service (e.g., `nasdaq-fetch.service.ts`)
3. Implement `fetchStocks()` method
4. Add to scheduled job or create new schedule
5. Update controller endpoints if needed

## Support

For issues or questions:
- Check logs: `grep "StocksService\|OyakFetchService" logs/app.log`
- Review OYAK scraper docs: `docs/development-notes/oyak-scraper-development.md`
- Check job history: `/api/v1/job-execution-history/get-list`

## License

This module is part of InsightAPI project.

---

**Last Updated:** November 2, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

