# AGENTS.md - InsightAPI Development Guide

## Project Goal Section

### Overview
InsightAPI is a NestJS-based REST API built with Clean Architecture principles, designed to provide financial news analysis and RSS feed management capabilities. The project follows .NET Clean Architecture patterns adapted for Node.js/TypeScript ecosystem.

### Primary Objectives
- **Zero Boilerplate Development**: Implement three magic decorators (`@AutoEntity`, `@AutoApplyDecorators`, `@AutoResponse`) to eliminate repetitive code
- **Clean Architecture**: Maintain strict separation between Controller, Business, and Data layers
- **Type Safety**: Leverage TypeScript's type system for compile-time safety
- **DRY Principle**: Centralize validation rules, mappings, and documentation
- **Minimal Business Logic**: Keep controllers thin and focus on business logic in services
- **Inheritance-Based Design**: Use base classes and interfaces for consistent patterns

### Core Philosophy
**"Write business logic, NOT boilerplate."** The architecture eliminates 70% of repetitive code through intelligent decorators and base classes, allowing developers to focus on domain-specific business rules rather than infrastructure concerns.

## Project Structure

### High-Level Architecture
```
src/
├── common/                          # 🔧 Shared Infrastructure
│   ├── base/                        # Base classes (controllers, DTOs, repositories)
│   ├── decorators/                  # Custom decorators (field, controller, swagger)
│   ├── filters/                     # Exception filters
│   ├── interceptors/                # Response/logging interceptors
│   ├── pipes/                       # Validation pipes
│   ├── config/                      # Configuration mappings
│   └── interfaces/                  # Shared interfaces
│
├── modules/                         # 🏗️ Feature Modules (.NET Clean Architecture)
│   ├── [module-name]/
│   │   ├── controllers/             # 🔷 API Layer (.NET: Controllers)
│   │   ├── business/                 # 🔷 Business Layer (.NET: Business)
│   │   │   ├── services/            # Business logic implementations
│   │   │   └── orchestration/       # Scheduled tasks, workflows
│   │   ├── data/                    # 🔷 Data Layer (.NET: DataAccess)
│   │   │   ├── entities/            # Domain entities
│   │   │   ├── repositories/        # Data access implementations
│   │   │   │   └── *.queries.ts    # SQL query scripts (raw SQL)
│   │   │   └── schemas/             # TypeORM schemas
│   │   └── contracts/               # 🔷 Contracts (.NET: Contracts)
│   │       ├── requests/            # Input DTOs
│   │       ├── responses/           # Output DTOs
│   │       └── enums/               # Module-specific enums
│   │
├── config/                          # Application configuration
├── database/                        # Database migrations & seeds
├── app.module.ts                    # Root module
└── main.ts                          # Application bootstrap
```

### Module Organization Rules

**Enums:**
- Store all module-specific enums in the `contracts/enums/` folder
- Naming convention: `[name].enum.ts` (e.g., `feed-type.enum.ts`, `source-category.enum.ts`)
- Use descriptive enum values with clear business meaning

**File Naming Conventions:**
- Controllers: `[entity].controller.ts`
- Services: `[entity].service.ts`
- Repositories: `[entity].repository.ts`
- Query Scripts: `[entity].queries.ts` (raw SQL scripts)
- Entities: `[entity].entity.ts`
- DTOs: `[action]-[entity].dto.ts` (e.g., `save-rss-source.dto.ts`)
- Responses: `[entity]-response.dto.ts`, `[entity]-list-response.dto.ts`

## Project Base Classes and Logics

### 1. Base Controller Pattern
The `BaseController` provides generic CRUD operations with type safety:

```typescript
export abstract class BaseController<T1, T2, T3, T4, T5> {
  constructor(
    protected readonly service: IBaseService<T1>,
    protected readonly repository: BaseRepository<any> | undefined,
    protected readonly responseClass: new (data: T1) => T4,
    protected readonly listResponseClass: new (items: T4[], total: number) => T5,
    protected readonly entityName: string,
    protected readonly requestClass: new (...args: any[]) => T2,
  ) {}
}
```

**Generic Types:**
- `T1`: Entity type
- `T2`: Create/Update DTO type
- `T3`: Update DTO type (can be same as T2)
- `T4`: Response DTO type
- `T5`: List Response DTO type

### 2. Base DTO Hierarchy
```typescript
// Abstract base for all DTOs
export abstract class BaseDto {}

// For create operations
export abstract class BaseCreateDto extends BaseDto {}

// For update operations  
export abstract class BaseUpdateDto extends BaseDto {}

// Response DTOs with common properties
export abstract class BaseResponseDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// Generic list response
export class BaseListResponseDto<T> {
  items: T[];
  total: number;
}
```

### 3. Base Repository Pattern
```typescript
export abstract class BaseRepository<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}
  
  async findAll(options?: FindManyOptions<T>): Promise<T[]>
  async findById(id: number): Promise<T | null>
  async findOne(where: FindOptionsWhere<T>): Promise<T | null>
  async save(entity: T): Promise<T>
  async update(id: number, partialEntity: Partial<T>): Promise<void>
  async remove(entity: T): Promise<void>
  async findWithPagination(criteriaDto: CriteriaDto): Promise<{ entities: T[]; totalCount: number }>
}
```

### 4. SQL Query Scripts Pattern
For performance-critical operations, use centralized SQL query scripts:

```typescript
// [entity].queries.ts
export const SQLQueries = {
  findBySymbolAndDateRange: `
    SELECT 
        sp.id,
        sp.stock_symbol,
        sp.stock_name,
        sp.open,
        sp.close,
        sp.high,
        sp.low,
        sp.last,
        sp.daily_change_price,
        sp.daily_change_percent,
        sp.volume_turkish_lira,
        sp.volume_lot,
        sp.volatility,
        sp.exchange,
        sp.currency,
        sp.last_update,
        sp.fetched_at,
        sp.created_at,
        sp.updated_at
    FROM stock_prices sp
    WHERE sp.stock_symbol = $1
      AND sp.last_update BETWEEN $2 AND $3
    ORDER BY sp.last_update ASC
  ` as const,
} as const;

// Usage in repository
async findBySymbolAndDateRange(
  symbol: string,
  startDate: Date,
  endDate: Date,
): Promise<StockPrice[]> {
  return await this.repository.query(
    SQLQueries.findBySymbolAndDateRange,
    [symbol, startDate, endDate]
  );
}
```

**Benefits:**
- **Performance**: Raw SQL is faster than TypeORM QueryBuilder
- **Centralized**: All SQL scripts in one place for easy maintenance
- **Type Safety**: Maintains TypeScript return types
- **Security**: Parameterized queries prevent SQL injection

## Project Modules Description and Purpose

### Current Modules

#### 1. RSS Sources Module (`rss-sources/`)
**Purpose**: Manages RSS feed sources with reliability tracking and scheduled fetching.

**Key Features:**
- CRUD operations for RSS sources
- Reliability score tracking
- Scheduled RSS feed fetching
- Source categorization and filtering

**Business Logic:**
- URL uniqueness validation
- Reliability score updates
- Active/inactive source management
- Fetch interval configuration

#### 2. News Module (`news/`)
**Purpose**: Processes and analyzes news articles from RSS feeds.

**Key Features:**
- News article storage and retrieval
- Tag extraction and management
- Stock mention detection
- Sentiment analysis

**Business Logic:**
- Article deduplication
- Tag categorization
- Stock symbol extraction
- Impact level assessment

#### 3. News Reliability Module (`news-reliability/`)
**Purpose**: Tracks and analyzes news source reliability metrics.

**Key Features:**
- Reliability score calculation
- Prediction impact tracking
- Source performance monitoring

#### 4. Stock Prices Module (`stock-prices/`)
**Purpose**: Fetches and stores stock price data from external APIs.

**Key Features:**
- BIST API integration
- Scheduled price fetching
- Historical price storage

## Project Module Structure and Code Style with Examples

### 1. Entity Definition with @AutoEntity
```typescript
import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';
import { FeedTypeEnum } from '../../contracts/enums/feed-type.enum';

@AutoEntity()
export class RssSource {
  id: number;
  name: string;
  url: string;
  feedType: FeedTypeEnum;
  category: SourceCategoryEnum;
  country: string;
  reliabilityScore: number;
  isActive: boolean;
  fetchInterval: number;
  lastFetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Usage - automatic mapping!
const source = new RssSource({
  name: 'Bloomberg HT',
  url: 'https://www.bloomberght.com/rss',
  feedType: FeedTypeEnum.RSS2,
  category: SourceCategoryEnum.COMPANY_NEWS,
  country: 'TR',
  reliabilityScore: 75,
  isActive: true,
  fetchInterval: 60,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### 2. Input DTO with @AutoApplyDecorators
```typescript
import { BaseDto } from '../../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../../common/decorators/auto-apply.decorator';
import { SaveRssSourceMapping } from './mapping';

@AutoApplyDecorators(SaveRssSourceMapping)
export class SaveRssSourceDto extends BaseDto {
  id?: number;
  name: string;
  url: string;
  feedType: FeedTypeEnum;
  category: SourceCategoryEnum;
  country: string;
  fetchInterval: number;
  isActive?: boolean;
  reliabilityScore?: number;
}
```

**Field Mapping Configuration:**
```typescript
// contracts/requests/mapping.ts
export const SaveRssSourceMapping = {
  id: () => NumberField('RSS source ID (optional, for updates)', 1, false),
  name: () => StringField('RSS source name', 'Bloomberg HT', true, 3, 255),
  url: () => StringField('RSS feed URL', 'https://www.bloomberght.com/rss', true, 10, 500),
  feedType: () => EnumField(FeedTypeEnum, 'RSS feed type', FeedTypeEnum.RSS2, true),
  category: () => EnumField(SourceCategoryEnum, 'Source category', SourceCategoryEnum.COMPANY_NEWS, true),
  country: () => StringField('Country code (ISO 3166-1 alpha-2)', 'TR', true, 2, 10),
  fetchInterval: () => NumberField('Fetch interval in minutes', 60, true, 5, 1440),
  isActive: () => BooleanField('Is source active', true, false),
  reliabilityScore: () => NumberField('Source reliability score (0-100)', 75.5, false, 0, 100),
};
```

### 3. Response DTO with @AutoResponse
```typescript
import { BaseResponseDto } from '../../../../common/base/base-dto';
import { AutoResponse } from '../../../../common/decorators/auto-response.decorator';
import { RssSourceResponseMapping } from './mapping';

@AutoResponse(RssSourceResponseMapping)
export class RssSourceResponseDto extends BaseResponseDto {
  name: string;
  url: string;
  feedType: string;
  category: string;
  country: string;
  reliabilityScore: number;
  isActive: boolean;
  fetchInterval: number;
  lastFetchedAt?: Date;
}

// Usage - automatic entity-to-DTO mapping!
const response = new RssSourceResponseDto(entity);
```

**Response Mapping Configuration:**
```typescript
// contracts/responses/mapping.ts
export const RssSourceResponseMapping: Record<string, ResponseFieldConfig> = {
  name: { description: 'RSS source name', example: 'Bloomberg HT', required: true, type: String },
  url: { description: 'RSS feed URL', example: 'https://www.bloomberght.com/rss', required: true, type: String },
  feedType: { description: 'RSS feed type', example: 'RSS_2_0', required: true, enum: FeedTypeEnum },
  category: { description: 'Source category', example: 'NEWS', required: true, enum: SourceCategoryEnum },
  country: { description: 'Country code (ISO 3166-1 alpha-2)', example: 'TR', required: true, type: String },
  reliabilityScore: { description: 'Source reliability score (0-100)', example: 85.5, required: true, type: Number },
  isActive: { description: 'Is source active', example: true, required: true, type: Boolean },
  fetchInterval: { description: 'Fetch interval in minutes', example: 60, required: true, type: Number },
  lastFetchedAt: { description: 'Last fetch timestamp', example: '2024-01-01T00:00:00Z', required: false, type: Date },
};
```

### 4. Controller Implementation
```typescript
import { Query, Body, ParseIntPipe } from '@nestjs/common';
import { CrudController } from '../../../common/decorators/crud-controller.decorator';
import { SaveEndpoint, GetEndpoint, GetListEndpoint, DeleteEndpoint } from '../../../common/decorators/endpoint.decorator';
import { BaseController } from '../../../common/base/base-controller';

@CrudController('rss-sources', 'RssSource')
export class RssSourcesController extends BaseController<RssSource, SaveRssSourceDto, SaveRssSourceDto, RssSourceResponseDto, RssSourceListResponseDto> {
  constructor(
    private readonly rssSourcesService: RssSourcesService,
    private readonly rssSourceRepository: RssSourceRepository,
  ) {
    super(
      rssSourcesService,
      rssSourceRepository,
      RssSourceResponseDto,
      RssSourceListResponseDto,
      'RssSource',
      SaveRssSourceDto,
    );
  }

  @SaveEndpoint(SaveRssSourceDto, RssSourceResponseDto)
  async save(@Body() dto: SaveRssSourceDto): Promise<RssSourceResponseDto> {
    return super.save(dto);
  }

  @GetEndpoint('RssSource', RssSourceResponseDto)
  async get(@Query('id', ParseIntPipe) id: number): Promise<RssSourceResponseDto> {
    return super.get(id);
  }

  @GetListEndpoint('RssSource', CriteriaDto, RssSourceListResponseDto)
  async getList(@Body() criteriaDto: CriteriaDto): Promise<RssSourceListResponseDto> {
    return super.getList(criteriaDto);
  }

  @DeleteEndpoint('RssSource')
  async delete(@Query('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return super.delete(id);
  }
}
```

### 5. Service Implementation
```typescript
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { RssSource } from '../../data/entities/rss-source.entity';
import { SaveRssSourceDto } from '../../contracts/requests/save-rss-source.dto';
import { RssSourceRepository } from '../../data/repositories/rss-source.repository';

@Injectable()
export class RssSourcesService {
  constructor(private readonly rssSourceRepository: RssSourceRepository) {}

  async save(saveRssSourceDto: SaveRssSourceDto): Promise<RssSource> {
    const id = saveRssSourceDto.id;

    if (id) {
      // Update existing RSS source
      const source = await this.rssSourceRepository.findById(id);
      if (!source) {
        throw new NotFoundException(`RSS Source with ID ${id} not found`);
      }

      // Validate URL uniqueness if changed
      if (saveRssSourceDto.url && saveRssSourceDto.url !== source.url) {
        await this.validateUniqueUrl(saveRssSourceDto.url, id);
      }

      Object.assign(source, { ...saveRssSourceDto, updatedAt: new Date() });
      return await this.rssSourceRepository.save(source);
    } else {
      // Create new RSS source
      await this.validateUniqueUrl(saveRssSourceDto.url);

      const rssSource = new RssSource();
      Object.assign(rssSource, {
        ...saveRssSourceDto,
        reliabilityScore: saveRssSourceDto.reliabilityScore ?? 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return await this.rssSourceRepository.save(rssSource);
    }
  }

  async remove(id: number): Promise<void> {
    const source = await this.rssSourceRepository.findById(id);
    if (!source) {
      throw new NotFoundException(`RSS Source with ID ${id} not found`);
    }
    await this.rssSourceRepository.remove(source);
  }

  private async validateUniqueUrl(url: string, excludeId?: number): Promise<void> {
    const existingSource = await this.rssSourceRepository.findByUrl(url);
    if (existingSource && existingSource.id !== excludeId) {
      throw new ConflictException(`RSS source with URL "${url}" already exists`);
    }
  }
}
```

### 6. Repository Implementation
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../../common/base/base-repository';
import { RssSource } from '../entities/rss-source.entity';
import { SourceCategoryEnum } from '../../contracts/enums/source-category.enum';

@Injectable()
export class RssSourceRepository extends BaseRepository<RssSource> {
  constructor(@InjectRepository(RssSource) repository: Repository<RssSource>) {
    super(repository);
  }

  async findByUrl(url: string): Promise<RssSource | null> {
    return await this.findOne({ url } as any);
  }

  async findActive(): Promise<RssSource[]> {
    return await this.findBy({ isActive: true } as any, { order: { reliabilityScore: 'DESC' } });
  }

  async findActiveByCategory(category: SourceCategoryEnum): Promise<RssSource[]> {
    return await this.findBy({ category, isActive: true } as any, { order: { reliabilityScore: 'DESC' } });
  }

  async countActive(): Promise<number> {
    return await this.count({ isActive: true } as any);
  }
}
```

### 7. Module Configuration
```typescript
import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RssSourceSchema } from './data/schemas/rss-source.schema';
import { RssSourcesController } from './controllers/rss-sources.controller';
import { RssSourcesService } from './business/services/rss-sources.service';
import { RssSourceRepository } from './data/repositories/rss-source.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RssSourceSchema,
    ]),
  ],
  controllers: [
    RssSourcesController,
  ],
  providers: [
    RssSourcesService,
    RssSourceRepository,
  ],
  exports: [
    RssSourcesService,
    RssSourceRepository,
  ],
})
export class RssSourcesModule implements OnModuleInit {
  // Module initialization logic
}
```

## Rules

### 1. Architecture Rules

#### Layer Responsibilities
- **Controller Layer**: Handle HTTP requests, delegate to services, return formatted responses
- **Business Layer**: Implement business logic, validation, orchestration
- **Data Layer**: Handle data persistence, queries, entity management

#### Dependency Direction
- Controllers depend on Services
- Services depend on Repositories
- Repositories depend on Entities
- **NO** reverse dependencies allowed

### 2. Code Style Rules

#### Entity Rules
- Always use `@AutoEntity()` decorator
- Define properties without manual constructors
- Use TypeScript interfaces for type safety
- Keep entities focused on data structure

#### DTO Rules
- Input DTOs: Use `@AutoApplyDecorators(mapping)` with centralized validation
- Response DTOs: Use `@AutoResponse(mapping)` with automatic mapping
- Extend appropriate base classes (`BaseCreateDto`, `BaseUpdateDto`, `BaseResponseDto`)
- Keep DTOs focused on data transfer, not business logic

#### Controller Rules
- Extend `BaseController` for standard CRUD operations
- Use `@CrudController` decorator for consistent API tags
- Override base methods only for custom business logic
- Keep controllers thin - delegate to services

#### Service Rules
- Implement business validation before data operations
- Use dependency injection for repositories and other services
- Throw appropriate NestJS exceptions (`NotFoundException`, `ConflictException`, etc.)
- Keep services focused on business logic

#### Repository Rules
- Extend `BaseRepository` for standard operations
- Add custom query methods as needed
- Use TypeORM decorators for database mapping
- Keep repositories focused on data access
- **For Performance**: Use SQL query scripts (`*.queries.ts`) for complex queries
- **Query Scripts**: Store raw SQL in `[entity].queries.ts` files with `as const` typing
- **Parameterized Queries**: Always use parameter placeholders (`$1`, `$2`, etc.) for security

### 3. Naming Conventions

#### Files and Classes
- Controllers: `[Entity]Controller`
- Services: `[Entity]Service`
- Repositories: `[Entity]Repository`
- Entities: `[Entity]` (singular)
- DTOs: `[Action][Entity]Dto` (e.g., `SaveRssSourceDto`)

#### Methods
- Service methods: `save()`, `findById()`, `remove()`
- Repository methods: `findBy[Field]()`, `findActive()`, `countActive()`
- Controller methods: `save()`, `get()`, `getList()`, `delete()`

### 4. Validation Rules

#### Field Validation
- Use centralized mapping files for validation rules
- Apply validation decorators through `@AutoApplyDecorators`
- Include Swagger documentation in field decorators
- Validate business rules in service layer

#### Error Handling
- Use NestJS built-in exceptions
- Provide descriptive error messages
- Handle validation errors consistently
- Log errors appropriately

### 5. Documentation Rules

#### Swagger Documentation
- Use `@AutoResponse` for automatic response documentation
- Include examples and descriptions in field mappings
- Use consistent API tags with `@CrudController`
- Document custom endpoints with appropriate decorators

#### Code Documentation
- Document complex business logic
- Include JSDoc comments for public methods
- Explain non-obvious implementation decisions
- Keep documentation up-to-date

### 7. Performance Rules

#### Database Operations
- Use appropriate indexes
- Implement pagination for list operations
- Avoid N+1 queries
- Use transactions when needed

#### Caching
- Cache frequently accessed data
- Use appropriate cache strategies
- Invalidate cache when data changes
- Monitor cache performance

### 8. Security Rules

#### Input Validation
- Validate all inputs
- Sanitize user data
- Use parameterized queries
- Implement rate limiting

#### Authentication/Authorization
- Implement proper authentication
- Use role-based access control
- Validate permissions
- Log security events

---

## Development Checklist

### When Adding New Module:

1. **Create Module Structure**
   - Create module folder with `controllers/`, `business/services/`, `data/`, `contracts/` subfolders
   - Add module file (`[module].module.ts`)

2. **Create Enums** (if needed)
   - Add to `contracts/enums/` folder
   - Use descriptive names and values

3. **Create Entity**
   - Add `@AutoEntity()` decorator
   - Define properties without constructor
   - Create corresponding schema file

4. **Create DTOs**
   - Create request DTOs with `@AutoApplyDecorators(mapping)`
   - Create response DTOs with `@AutoResponse(mapping)`
   - Create mapping files for validation and documentation

5. **Create Repository**
   - Extend `BaseRepository`
   - Add custom query methods as needed
   - Inject TypeORM repository
   - **For Performance**: Create `[entity].queries.ts` with SQL scripts

6. **Create Service**
   - Implement business logic
   - Add validation methods
   - Use dependency injection

7. **Create Controller**
   - Extend `BaseController`
   - Use `@CrudController` decorator
   - Override methods only when needed

8. **Register Module**
   - Add to `app.module.ts`
   - Configure TypeORM entities
   - Set up dependency injection

9. **Test Implementation**
   - Test CRUD operations
   - Test validation rules
   - Test error scenarios
   - Verify Swagger documentation

### Code Quality Checklist:

- ✅ Use `@AutoEntity()`, `@AutoApplyDecorators()`, `@AutoResponse()` decorators
- ✅ Extend appropriate base classes
- ✅ Follow naming conventions
- ✅ Implement proper error handling
- ✅ Add comprehensive validation
- ✅ Include Swagger documentation
- ✅ Follow Clean Architecture principles
- ✅ Use TypeScript features effectively
- ✅ Apply DRY principle
- ✅ Keep controllers thin
- ✅ Focus on business logic in services
