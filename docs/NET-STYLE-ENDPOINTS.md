# .NET-Style Endpoints Implementation

## Overview

The API has been successfully refactored to use .NET-style endpoints, replacing traditional REST patterns with familiar .NET conventions.

## New Endpoint Structure

### Base CRUD Endpoints

All controllers extending `BaseController` now automatically provide these endpoints:

| Method | Endpoint | Description | .NET Equivalent |
|--------|----------|-------------|-----------------|
| `POST` | `/save` | Create or update entity (upsert) | `[HttpPost("save")]` |
| `GET` | `/get?id={id}` | Get entity by ID (query param) | `[HttpGet("get")]` |
| `POST` | `/getlist` | Get paginated list with sorting | `[HttpPost("getlist")]` |
| `DELETE` | `/delete?id={id}` | Delete entity by ID (query param) | `[HttpDelete("delete")]` |

### Example Usage

#### Save (Create/Update)
```bash
# Create new entity
POST /api/v1/rss-sources/save
{
  "name": "Bloomberg HT",
  "url": "https://www.bloomberght.com/rss",
  "feedType": "RSS2",
  "category": "COMPANY_NEWS",
  "country": "TR",
  "fetchInterval": 60
}

# Update existing entity (include id)
POST /api/v1/rss-sources/save
{
  "id": 1,
  "name": "Bloomberg HT Updated",
  "url": "https://www.bloomberght.com/rss",
  "feedType": "RSS2",
  "category": "COMPANY_NEWS",
  "country": "TR",
  "fetchInterval": 30
}
```

#### Get by ID
```bash
GET /api/v1/rss-sources/get?id=1
```

#### Get List (with pagination/sorting)
```bash
POST /api/v1/rss-sources/getlist
{
  "page": 0,
  "pageSize": 10,
  "sortField": "createdAt",
  "sortType": "DESC"
}
```

#### Delete
```bash
DELETE /api/v1/rss-sources/delete?id=1
```

## Implementation Details

### 1. CriteriaDto for Pagination

```typescript
export class CriteriaDto {
  page: number = 0;           // 0-based page number
  pageSize: number = 10;      // Items per page
  sortField?: string;         // Field to sort by
  sortType?: 'ASC' | 'DESC';  // Sort direction
}
```

### 2. Upsert Pattern with Save DTOs

Each module now has a `SaveEntityDto` that combines create and update operations:

```typescript
@AutoApplyDecorators(SaveRssSourceMapping)
export class SaveRssSourceDto extends BaseDto {
  id?: number;  // If present: update; if absent: create
  name: string;
  url: string;
  // ... other fields
}
```

### 3. Service Layer Changes

Services now implement a single `save()` method instead of separate `create()` and `update()`:

```typescript
async save(saveDto: SaveRssSourceDto): Promise<RssSource> {
  const id = saveDto.id;
  
  if (id) {
    // Update existing
    const entity = await this.repository.findById(id);
    // ... validation and update logic
  } else {
    // Create new
    // ... validation and create logic
  }
}
```

### 4. Updated IBaseService Interface

```typescript
export interface IBaseService<T> {
  save(dto: any): Promise<T>;      // Upsert operation
  remove(id: number): Promise<void>;
}
```

## Modules Updated

All four main modules have been updated:

1. **RSS Sources** (`/api/v1/rss-sources`)
   - SaveRssSourceDto created
   - Service updated with save() method
   - Controller updated to use new endpoints

2. **News** (`/api/v1/news`)
   - SaveNewsArticleDto created
   - Service updated with save() method
   - Controller updated to use new endpoints

3. **Payment** (`/api/v1/payments`)
   - SavePaymentDto created
   - Service updated with save() method
   - Controller updated to use new endpoints

4. **News Reliability** (`/api/v1/reliability`)
   - SaveReliabilityTrackingDto created
   - Service updated with save() method
   - Controller updated to use new endpoints

## Custom Business Endpoints

Controllers can still define custom business-specific endpoints alongside the base CRUD operations:

```typescript
@CrudController('rss-sources', 'RssSource')
export class RssSourcesController extends BaseController<...> {
  // Base CRUD endpoints inherited automatically

  // Custom business endpoints
  @GetActiveEndpoint('RssSource', RssSourceListResponseDto)
  async getActiveSources(): Promise<RssSourceListResponseDto> {
    // Custom logic
  }

  @GetByCategoryEndpoint('RssSource', RssSourceListResponseDto, SourceCategoryEnum)
  async getByCategory(@Param('category') category: SourceCategoryEnum) {
    // Custom logic
  }
}
```

## Benefits

1. **Familiar .NET Pattern**: Developers familiar with .NET will recognize the endpoint structure
2. **Single Endpoint for Saves**: No need to choose between create/update - the backend handles it
3. **Query Parameter IDs**: IDs in query strings instead of URL paths for get/delete operations
4. **Consistent Pagination**: All list endpoints support the same pagination/sorting structure
5. **Less Boilerplate**: Single DTO and service method for create/update operations

## Migration from Old REST Endpoints

| Old Endpoint | New Endpoint |
|--------------|--------------|
| `POST /create` | `POST /save` (without id) |
| `PATCH /:id` | `POST /save` (with id) |
| `GET /:id` | `GET /get?id={id}` |
| `GET /list` | `POST /getlist` (with criteria) |
| `DELETE /:id` | `DELETE /delete?id={id}` |

## Response Format

All responses are wrapped by the global `ResponseInterceptor`:

```json
{
  "data": {
    "id": 1,
    "name": "Bloomberg HT",
    "url": "https://www.bloomberght.com/rss",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Success",
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Testing

Test the new endpoints using the Swagger UI at: `http://localhost:3000/api/docs`

All endpoints are automatically documented with request/response schemas.

