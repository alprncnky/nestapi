# Feed Module - Implementation Summary

## 📋 Overview

The Feed module has been successfully implemented following the InsightAPI Clean Architecture patterns. This module is designed to collect and fetch information from the internet (RSS feeds, forums, Twitter, etc.) and store them in a centralized feed table.

**Created Date:** November 2, 2025  
**Module Path:** `src/modules/feed/`

---

## 🏗️ Module Structure

```
src/modules/feed/
├── controllers/
│   └── feed.controller.ts                              # CRUD API endpoints
├── business/
│   ├── services/
│   │   ├── feed.service.ts                            # Main business logic with jobExecute()
│   │   └── rss-fetcher.service.ts                     # RSS parsing service
│   └── orchestration/
│       └── schedules/
│           └── feed-fetch.schedule.ts                 # Scheduled task (every 30 min)
├── data/
│   ├── entities/
│   │   └── feed.entity.ts                             # Feed entity with @AutoEntity
│   ├── repositories/
│   │   └── feed.repository.ts                         # Data access layer
│   └── schemas/
│       └── feed.schema.ts                             # TypeORM schema
├── contracts/
│   ├── enums/
│   │   └── feed-type.enum.ts                          # Feed type enum
│   ├── requests/
│   │   ├── save-feed.dto.ts                           # Input DTO
│   │   └── mapping.ts                                 # Request field mappings
│   └── responses/
│       ├── feed-response.dto.ts                       # Response DTO
│       ├── feed-list-response.dto.ts                  # List response DTO
│       └── mapping.ts                                 # Response field mappings
└── feed.module.ts                                     # Module configuration
```

---

## 📊 Database Schema

### Feed Table (`feeds`)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | int | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `url` | varchar(1000) | NOT NULL, INDEX | Feed item URL |
| `title` | varchar(500) | NOT NULL | Feed title |
| `text` | text | NULLABLE | Feed content/text |
| `source` | varchar(255) | NOT NULL, INDEX | Source name (e.g., "Borsa Gündem") |
| `feedType` | int | NOT NULL, INDEX | Feed type (1=News, 2=Internet, 3=Forum, 4=Twitter) |
| `fetchedAt` | timestamp | NOT NULL, INDEX | When feed was fetched |
| `createdAt` | timestamp | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updatedAt` | timestamp | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Update timestamp |

### Indexes

- `idx_feed_url` on `url`
- `idx_feed_source` on `source`
- `idx_feed_type` on `feedType`
- `idx_feed_fetched_at` on `fetchedAt`
- `idx_feed_created_at` on `createdAt`

---

## 🔑 Key Features

### 1. Feed Type Enum

```typescript
export enum FeedTypeEnum {
  NEWS = 1,       // RSS news feeds
  INTERNET = 2,   // General internet content
  FORUM = 3,      // Forum posts
  TWITTER = 4,    // Twitter/X posts
}
```

### 2. Feed Entity (@AutoEntity)

- Automatic constructor generation
- Type-safe property mapping
- Clean entity definition without boilerplate

### 3. CRUD Operations (BaseController)

**Endpoints:**
- `POST /feeds/save` - Create or update feed
- `GET /feeds/get?id=1` - Get single feed
- `POST /feeds/getList` - Get paginated list with filtering
- `DELETE /feeds/delete?id=1` - Delete feed

All endpoints automatically documented in Swagger.

### 4. RSS Fetcher Service

**Methods:**
- `fetchRssFeed(url)` - Fetch and parse RSS feed
- `extractPlainText(html)` - Remove HTML tags
- `getItemContent(item)` - Extract content from RSS item
- `getItemImageUrl(item)` - Extract image URL

**Features:**
- Uses `rss-parser` library
- Supports custom RSS fields
- Handles various content formats

### 5. Feed Service with jobExecute()

**Main Method:**
```typescript
async jobExecute(): Promise<{ saved: number; skipped: number; errors: number }>
```

**Workflow:**
1. Iterates through configured RSS sources
2. Calls `RssFetcherService.fetchRssFeed()` for each source
3. Checks for duplicates (deduplication by URL)
4. Extracts and cleans content
5. Saves new feeds to database
6. Returns statistics (saved/skipped/errors)

**Business Logic:**
- Deduplication to avoid duplicate entries
- Error handling per item (doesn't stop on single failure)
- Logging for debugging and monitoring
- Extensible RSS source configuration

### 6. Scheduled Task (IScheduledTask)

**Schedule:** Every 30 minutes  
**Cron Expression:** `CronExpression.EVERY_30_MINUTES`  
**Interface:** `IScheduledTask` (centralized management)

**Process:**
1. `BaseSchedulerService` triggers `FeedFetchSchedule.execute()`
2. Calls `FeedService.jobExecute()`
3. Logs results (saved/skipped/errors)
4. Automatically logs execution to `job_execution_history` table

**Benefits of IScheduledTask:**
- ✅ Automatic overlapping prevention
- ✅ Execution history logging to database
- ✅ Manual triggering capability via API
- ✅ Centralized task monitoring
- ✅ Start/stop task control
- ✅ Standardized error handling

**Clean Design:** Schedule only orchestrates, all business logic is in the service layer.

### 7. Feed Repository

**Custom Methods:**
- `findByUrl(url)` - Find feed by URL
- `findBySource(source)` - Find all feeds from a source
- `findByType(feedType)` - Find feeds by type
- `findRecent(days)` - Find feeds from last N days
- `countByType(feedType)` - Count feeds by type
- `saveBatch(feeds)` - Batch insert for performance

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│             BASE SCHEDULER SERVICE                          │
│      (Centralized Task Manager - Every 30 min)             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           FeedFetchSchedule.execute()                       │
│             (IScheduledTask Implementation)                 │
│  - Overlapping prevention                                   │
│  - Automatic history logging                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               FeedService.jobExecute()                      │
│                   (Business Layer)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ For each RSS source:                                 │  │
│  │  1. Call RssFetcherService.fetchRssFeed()          │  │
│  │  2. For each RSS item:                             │  │
│  │     - Check deduplication (findByUrl)              │  │
│  │     - Extract content (getItemContent)             │  │
│  │     - Clean HTML (extractPlainText)                │  │
│  │     - Create Feed entity                           │  │
│  │     - Save to database                             │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            RssFetcherService.fetchRssFeed()                 │
│                  (RSS Parsing Service)                      │
│  - Parse RSS feed using rss-parser                         │
│  - Return array of RSS items                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              FeedRepository.save()                          │
│                   (Data Layer)                              │
│  - Save Feed entity to database                            │
│  - Handle database operations                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Usage Examples

### Manual Trigger via API

```bash
# Create a feed manually
curl -X POST http://localhost:3000/feeds/save \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/news/article-1",
    "title": "Sample News Title",
    "text": "This is the content of the news article...",
    "source": "Example News",
    "feedType": 1
  }'

# Get all feeds with pagination
curl -X POST http://localhost:3000/feeds/getList \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "limit": 10,
    "sortBy": "createdAt",
    "sortOrder": "DESC"
  }'

# Get single feed
curl -X GET http://localhost:3000/feeds/get?id=1

# Delete feed
curl -X DELETE http://localhost:3000/feeds/delete?id=1
```

### Programmatic Usage

```typescript
import { FeedService } from './modules/feed/business/services/feed.service';

// Inject FeedService
constructor(private readonly feedService: FeedService) {}

// Trigger feed fetch manually
async triggerFeedFetch() {
  const result = await this.feedService.jobExecute();
  console.log(`Saved: ${result.saved}, Skipped: ${result.skipped}, Errors: ${result.errors}`);
}
```

---

## 🔧 Configuration

### Adding New RSS Sources

Edit `feed.service.ts` to add more RSS sources:

```typescript
const rssSources = [
  {
    url: 'https://www.borsagundem.com.tr/rss/sirket-haberleri',
    source: 'Borsa Gündem',
    feedType: FeedTypeEnum.NEWS,
  },
  {
    url: 'https://example.com/rss/feed',
    source: 'Example Source',
    feedType: FeedTypeEnum.INTERNET,
  },
  // Add more sources here...
];
```

**Future Enhancement:** Move RSS sources to database table for dynamic configuration.

### Adjusting Schedule Frequency

Edit `feed-fetch.schedule.ts` to change frequency:

```typescript
// Every 15 minutes
@Cron(CronExpression.EVERY_15_MINUTES)

// Every hour
@Cron(CronExpression.EVERY_HOUR)

// Custom cron expression (daily at 9 AM)
@Cron('0 9 * * *')
```

---

## ✅ Clean Architecture Compliance

### ✔️ Used Decorators
- `@AutoEntity()` for Feed entity
- `@AutoApplyDecorators(mapping)` for SaveFeedDto
- `@AutoResponse(mapping)` for FeedResponseDto
- `@CrudController()` for FeedController
- `@SaveEndpoint`, `@GetEndpoint`, `@GetListEndpoint`, `@DeleteEndpoint`

### ✔️ Layer Separation
- **Controller Layer:** HTTP handling only
- **Business Layer:** All business logic (deduplication, validation, orchestration)
- **Data Layer:** Database operations only

### ✔️ Naming Conventions
- Entity: `Feed`
- Controller: `FeedController`
- Service: `FeedService`
- Repository: `FeedRepository`
- DTO: `SaveFeedDto`, `FeedResponseDto`

### ✔️ Best Practices
- Dependency injection
- Error handling with NestJS exceptions
- Comprehensive logging
- Type safety
- Proper indexing
- Deduplication logic

---

## 🧪 Testing

### Test the Module

```bash
# Start the application
npm run start:dev

# The scheduler will automatically run every 30 minutes
# Or trigger manually via API or Swagger UI at http://localhost:3000/api
```

### Check Logs

```bash
# Watch for scheduled execution
[FeedFetchSchedule] 🔄 Starting scheduled feed fetch...
[FeedService] Starting feed job execution...
[RssFetcherService] Fetching RSS feed from: https://...
[RssFetcherService] Successfully fetched 20 items from https://...
[FeedService] Saved feed: Sample News Title
[FeedService] Feed job completed. Saved: 15, Skipped: 5, Errors: 0
[FeedFetchSchedule] ✅ Scheduled feed fetch completed. Saved: 15, Skipped: 5, Errors: 0
```

---

## 🔜 Future Enhancements

### Database-Driven Configuration
- Create `FeedSource` table for dynamic RSS source management
- Add CRUD endpoints for managing sources
- Support enable/disable sources

### Advanced Feed Types
- Implement Twitter/X scraper for `TWITTER` feed type
- Implement forum scraper for `FORUM` feed type
- Implement web scraper for `INTERNET` feed type

### Content Processing
- Add sentiment analysis
- Extract stock mentions
- Tag categorization
- Image processing

### Performance Optimizations
- Implement batch insert for better performance
- Add caching layer
- Implement parallel RSS fetching

### Monitoring
- Add metrics collection
- Create dashboard for feed statistics
- Alert on fetch failures

---

## 📚 Related Documentation

- [AGENTS.md](../AGENTS.md) - Project architecture guide
- [rssborsagundemsirket.md](development-notes/rssborsagundemsirket.md) - RSS feed documentation
- [NestJS Task Scheduling](https://docs.nestjs.com/techniques/task-scheduling)
- [rss-parser Documentation](https://github.com/rbren/rss-parser)

---

## 📞 Support

For questions or issues related to the Feed module:
- Check logs for error messages
- Review the RSS feed URL is accessible
- Verify database connection
- Ensure `rss-parser` package is installed

**Dependencies:**
```json
{
  "rss-parser": "^3.13.0",
  "@types/rss-parser": "^3.13.0"
}
```

---

**Status:** ✅ Module Fully Implemented and Integrated  
**Last Updated:** November 2, 2025

