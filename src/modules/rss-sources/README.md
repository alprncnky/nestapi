# RSS Sources Module

## Overview

This module manages RSS feed sources with clean architecture principles following .NET-style layered design. It provides CRUD operations, RSS feed parsing, scheduled fetching, and reliability tracking.

## Architecture

### Clean Architecture Layers

```
rss-sources/
├── controllers/           → API LAYER (.NET: Controllers)
│   └── rss-sources.controller.ts
│
├── services/              → BUSINESS LAYER (.NET: Services)
│   ├── rss-sources.service.ts       (Main CRUD + validation)
│   ├── rss-fetch.service.ts         (RSS processing logic)
│   └── rss-parser.service.ts        (Utility service)
│
├── repositories/          → DATA ACCESS LAYER (.NET: Repositories)
│   └── rss-source.repository.ts
│
├── entities/              → DOMAIN LAYER (.NET: Domain/Entities)
│   ├── rss-source.entity.ts
│   └── source-reliability-score.entity.ts
│
├── schemas/               → DATA LAYER (TypeORM Schemas)
│   ├── rss-source.schema.ts
│   └── source-reliability-score.schema.ts
│
├── dto/                   → CONTRACTS (.NET: Request DTOs)
│   ├── create-rss-source.dto.ts
│   ├── update-rss-source.dto.ts
│   └── mapping.ts
│
├── responses/             → CONTRACTS (.NET: Response DTOs)
│   ├── rss-source-response.dto.ts
│   ├── rss-source-list-response.dto.ts
│   └── mapping.ts
│
├── enums/                 → DOMAIN LAYER (Domain Enums)
│   ├── feed-type.enum.ts
│   └── source-category.enum.ts
│
├── schedules/             → ORCHESTRATION LAYER
│   └── rss-fetch.schedule.ts
│
├── rss-sources.module.ts  → MODULE REGISTRATION
└── README.md              → DOCUMENTATION
```

## Layer Responsibilities

### 1. API Layer (controllers/)

**Responsibility**: HTTP endpoints, request/response handling

**Files**:
- `rss-sources.controller.ts`: REST API endpoints

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

  @GetActiveEndpoint('RssSource', RssSourceListResponseDto)
  async getActiveSources(): Promise<RssSourceListResponseDto> {
    const sources = await this.rssSourcesService.findActiveSources();
    return new RssSourceListResponseDto(sources.map(...), sources.length);
  }
}
```

### 2. Business Layer (services/)

**Responsibility**: Business logic, validation, orchestration

**Files**:
- `rss-sources.service.ts`: Main CRUD operations with business rules
- `rss-fetch.service.ts`: RSS feed processing business logic
- `rss-parser.service.ts`: RSS parsing utility

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

**Example**:
```typescript
@Injectable()
export class RssSourcesService {
  constructor(private readonly rssSourceRepository: RssSourceRepository) {}

  async create(createDto: CreateRssSourceDto): Promise<RssSource> {
    // 1. Business validation
    await this.validateUniqueUrl(createDto.url);
    
    // 2. Business logic (default score = 50)
    const source = new RssSource({
      ...createDto,
      reliabilityScore: 50,
    });
    
    // 3. Delegate to repository
    return await this.rssSourceRepository.save(source);
  }
}
```

### 3. Data Access Layer (repositories/)

**Responsibility**: Database operations, query building

**Files**:
- `rss-source.repository.ts`: RSS source data access

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
export class RssSourceRepository {
  constructor(@InjectRepository(RssSource) private repository: Repository<RssSource>) {}

  async findActiveByCategory(category: SourceCategoryEnum): Promise<RssSource[]> {
    return await this.repository.find({
      where: { category, isActive: true },
      order: { reliabilityScore: 'DESC' },
    });
  }
}
```

### 4. Domain Layer (entities/, enums/)

**Responsibility**: Domain entities and business enums

**Files**:
- `entities/rss-source.entity.ts`: Domain entity
- `enums/feed-type.enum.ts`: Feed type enumeration
- `enums/source-category.enum.ts`: Source category enumeration

**What it does**:
- ✅ Define domain model
- ✅ Encapsulate domain behavior (via @AutoEntity)
- ✅ Represent business concepts

### 5. Contracts (dto/, responses/)

**Responsibility**: Data transfer objects for API

**Files**:
- `dto/`: Input DTOs with validation
- `responses/`: Output DTOs with Swagger documentation

**What it does**:
- ✅ Define API contracts
- ✅ Validation rules
- ✅ Swagger documentation
- ✅ Input/output transformation

## Data Flow

### Create RSS Source Flow

```
Client Request
    ↓
[Controller] - RssSourcesController.create()
    ↓ (validates CreateRssSourceDto)
[Service] - RssSourcesService.create()
    ↓ (business validation: unique URL)
    ↓ (business logic: default score = 50)
[Repository] - RssSourceRepository.save()
    ↓ (database query)
[Database] - PostgreSQL/MySQL
    ↓ (returns entity)
[Service] - returns RssSource entity
    ↓
[Controller] - transforms to RssSourceResponseDto
    ↓
Client Response (auto-wrapped by ResponseInterceptor)
```

### Fetch RSS Feed Flow

```
[Schedule] - RssFetchSchedule (Cron trigger)
    ↓
[Service] - RssFetchService.processFeedSource()
    ↓ (business: validate source)
    ↓ (utility: parse RSS feed)
[Service] - RssParserService.parseFeed()
    ↓ (external: fetch RSS feed)
    ↓ (returns parsed items)
[Service] - RssFetchService
    ↓ (business: check duplicates)
    ↓ (business: create articles)
[Service] - NewsService.create()
    ↓
[Repository] - Save articles to database
```

## Dependency Flow

```
Controller
    ↓ depends on
Service (Business Logic)
    ↓ depends on
Repository (Data Access)
    ↓ depends on
TypeORM / Database

Utilities (RssParserService)
    ↓ independent
Can be used by any service
```

## Key Design Principles

### 1. Separation of Concerns
- Each layer has a single responsibility
- No mixing of concerns between layers

### 2. Dependency Inversion
- Services depend on repository abstractions
- Controllers depend on service abstractions
- High-level modules don't depend on low-level modules

### 3. Single Responsibility
- Each service/repository has one clear purpose
- `RssSourcesService`: CRUD + validation
- `RssFetchService`: RSS processing
- `RssParserService`: RSS parsing

### 4. DRY (Don't Repeat Yourself)
- Use base classes (`BaseController`)
- Use decorators (`@AutoEntity`, `@AutoResponse`)
- Centralize validation in mappings

### 5. Testability
- Each layer can be tested independently
- Mock dependencies easily
- Clear boundaries

## API Endpoints

### Standard CRUD
- `POST /api/v1/rss-sources` - Create RSS source
- `GET /api/v1/rss-sources` - Get all RSS sources
- `GET /api/v1/rss-sources/:id` - Get RSS source by ID
- `PATCH /api/v1/rss-sources/:id` - Update RSS source
- `DELETE /api/v1/rss-sources/:id` - Delete RSS source

### Custom Endpoints
- `GET /api/v1/rss-sources/active` - Get active sources
- `GET /api/v1/rss-sources/category/:category` - Get sources by category
- `PATCH /api/v1/rss-sources/:id/reliability/:score` - Update reliability score

## Business Rules

1. **Default Reliability Score**: New sources start with score of 50
2. **Unique URL**: Each RSS source must have a unique URL
3. **Score Range**: Reliability score must be between 0-100
4. **Active Sources**: Only active sources are fetched by scheduler
5. **Fetch Interval**: Default fetch interval is 30 minutes

## Scheduled Tasks

### RSS Fetch Schedule
- **Interval**: Every 30 minutes
- **Service**: `RssFetchService.processFeedSource()`
- **Logic**: Fetches all active sources, parses feeds, creates news articles
- **Orchestration**: Registered with `BaseSchedulerService`

## Testing Strategy

### Unit Tests
- Test services in isolation with mocked repositories
- Test repositories with in-memory database
- Test controllers with mocked services

### Integration Tests
- Test full flow from controller to database
- Test schedule execution
- Test RSS feed parsing with real feeds

## Future Enhancements

1. **Validation Service**: Extract complex validation to `services/rss-validation.service.ts`
2. **Metrics Service**: Track fetch success rates, performance
3. **Cache Layer**: Add Redis caching for frequently accessed sources
4. **Event System**: Emit events when sources are created/updated
5. **Health Checks**: Add health check endpoints for source monitoring

## .NET Developer Notes

This structure closely mirrors .NET Clean Architecture:

| NestJS Component | .NET Equivalent |
|-----------------|-----------------|
| `controllers/` | `YourProject.API/Controllers` |
| `services/` | `YourProject.Business/Services` |
| `repositories/` | `YourProject.DataAccess/Repositories` |
| `entities/` | `YourProject.Domain/Entities` |
| `dto/` | `YourProject.Contracts/Requests` |
| `responses/` | `YourProject.Contracts/Responses` |
| `enums/` | `YourProject.Domain/Enums` |
| Module DI | Built-in DI Container |
| `@Injectable()` | `[Service]` Attribute |
| TypeORM | Entity Framework Core |

## Swagger Documentation

Access API documentation at: `http://localhost:3000/api/docs`

All endpoints are automatically documented via decorators.

## Related Modules

- **NewsModule**: Consumes RSS sources to create news articles
- **NewsReliabilityModule**: Tracks source reliability scores
- **SchedulerModule**: Manages scheduled tasks

## Maintainers

This module follows the established project architecture guidelines.
See `/docs/CLEAN-ARCHITECTURE-ENTITIES.md` for more details.

