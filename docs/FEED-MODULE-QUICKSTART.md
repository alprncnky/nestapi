# Feed Module - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies

First, ensure `rss-parser` is installed:

```bash
npm install rss-parser
npm install --save-dev @types/rss-parser
```

### 2. Run Database Migration

Apply the migration to create the `feeds` table:

```bash
# Run migration
npm run migration:run

# Or manually with TypeORM CLI
npx typeorm migration:run -d dist/config/typeorm-migration.config.js
```

**Migration File:** `database/migrations/1762106568000-CreateFeedTable.ts`

### 3. Verify Module Registration

The Feed module has been registered in `src/app.module.ts`:

```typescript
imports: [
  // ...
  FeedModule,  // ✅ Already added
],
```

### 4. Start the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:3000/feeds
```

### Available Endpoints

#### 1. Create Feed
```bash
POST /feeds/save
Content-Type: application/json

{
  "url": "https://example.com/article",
  "title": "Sample Article",
  "text": "Article content here...",
  "source": "Example News",
  "feedType": 1
}
```

#### 2. Update Feed
```bash
POST /feeds/save
Content-Type: application/json

{
  "id": 1,
  "url": "https://example.com/article",
  "title": "Updated Article",
  "text": "Updated content...",
  "source": "Example News",
  "feedType": 1
}
```

#### 3. Get Single Feed
```bash
GET /feeds/get?id=1
```

#### 4. Get Feed List (Paginated)
```bash
POST /feeds/getList
Content-Type: application/json

{
  "page": 1,
  "limit": 10,
  "sortBy": "createdAt",
  "sortOrder": "DESC"
}
```

#### 5. Delete Feed
```bash
DELETE /feeds/delete?id=1
```

---

## 📊 Swagger Documentation

Access the interactive API documentation at:

```
http://localhost:3000/api
```

All Feed endpoints are documented under the **"Feed"** tag.

---

## ⏰ Scheduled Task (IScheduledTask)

The Feed module automatically fetches RSS feeds every 30 minutes using the centralized `BaseSchedulerService`.

### Schedule Details
- **Frequency:** Every 30 minutes
- **Cron Expression:** `CronExpression.EVERY_30_MINUTES`
- **Service Method:** `FeedService.jobExecute()`
- **Interface:** `IScheduledTask` (centralized management)

### Features
✅ **Overlapping Prevention** - Won't run if previous execution is still running  
✅ **Automatic History Logging** - All executions logged to `job_execution_history` table  
✅ **Manual Triggering** - Can trigger via API endpoint  
✅ **Task Control** - Start/stop tasks dynamically  
✅ **Monitoring** - View all registered tasks and their status  

### Watch Logs
```bash
# Watch for scheduled execution logs
npm run start:dev

# You'll see logs like:
# [BaseSchedulerService] 🚀 Executing task: "FeedFetchSchedule"
# [FeedFetchSchedule] 🔄 Starting RSS feed fetch job...
# [FeedFetchSchedule] 📡 Fetching feeds from RSS sources...
# [FeedService] Starting feed job execution...
# [RssFetcherService] Fetching RSS feed from: https://...
# [FeedService] Feed job completed. Saved: 15, Skipped: 5, Errors: 0
# [FeedFetchSchedule] ✨ Feed fetch job completed in 2.34s
# [FeedFetchSchedule] 📊 Summary: 15 saved, 5 skipped, 0 errors
# [BaseSchedulerService] ✅ Task "FeedFetchSchedule" completed in 2340ms
```

### Manual Task Control

You can manually trigger, stop, or start the scheduled task:

```bash
# Trigger task manually (via API if exposed)
POST /scheduler/trigger?taskName=FeedFetchSchedule

# Stop the scheduled task
POST /scheduler/stop?taskName=FeedFetchSchedule

# Start the scheduled task
POST /scheduler/start?taskName=FeedFetchSchedule

# View all registered tasks
GET /scheduler/tasks
```

---

## 🔧 Configuration

### Adding RSS Sources

Edit `src/modules/feed/business/services/feed.service.ts`:

```typescript
const rssSources = [
  {
    url: 'https://www.borsagundem.com.tr/rss/sirket-haberleri',
    source: 'Borsa Gündem',
    feedType: FeedTypeEnum.NEWS,
  },
  {
    url: 'https://your-rss-feed-url.com/rss',
    source: 'Your Source Name',
    feedType: FeedTypeEnum.NEWS, // or INTERNET, FORUM, TWITTER
  },
  // Add more sources here...
];
```

### Changing Schedule Frequency

Edit `src/modules/feed/business/orchestration/schedules/feed-fetch.schedule.ts`:

```typescript
// Change from every 30 minutes to every hour
@Cron(CronExpression.EVERY_HOUR)

// Or custom cron expression (e.g., every 15 minutes)
@Cron('*/15 * * * *')
```

---

## 🧪 Testing

### Test API with cURL

```bash
# 1. Create a test feed
curl -X POST http://localhost:3000/feeds/save \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/test",
    "title": "Test Feed",
    "text": "Test content",
    "source": "Test Source",
    "feedType": 1
  }'

# 2. Get the created feed
curl -X GET "http://localhost:3000/feeds/get?id=1"

# 3. List all feeds
curl -X POST http://localhost:3000/feeds/getList \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "limit": 10}'
```

### Test Shell Script

Create `test-feed-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/feeds"

echo "📝 Testing Feed API..."

# Create feed
echo -e "\n1️⃣ Creating feed..."
curl -X POST "$BASE_URL/save" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://test.com/article",
    "title": "Test Article",
    "text": "This is a test article",
    "source": "Test Source",
    "feedType": 1
  }' | jq

# Get feed list
echo -e "\n2️⃣ Getting feed list..."
curl -X POST "$BASE_URL/getList" \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "limit": 5}' | jq

echo -e "\n✅ Test completed!"
```

Run it:
```bash
chmod +x test-feed-api.sh
./test-feed-api.sh
```

---

## 📦 Database Schema

### Feed Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `url` | VARCHAR(1000) | Feed URL (indexed) |
| `title` | VARCHAR(500) | Feed title |
| `text` | TEXT | Feed content |
| `source` | VARCHAR(255) | Source name (indexed) |
| `feedType` | INTEGER | 1=News, 2=Internet, 3=Forum, 4=Twitter (indexed) |
| `fetchedAt` | TIMESTAMP | When fetched (indexed) |
| `createdAt` | TIMESTAMP | Creation time (indexed) |
| `updatedAt` | TIMESTAMP | Last update time |

### Query Examples

```sql
-- Get all news feeds from last 7 days
SELECT * FROM feeds 
WHERE "feedType" = 1 
  AND "fetchedAt" >= NOW() - INTERVAL '7 days'
ORDER BY "createdAt" DESC;

-- Count feeds by source
SELECT source, COUNT(*) as count
FROM feeds
GROUP BY source
ORDER BY count DESC;

-- Get feeds by type
SELECT * FROM feeds
WHERE "feedType" = 1  -- News
ORDER BY "createdAt" DESC
LIMIT 10;
```

---

## 🐛 Troubleshooting

### Issue: Scheduled task not running

**Solution:**
1. Check if `@nestjs/schedule` is installed:
   ```bash
   npm install @nestjs/schedule
   ```
2. Verify `GlobalSchedulerModule` is imported in `app.module.ts`
3. Check logs for scheduler initialization

### Issue: RSS feed fetch fails

**Solution:**
1. Verify RSS URL is accessible:
   ```bash
   curl -I https://www.borsagundem.com.tr/rss/sirket-haberleri
   ```
2. Check if `rss-parser` is installed
3. Review error logs in `FeedService` and `RssFetcherService`

### Issue: Migration fails

**Solution:**
1. Check database connection in `.env.development`
2. Verify database exists:
   ```bash
   psql -U postgres -l
   ```
3. Run migration with verbose output:
   ```bash
   npx typeorm migration:run -d dist/config/typeorm-migration.config.js
   ```

### Issue: Duplicate feeds being saved

**Solution:**
- Deduplication is based on URL
- Check if URLs are exactly the same (case-sensitive)
- Consider adding unique constraint on URL column:
  ```sql
  ALTER TABLE feeds ADD CONSTRAINT unique_feed_url UNIQUE (url);
  ```

---

## 📚 Additional Resources

- **Full Documentation:** [FEED-MODULE-SUMMARY.md](FEED-MODULE-SUMMARY.md)
- **RSS Documentation:** [development-notes/rssborsagundemsirket.md](development-notes/rssborsagundemsirket.md)
- **Architecture Guide:** [AGENTS.md](../AGENTS.md)
- **NestJS Scheduling:** https://docs.nestjs.com/techniques/task-scheduling
- **rss-parser:** https://github.com/rbren/rss-parser

---

## 🎯 Next Steps

1. ✅ **Database Migration** - Run the migration to create the table
2. ✅ **Start Application** - Start the app and verify scheduler runs
3. ✅ **Test API** - Use Swagger UI or cURL to test endpoints
4. 🔜 **Add More RSS Sources** - Configure additional RSS feeds
5. 🔜 **Monitor Logs** - Watch for scheduled task execution
6. 🔜 **Enhance** - Add more feed types (Twitter, Forums, etc.)

---

**Need Help?**
- Check application logs: `npm run start:dev`
- Review Swagger docs: `http://localhost:3000/api`
- Verify database: Check PostgreSQL with your favorite client

---

**Status:** ✅ Ready to Use  
**Last Updated:** November 2, 2025

