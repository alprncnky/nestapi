# InsightAPI - AI Agent Coding Rules

## Code Style Rules

### 1. Single-Line Formatting
Write compact, single-line code where possible. Avoid unnecessary line breaks.

**✅ GOOD:**
```typescript
@CrudResource({path: 'stocks', entityName: 'Stock', entity: Stock, requestDto: SaveStockDto, responseDto: StockResponseDto, listResponseDto: StockListResponseDto})
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}
}
```

**❌ BAD:**
```typescript
@CrudResource({
  path: 'stocks',
  entityName: 'Stock',
  entity: Stock,
  requestDto: SaveStockDto,
  responseDto: StockResponseDto,
  listResponseDto: StockListResponseDto
})
```

### 2. No Unnecessary Comments
Only add comments when business logic is complex or non-obvious. Code should be self-explanatory.

**✅ GOOD:**
```typescript
async fetchAndSaveBist100(): Promise<{ saved: number; errors: number }> {
  const oyakStocks = await this.oyakFetchService.fetchBist100Prices();
  let saved = 0;
  let errors = 0;
  for (const oyakData of oyakStocks) {
    try {
      const stockEntity = this.oyakFetchService.convertToStockEntity(oyakData);
      await this.stockRepository.save(stockEntity);
      saved++;
    } catch (error) {
      errors++;
    }
  }
  return { saved, errors };
}
```

**❌ BAD:**
```typescript
async fetchAndSaveBist100(): Promise<{ saved: number; errors: number }> {
  // Fetch stocks from Oyak service
  const oyakStocks = await this.oyakFetchService.fetchBist100Prices();
  
  // Initialize counters
  let saved = 0;
  let errors = 0;
  
  // Loop through each stock
  for (const oyakData of oyakStocks) {
    ...
  }
}
```

### 3. Clean Import Organization
Group imports logically: NestJS decorators → Entities → DTOs → Services/Repositories

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../../common/base/base-repository';
import { Stock } from '../entities/stock.entity';
import { MarketTypeEnum } from '../../contracts/enums/market-type.enum';
import { SQLQueries } from './stock.queries';
```

## Module Structure

```
modules/[module-name]/
├── controllers/
│   └── [entity].controller.ts
├── business/
│   ├── services/
│   │   └── [entity].service.ts
│   └── orchestration/
│       └── schedules/
├── data/
│   ├── entities/
│   │   └── [entity].entity.ts
│   ├── repositories/
│   │   ├── [entity].repository.ts
│   │   └── [entity].queries.ts
│   └── schemas/
│       └── [entity].schema.ts
└── contracts/
    ├── requests/
    │   ├── save-[entity].dto.ts
    │   └── mapping.ts
    ├── responses/
    │   ├── [entity]-response.dto.ts
    │   ├── [entity]-list-response.dto.ts
    │   └── mapping.ts
    └── enums/
        └── [name].enum.ts
```

## Layer Implementation

### 1. Entity (Data Layer)
```typescript
import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';
import { MarketTypeEnum } from '../../contracts/enums/market-type.enum';

@AutoEntity()
export class Stock {
  id: number;
  symbol: string;
  name: string;
  lastPrice: number;
  marketType: MarketTypeEnum;
  createdAt: Date;
  updatedAt: Date;
}
```

**Rules:**
- Use `@AutoEntity()` decorator
- No constructor, no methods
- Only property declarations
- Import enums from contracts

### 2. Schema (Data Layer)
```typescript
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
    marketType: { type: 'enum', enum: MarketTypeEnum },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  indices: [
    { name: 'idx_symbol', columns: ['symbol'] },
    { name: 'idx_market_type', columns: ['marketType'] },
  ],
});
```

**Rules:**
- One schema per entity
- Define indices for frequently queried columns
- Use appropriate TypeORM column types

### 3. Request DTO (Contracts Layer)
```typescript
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
  marketType: MarketTypeEnum;
}
```

**Rules:**
- Extend `BaseDto`
- Use `@AutoApplyDecorators(mapping)`
- Import mapping from `./mapping.ts`
- Include `id?: number` for updates

### 4. Request Mapping (Contracts Layer)
```typescript
import { StringField, NumberField, EnumField } from '../../../../common/decorators/field.decorator';
import { MarketTypeEnum } from '../enums/market-type.enum';

export const SaveStockMapping = {
  id: () => NumberField('Stock ID (optional, for updates)', 1, false),
  symbol: () => StringField('Stock symbol', 'AKBNK', true, 2, 10),
  name: () => StringField('Stock name', 'AKBANK', true, 2, 255),
  lastPrice: () => NumberField('Last traded price', 60.8, true, 0.0001, 999999.9999),
  marketType: () => EnumField(MarketTypeEnum, 'Market type', MarketTypeEnum.BIST100, true),
};
```

**Rules:**
- Export as plain object
- Use field decorators: `StringField`, `NumberField`, `EnumField`, `BooleanField`
- Parameters: `(description, example, required, min?, max?)`
- Single-line format

### 5. Response DTO (Contracts Layer)
```typescript
import { BaseResponseDto } from '../../../../common/base/base-dto';
import { AutoResponse } from '../../../../common/decorators/auto-response.decorator';
import { MarketTypeEnum } from '../enums/market-type.enum';
import { StockResponseMapping } from './mapping';

@AutoResponse(StockResponseMapping)
export class StockResponseDto extends BaseResponseDto {
  symbol: string;
  name: string;
  lastPrice: number;
  marketType: MarketTypeEnum;
}
```

**Rules:**
- Extend `BaseResponseDto` (includes id, createdAt, updatedAt)
- Use `@AutoResponse(mapping)`
- Mirror entity properties

### 6. Response Mapping (Contracts Layer)
```typescript
import { ResponseFieldConfig } from '../../../../common/decorators/auto-response.decorator';
import { MarketTypeEnum } from '../enums/market-type.enum';

export const StockResponseMapping: Record<string, ResponseFieldConfig> = {
  symbol: { description: 'Stock symbol', example: 'AKBNK', required: true, type: String },
  name: { description: 'Stock name', example: 'AKBANK', required: true, type: String },
  lastPrice: { description: 'Last traded price', example: 60.8, required: true, type: Number },
  marketType: { description: 'Market type', example: MarketTypeEnum.BIST100, required: true, enum: MarketTypeEnum },
};
```

**Rules:**
- Type: `Record<string, ResponseFieldConfig>`
- For primitives: use `type: String/Number/Boolean/Date`
- For enums: use `enum: EnumType`
- Single-line format per field

### 7. Repository (Data Layer)
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../../common/base/base-repository';
import { Stock } from '../entities/stock.entity';
import { MarketTypeEnum } from '../../contracts/enums/market-type.enum';
import { SQLQueries } from './stock.queries';

@Injectable()
export class StockRepository extends BaseRepository<Stock> {
  constructor(@InjectRepository(Stock) protected readonly repository: Repository<Stock>) {
    super(repository);
  }

  async findLatestByMarketType(marketType: MarketTypeEnum): Promise<Stock[]> {
    return await this.repository.query(SQLQueries.findLatestByMarketType, [marketType]);
  }

  async deleteOlderThan(date: Date): Promise<void> {
    await this.repository.query(SQLQueries.deleteOlderThan, [date]);
  }
}
```

**Rules:**
- Extend `BaseRepository<Entity>`
- Use `@Injectable()` decorator
- Inject `@InjectRepository(Entity)`
- Add custom query methods only
- Use raw SQL queries from `[entity].queries.ts` for complex operations

### 8. SQL Queries (Data Layer)
```typescript
export const SQLQueries = {
  findLatestByMarketType: `
    SELECT * FROM stocks 
    WHERE market_type = $1 
    ORDER BY fetched_at DESC 
    LIMIT 100
  ` as const,

  deleteOlderThan: `
    DELETE FROM stocks 
    WHERE fetched_at < $1
  ` as const,
} as const;
```

**Rules:**
- Export as const object
- Use parameterized queries (`$1`, `$2`, etc.)
- Add `as const` for type safety
- Keep SQL formatted and readable

### 9. Service (Business Layer)
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Stock } from '../../data/entities/stock.entity';
import { StockRepository } from '../../data/repositories/stock.repository';
import { OyakFetchService } from './oyak-fetch.service';

@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);

  constructor(
    private readonly stockRepository: StockRepository,
    private readonly oyakFetchService: OyakFetchService,
  ) {}

  async fetchAndSaveBist100(): Promise<{ saved: number; errors: number }> {
    const oyakStocks = await this.oyakFetchService.fetchBist100Prices();
    let saved = 0;
    let errors = 0;
    for (const oyakData of oyakStocks) {
      try {
        const stockEntity = this.oyakFetchService.convertToStockEntity(oyakData);
        await this.stockRepository.save(stockEntity);
        saved++;
      } catch (error) {
        this.logger.error(`Failed to save stock ${oyakData.symbol}: ${error.message}`);
        errors++;
      }
    }
    return { saved, errors };
  }
}
```

**Rules:**
- Use `@Injectable()` decorator
- Inject repositories and other services
- Add logger: `private readonly logger = new Logger(ServiceName.name)`
- Focus on business logic
- Use repository methods for data access

### 10. Controller (API Layer)
```typescript
import { CrudResource } from '../../../common/decorators/crud-resource.decorator';
import { FetchEndpoint } from '../../../common/decorators/endpoint.decorator';
import { Stock } from '../data/entities/stock.entity';
import { SaveStockDto } from '../contracts/requests/save-stock.dto';
import { StockResponseDto } from '../contracts/responses/stock-response.dto';
import { StockListResponseDto } from '../contracts/responses/stock-list-response.dto';
import { StocksService } from '../business/services/stocks.service';

@CrudResource({path: 'stocks', entityName: 'Stock', entity: Stock, requestDto: SaveStockDto, responseDto: StockResponseDto, listResponseDto: StockListResponseDto})
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @FetchEndpoint('bist100', FetchBist100ResponseDto)
  async fetchBist100(): Promise<FetchBist100ResponseDto> {
    const result = await this.stocksService.fetchAndSaveBist100();
    return new FetchBist100ResponseDto({message: 'BIST 100 fetch completed', saved: result.saved, errors: result.errors});
  }
}
```

**Rules:**
- Use `@CrudResource` decorator with all config in single line
- No inheritance from BaseController (decorator handles it)
- Standard CRUD endpoints auto-registered: `save`, `get`, `getList`, `delete`
- Add custom endpoints with decorators: `@FetchEndpoint`, `@CustomEndpoint`
- Keep controllers thin, delegate to services

### 11. Module Configuration
```typescript
import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockSchema } from './data/schemas/stock.schema';
import { StocksController } from './controllers/stocks.controller';
import { StocksService } from './business/services/stocks.service';
import { OyakFetchService } from './business/services/oyak-fetch.service';
import { StockRepository } from './data/repositories/stock.repository';
import { StockFetchSchedule } from './business/orchestration/schedules/stock-fetch.schedule';
import { BaseSchedulerService } from '../../common/services/base-scheduler.service';

@Module({
  imports: [TypeOrmModule.forFeature([StockSchema])],
  controllers: [StocksController],
  providers: [StocksService, OyakFetchService, StockRepository, StockFetchSchedule],
  exports: [StocksService, OyakFetchService, StockRepository],
})
export class StocksModule implements OnModuleInit {
  constructor(
    private readonly baseScheduler: BaseSchedulerService,
    private readonly stockFetchSchedule: StockFetchSchedule,
  ) {}

  async onModuleInit() {
    this.baseScheduler.registerTask(this.stockFetchSchedule);
  }
}
```

**Rules:**
- Single-line arrays where possible
- Register schemas in `imports`
- Register controllers, services, repositories in `providers`
- Export services and repositories
- Use `OnModuleInit` for scheduled tasks

## Quick Reference

### Decorators Used:
- `@AutoEntity()` - Entity classes
- `@AutoApplyDecorators(mapping)` - Request DTOs
- `@AutoResponse(mapping)` - Response DTOs
- `@CrudResource({...})` - Controllers
- `@FetchEndpoint(path, responseDto)` - Custom fetch endpoints
- `@Injectable()` - Services and repositories

### Base Classes:
- `BaseDto` - Request DTOs
- `BaseResponseDto` - Response DTOs (has id, createdAt, updatedAt)
- `BaseRepository<T>` - Repositories
- No BaseController inheritance (handled by `@CrudResource`)

### Field Decorators:
- `StringField(description, example, required, min?, max?)`
- `NumberField(description, example, required, min?, max?)`
- `EnumField(enumType, description, example, required)`
- `BooleanField(description, example, required)`

### Standard CRUD Endpoints (Auto-registered):
- `POST /[path]/save` - Create or update
- `GET /[path]/get?id=1` - Get by ID
- `POST /[path]/getlist` - Paginated list
- `DELETE /[path]/delete?id=1` - Delete by ID

## Naming Conventions

- **Entity:** `Stock` (singular, PascalCase)
- **Schema:** `StockSchema`
- **Repository:** `StockRepository`
- **Service:** `StocksService` (plural)
- **Controller:** `StocksController` (plural)
- **Request DTO:** `SaveStockDto`
- **Response DTO:** `StockResponseDto`
- **List Response:** `StockListResponseDto`
- **Mapping:** `SaveStockMapping`, `StockResponseMapping`
- **Enum:** `MarketTypeEnum`, `SourceCategoryEnum`
- **SQL Queries:** `SQLQueries` (in `[entity].queries.ts`)

## Development Checklist

When creating a new module:

1. ✅ Create folder structure: `controllers/`, `business/services/`, `data/`, `contracts/`
2. ✅ Create entity with `@AutoEntity()` decorator
3. ✅ Create TypeORM schema
4. ✅ Create request DTO with `@AutoApplyDecorators(mapping)` and mapping file
5. ✅ Create response DTO with `@AutoResponse(mapping)` and mapping file
6. ✅ Create list response DTO
7. ✅ Create repository extending `BaseRepository`
8. ✅ Create SQL queries file if needed (`[entity].queries.ts`)
9. ✅ Create service with business logic
10. ✅ Create controller with `@CrudResource` decorator
11. ✅ Create module configuration and register in `app.module.ts`
12. ✅ Test endpoints in Swagger

## Database & Migrations

### Migration Commands

```bash
# Generate migration from entity changes
npm run migration:generate --name=MigrationName

# Create empty migration file
npm run migration:create --name=CustomChanges

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Workflow

1. Create or modify entity with `@AutoEntity()`
2. Update schema in `data/schemas/`
3. Generate migration: `npm run migration:generate --name=DescriptiveName`
4. Review generated migration in `database/migrations/`
5. Run migration: `npm run migration:run`

### Rules
- Never use `synchronize: true` in production
- One migration per feature/change
- Always test migrations before production
- Ensure `down()` method is properly implemented for rollbacks
- Keep migrations in version control

## Remember

- Write single-line code where possible
- Minimize comments (code should be self-documenting)
- Use decorators to eliminate boilerplate
- Keep controllers thin, services focused
- Use raw SQL for complex queries
- Follow consistent naming conventions

