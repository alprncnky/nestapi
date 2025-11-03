# InsightAPI

A NestJS-based financial insights API that aggregates stock prices and RSS feeds. Built with Clean Architecture and decorator-driven patterns inspired by .NET development practices.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run start:dev
```

**Access Points:**
- API: http://localhost:3000/api/v1
- Swagger Docs: http://localhost:3000/api/docs

## What It Does

- 📊 **Stock Data**: Fetches and stores BIST 100 stock prices from Oyak API
- 📰 **RSS Feeds**: Aggregates financial news from multiple sources
- 🔄 **Scheduled Jobs**: Automated data fetching with configurable intervals
- 📈 **REST API**: Full CRUD operations with pagination and filtering

## Project Structure

```
src/
├── modules/
│   ├── stocks/              # Stock price management
│   ├── feed/                # RSS feed aggregation
│   ├── job-execution-history/  # Scheduled job tracking
│   └── scheduler/           # Job scheduling system
└── common/
    ├── base/                # Base classes (Repository, Controller, DTO)
    ├── decorators/          # Custom decorators (@CrudResource, @AutoEntity)
    └── services/            # Shared services (Scheduler)
```

## Key Patterns

### 1. Decorator-Driven Architecture
Eliminate boilerplate with custom decorators:

```typescript
@CrudResource({path: 'stocks', entityName: 'Stock', entity: Stock, requestDto: SaveStockDto, responseDto: StockResponseDto, listResponseDto: StockListResponseDto})
export class StocksController {
  // CRUD endpoints auto-registered!
}
```

### 2. Repository Pattern
Base repository with common operations:

```typescript
@Injectable()
export class StockRepository extends BaseRepository<Stock> {
  async findLatestByMarketType(marketType: MarketTypeEnum): Promise<Stock[]> {
    return await this.repository.query(SQLQueries.findLatestByMarketType, [marketType]);
  }
}
```

### 3. Mapping-Based DTOs
Centralized validation and Swagger config:

```typescript
export const SaveStockMapping = {
  symbol: () => StringField('Stock symbol', 'AKBNK', true, 2, 10),
  lastPrice: () => NumberField('Last traded price', 60.8, true, 0.0001, 999999.9999),
};
```

## Features

- ✅ **Zero Boilerplate**: Custom decorators handle repetitive code
- ✅ **Auto CRUD**: Standard endpoints (save, get, getList, delete) auto-generated
- ✅ **Auto Validation**: Field-level validation from mapping configs
- ✅ **Auto Swagger**: API documentation generated automatically
- ✅ **Type Safe**: Full TypeScript with strict typing
- ✅ **Clean Architecture**: Separated layers (Controller → Service → Repository)

## Standard API Endpoints

Every module automatically gets:

- `POST /api/v1/{module}/save` - Create or update
- `GET /api/v1/{module}/get?id=1` - Get by ID
- `POST /api/v1/{module}/getlist` - Paginated list with filters
- `DELETE /api/v1/{module}/delete?id=1` - Delete by ID

## Example Modules

### Stocks Module
- Fetches BIST 100 prices from Oyak API
- Stores historical price data
- Custom endpoint: `POST /api/v1/stocks/fetch/bist100`

### Feed Module
- Aggregates RSS feeds from financial news sources
- Parses and stores feed items
- Custom endpoint: `POST /api/v1/feed/fetch/all`

## Development Guide

For AI agents and detailed coding rules:

📖 **See [AGENTS.md](./AGENTS.md)** - Complete architectural guidelines and patterns

## Database

PostgreSQL with TypeORM. Migrations in `database/migrations/`.

```bash
# Run migrations
npm run migration:run

# Create migration
npm run migration:create
```

## Technology Stack

- **Framework**: NestJS 10
- **ORM**: TypeORM with PostgreSQL
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI
- **Scheduler**: node-cron
- **HTTP Client**: Axios

## License

MIT

