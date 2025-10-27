# RSS Sources Module - .NET Clean Architecture

## Overview

This module manages RSS feed sources with .NET-style Clean Architecture principles. It provides CRUD operations, RSS feed parsing, scheduled fetching, and reliability tracking.

## Architecture - .NET Clean Architecture Pattern

### Project Structure

```
rss-sources/
├── controllers/                  # 🔷 API LAYER (.NET: YourProject.API/Controllers)
│   └── rss-sources.controller.ts
│
├── business/                     # 🔷 BUSINESS LAYER (.NET: YourProject.Business)
│   ├── services/
│   │   ├── rss-sources.service.ts       # Main CRUD + validation
│   │   ├── rss-fetch.service.ts         # RSS processing logic
│   │   └── rss-parser.service.ts        # Utility service
│   └── orchestration/
│       └── schedules/
│           └── rss-fetch.schedule.ts    # Scheduled tasks
│
├── data/                         # 🔷 DATA LAYER (.NET: YourProject.DataAccess)
│   ├── repositories/
│   │   └── rss-source.repository.ts
│   ├── schemas/                  # TypeORM schemas
│   │   ├── rss-source.schema.ts
│   │   └── source-reliability-score.schema.ts
│   └── entities/                 # Domain entities
│       ├── rss-source.entity.ts
│       └── source-reliability-score.entity.ts
│
├── contracts/                    # 🔷 CONTRACTS (.NET: YourProject.Contracts)
│   ├── requests/                 # Input DTOs
│   │   ├── save-rss-source.dto.ts
│   │   └── mapping.ts            # Field validation mappings
│   ├── responses/                # Output DTOs
│   │   ├── rss-source-response.dto.ts
│   │   ├── rss-source-list-response.dto.ts
│   │   └── mapping.ts            # Response field mappings
│   └── enums/                    # Enums (part of API contract)
│       ├── feed-type.enum.ts
│       └── source-category.enum.ts
│
├── rss-sources.module.ts         # Module registration
└── README.md                     # Documentation
```

## Layer Responsibilities

### 1. API Layer (controllers/)

**Responsibility**: HTTP endpoints and request/response handling

**Location**: `controllers/`

**What it does**:
- ✅ Handle HTTP requests and responses
- ✅ Validate request parameters
- ✅ Delegate to business services
- ✅ Transform entities to response DTOs
- ✅ Apply HTTP decorators (routes, swagger)

**What it doesn't do**:
- ❌ Business logic
- ❌ Direct database access
- ❌ Complex transformations
- ❌ External API calls

**Example**:
```typescript
@CrudController('rss-sources', 'RssSource')
export class RssSourcesController extends BaseController {
  constructor(private readonly rssSourcesService: RssSourcesService) {
    super(rssSourcesService);
  }

  @GetEndpoint('RssSource', RssSourceResponseDto)
  async get(@Query('id', ParseIntPipe) id: number) {
    const source = await this.rssSourcesService.findById(id);
    return new RssSourceResponseDto(source);
  }
}
```

### 2. Business Layer (business/)

**Responsibility**: Business logic, validation, orchestration

**Location**: 
- `business/services/` - Business logic services
- `business/orchestration/schedules/` - Scheduled tasks

**What it does**:
- ✅ Implement business rules and validation
- ✅ Orchestrate complex operations
- ✅ Call repositories for data access
- ✅ Handle transactions
- ✅ Throw business exceptions

**What it doesn't do**:
- ❌ Handle HTTP concerns
- ❌ Direct database queries
- ❌ Return DTOs (return entities)
- ❌ Know about controllers

**Services**:
- `RssSourcesService`: Main CRUD operations with business rules
- `RssFetchService`: RSS feed processing business logic
- `RssParserService`: RSS parsing utility

**Example**:
```typescript
@Injectable()
export class RssSourcesService {
  async save(dto: SaveRssSourceDto): Promise<RssSource> {
    // 1. Business validation
    await this.validateUniqueUrl(dto.url);
    
    // 2. Business logic (default score = 50)
    const source = new RssSource({
      ...dto,
      reliabilityScore: dto.reliabilityScore ?? 50,
    });
    
    // 3. Delegate to repository
    return await this.repository.save(source);
  }
}
```

### 3. Data Layer (data/)

**Responsibility**: Database operations and data access

**Location**:
- `data/repositories/` - Repository pattern implementations
- `data/schemas/` - TypeORM schema definitions
- `data/entities/` - Domain entity classes

**What it does**:
- ✅ Execute database queries
- ✅ Build complex queries
- ✅ Encapsulate TypeORM operations
- ✅ Provide abstraction over data layer

**What it doesn't do**:
- ❌ Business validation
- ❌ Business logic
- ❌ Throw business exceptions (only data exceptions)
- ❌ Know about DTOs or HTTP

**Example**:
```typescript
@Injectable()
export class RssSourceRepository extends BaseRepository<RssSource> {
  async findActiveByCategory(category: SourceCategoryEnum): Promise<RssSource[]> {
    return await this.repository.find({
      where: { category, isActive: true },
      order: { reliabilityScore: 'DESC' },
    });
  }
}
```

### 4. Contracts (contracts/)

**Responsibility**: API contracts and data transfer objects

**Location**:
- `contracts/requests/` - Input DTOs with validation
- `contracts/responses/` - Output DTOs with Swagger
- `contracts/enums/` - API enums

**What it does**:
- ✅ Define API contracts
- ✅ Validation rules
- ✅ Swagger documentation
- ✅ Input/output transformation
- ✅ Type-safe enum definitions

**Request DTOs**: `SaveRssSourceDto` (.NET-style upsert pattern)

**Response DTOs**: `RssSourceResponseDto`, `RssSourceListResponseDto`

**Enums**: `FeedTypeEnum`, `SourceCategoryEnum`

**Example**:
```typescript
@AutoApplyDecorators(SaveRssSourceMapping)
export class SaveRssSourceDto extends BaseDto {
  id?: number;
  name: string;
  url: string;
  feedType: FeedTypeEnum;
  category: SourceCategoryEnum;
}
```


## Data Flow

### Create RSS Source Flow

```
Client Request
    ↓
[API Layer] - RssSourcesController.save()
    ↓ (validates SaveRssSourceDto)
[Business Layer] - RssSourcesService.save()
    ↓ (business validation: unique URL)
    ↓ (business logic: default score = 50)
[Data Layer] - RssSourceRepository.save()
    ↓ (database query)
[Database] - PostgreSQL/MySQL
    ↓ (returns entity)
[Business Layer] - returns RssSource entity
    ↓
[API Layer] - transforms to RssSourceResponseDto
    ↓
Client Response (auto-wrapped by ResponseInterceptor)
```

### RSS Fetch Schedule Flow

```
[Orchestration] - RssFetchSchedule (Cron trigger)
    ↓
[Business] - RssFetchService.processFeedSource()
    ↓ (business: validate source)
    ↓ (utility: parse RSS feed)
[Business] - RssParserService.parseFeed()
    ↓ (external: fetch RSS feed)
    ↓ (returns parsed items)
[Business] - RssFetchService
    ↓ (business: check duplicates)
    ↓ (business: create articles)
[Business] - NewsService.save()
    ↓
[Data] - Save articles to database
```

## Dependency Flow

```
API Layer (controllers)
    ↓ depends on
Business Layer (services)
    ↓ depends on
Data Layer (repositories)
    ↓ depends on
TypeORM / Database

Contracts (DTOs + Enums)
    ↑ used by API and Business layers
```

## Key Design Principles

### 1. Separation of Concerns
- Each layer has a single responsibility
- No mixing of concerns between layers
- Clear boundaries between layers

### 2. Dependency Inversion
- High-level modules don't depend on low-level modules
- Services depend on repository abstractions
- Controllers depend on service abstractions

### 3. Single Responsibility
- Each service/repository has one clear purpose
- `RssSourcesService`: CRUD + validation
- `RssFetchService`: RSS processing
- `RssParserService`: RSS parsing

### 4. DRY (Don't Repeat Yourself)
- Use base classes (`BaseController`, `BaseRepository`)
- Use decorators (`@AutoEntity`, `@AutoResponse`)
- Centralize validation in mappings

### 5. Testability
- Each layer can be tested independently
- Mock dependencies easily
- Clear boundaries enable isolation

## .NET Developer Notes

This structure directly mirrors .NET Clean Architecture:

| NestJS Layer | .NET Equivalent | Purpose |
|--------------|-----------------|---------|
| `controllers/` | `YourProject.API/Controllers` | HTTP endpoints |
| `business/` | `YourProject.Business` | Services, business logic |
| `data/` | `YourProject.DataAccess` | Repositories, EF Core, Entities |
| `contracts/` | `YourProject.Contracts` | DTOs, enums, request/response models |

**Familiar Patterns**:
- ✅ Repository Pattern
- ✅ Service Layer Pattern
- ✅ Dependency Injection
- ✅ DTO Pattern
- ✅ Clean Architecture Layers

## API Endpoints

### Standard CRUD (.NET-style)
- `POST /api/v1/rss-sources/save` - Save (create/update) RSS source
- `GET /api/v1/rss-sources/get?id={id}` - Get RSS source by ID
- `POST /api/v1/rss-sources/getlist` - Get paginated list
- `DELETE /api/v1/rss-sources/delete?id={id}` - Delete RSS source

See `/docs/NET-STYLE-ENDPOINTS.md` for details.

## Business Rules

1. **Default Reliability Score**: New sources start with score of 50
2. **Unique URL**: Each RSS source must have a unique URL
3. **Score Range**: Reliability score must be between 0-100
4. **Active Sources**: Only active sources are fetched by scheduler
5. **Fetch Interval**: Default fetch interval is 30 minutes

## Scheduled Tasks

### RSS Fetch Schedule
- **Interval**: Every minute
- **Location**: `business/orchestration/schedules/rss-fetch.schedule.ts`
- **Service**: `RssFetchService.processFeedSource()`
- **Logic**: Fetches all active sources, parses feeds, creates news articles

## Import Path Examples

```typescript
// From controller to service
import { RssSourcesService } from '../business/services/rss-sources.service';

// From service to repository
import { RssSourceRepository } from '../../data/repositories/rss-source.repository';

// DTO imports (from controller)
import { SaveRssSourceDto } from '../contracts/requests/save-rss-source.dto';
import { RssSourceResponseDto } from '../contracts/responses/rss-source-response.dto';

// Entity imports (from controller)
import { RssSource } from '../data/entities/rss-source.entity';

// Enum imports (from controller)
import { FeedTypeEnum } from '../contracts/enums/feed-type.enum';
```

## Testing Strategy

### Unit Tests
- Test services in isolation with mocked repositories
- Test repositories with in-memory database
- Test controllers with mocked services

### Integration Tests
- Test full flow from controller to database
- Test schedule execution
- Test RSS feed parsing with real feeds

## Related Modules

- **NewsModule**: Consumes RSS sources to create news articles
- **NewsReliabilityModule**: Tracks source reliability scores
- **SchedulerModule**: Manages scheduled tasks

## Maintainers

This module follows .NET Clean Architecture guidelines.
See `/docs/CLEAN-ARCHITECTURE-ENTITIES.md` for framework details.
