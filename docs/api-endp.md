# InsightAPI - API Endpoints Documentation

This document provides a comprehensive list of all API endpoints available in the InsightAPI system, including request and response schemas.

## Base URL
All endpoints are prefixed with `/api/`

---

## RSS Sources Module (`/api/rss-sources`)

### 1. Save RSS Source (Create/Update)
- **Method**: `POST`
- **URL**: `/api/rss-sources/save`
- **Description**: Create a new RSS source or update an existing one

**Request Schema**:
```json
{
  "id": 1,                    // Optional: ID for updates
  "name": "Bloomberg HT",      // Required: RSS source name
  "url": "https://www.bloomberght.com/rss",  // Required: RSS feed URL
  "feedType": "RSS2",         // Required: Feed type (RSS2, ATOM, JSON)
  "category": "COMPANY_NEWS",  // Required: Source category
  "country": "TR",            // Required: Country code (ISO 3166-1 alpha-2)
  "fetchInterval": 60,        // Required: Fetch interval in minutes (5-1440)
  "isActive": true,           // Optional: Is source active (default: true)
  "reliabilityScore": 75.5    // Optional: Reliability score (0-100)
}
```

**Response Schema**:
```json
{
  "id": 1,
  "name": "Bloomberg HT",
  "url": "https://www.bloomberght.com/rss",
  "feedType": "RSS2",
  "category": "COMPANY_NEWS",
  "country": "TR",
  "reliabilityScore": 85.5,
  "isActive": true,
  "fetchInterval": 60,
  "lastFetchedAt": "2024-01-01T00:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 2. Get RSS Source by ID
- **Method**: `GET`
- **URL**: `/api/rss-sources/get?id={id}`
- **Description**: Retrieve a specific RSS source by ID

**Query Parameters**:
- `id` (number, required): RSS source ID

**Response Schema**: Same as Save RSS Source response

### 3. Get RSS Sources List
- **Method**: `POST`
- **URL**: `/api/rss-sources/getlist`
- **Description**: Retrieve paginated list of RSS sources

**Request Schema**:
```json
{
  "page": 0,           // Optional: Page number (0-based, default: 0)
  "pageSize": 10,      // Optional: Items per page (default: 10)
  "sortField": "createdAt",  // Optional: Field to sort by
  "sortType": "DESC"   // Optional: Sort direction (ASC, DESC)
}
```

**Response Schema**:
```json
{
  "items": [
    {
      "id": 1,
      "name": "Bloomberg HT",
      "url": "https://www.bloomberght.com/rss",
      "feedType": "RSS2",
      "category": "COMPANY_NEWS",
      "country": "TR",
      "reliabilityScore": 85.5,
      "isActive": true,
      "fetchInterval": 60,
      "lastFetchedAt": "2024-01-01T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 25
}
```

### 4. Delete RSS Source
- **Method**: `DELETE`
- **URL**: `/api/rss-sources/delete?id={id}`
- **Description**: Delete a specific RSS source

**Query Parameters**:
- `id` (number, required): RSS source ID

**Response Schema**:
```json
{
  "message": "RSS Source deleted successfully"
}
```

---

## News Module (`/api/news`)

### 1. Save News Article (Create/Update)
- **Method**: `POST`
- **URL**: `/api/news/save`
- **Description**: Create a new news article or update an existing one

**Request Schema**:
```json
{
  "id": 1,                              // Optional: ID for updates
  "sourceId": 1,                        // Required: RSS source ID
  "title": "Company announces new product",  // Required: Article title
  "url": "https://example.com/news/1",   // Required: Article URL
  "guid": "unique-guid-123",            // Required: Unique identifier
  "summary": "Brief summary...",        // Optional: Article summary
  "content": "Full article content...", // Optional: Full content
  "contentPlain": "Plain text content", // Optional: Plain text content
  "publishedAt": "2024-01-01T00:00:00Z", // Required: Publication date
  "scrapedAt": "2024-01-01T00:00:00Z",  // Optional: Scraping date
  "imageUrl": "https://example.com/image.jpg", // Optional: Image URL
  "status": "PROCESSED",                // Optional: Processing status
  "isDuplicate": false,                 // Optional: Is duplicate article
  "category": "COMPANY_NEWS",           // Optional: News category
  "sentimentScore": 0.75,              // Optional: Sentiment score (-1 to 1)
  "impactLevel": "MEDIUM"               // Optional: Impact level
}
```

**Response Schema**:
```json
{
  "id": 1,
  "sourceId": 1,
  "title": "Company announces new product",
  "url": "https://example.com/news/1",
  "guid": "unique-guid-123",
  "summary": "Brief summary...",
  "content": "Full article content...",
  "publishedAt": "2024-01-01T00:00:00Z",
  "imageUrl": "https://example.com/image.jpg",
  "category": "COMPANY_NEWS",
  "sentimentScore": 0.75,
  "impactLevel": "MEDIUM",
  "status": "PROCESSED",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 2. Get News Article by ID
- **Method**: `GET`
- **URL**: `/api/news/get?id={id}`
- **Description**: Retrieve a specific news article by ID

**Query Parameters**:
- `id` (number, required): News article ID

**Response Schema**: Same as Save News Article response

### 3. Get News Articles List
- **Method**: `POST`
- **URL**: `/api/news/getlist`
- **Description**: Retrieve paginated list of news articles

**Request Schema**: Same as RSS Sources getlist (CriteriaDto)

**Response Schema**:
```json
{
  "items": [
    {
      "id": 1,
      "sourceId": 1,
      "title": "Company announces new product",
      "url": "https://example.com/news/1",
      "guid": "unique-guid-123",
      "summary": "Brief summary...",
      "content": "Full article content...",
      "publishedAt": "2024-01-01T00:00:00Z",
      "imageUrl": "https://example.com/image.jpg",
      "category": "COMPANY_NEWS",
      "sentimentScore": 0.75,
      "impactLevel": "MEDIUM",
      "status": "PROCESSED",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 150
}
```

### 4. Delete News Article
- **Method**: `DELETE`
- **URL**: `/api/news/delete?id={id}`
- **Description**: Delete a specific news article

**Query Parameters**:
- `id` (number, required): News article ID

**Response Schema**:
```json
{
  "message": "News Article deleted successfully"
}
```

---

## Stock Prices Module (`/api/stock-prices`)

### 1. Get Stock Price by ID
- **Method**: `GET`
- **URL**: `/api/stock-prices/get?id={id}`
- **Description**: Retrieve a specific stock price record by ID

**Query Parameters**:
- `id` (number, required): Stock price record ID

**Response Schema**:
```json
{
  "id": 1,
  "stockSymbol": "AKBNK",
  "stockName": "Akbank T.A.S.",
  "open": 45.50,
  "close": 46.20,
  "high": 46.80,
  "low": 45.10,
  "last": 46.20,
  "dailyChangePrice": 0.70,
  "dailyChangePercent": 1.54,
  "volumeTurkishLira": 125000000,
  "volumeLot": 2700000,
  "volatility": 0.85,
  "exchange": "BIST",
  "currency": "TRY",
  "lastUpdate": "2024-01-01T18:00:00Z",
  "fetchedAt": "2024-01-01T18:05:00Z",
  "createdAt": "2024-01-01T18:05:00Z",
  "updatedAt": "2024-01-01T18:05:00Z"
}
```

### 2. Get All Latest Stock Prices
- **Method**: `GET`
- **URL**: `/api/stock-prices/getall`
- **Description**: Retrieve all latest stock prices

**Response Schema**:
```json
{
  "items": [
    {
      "id": 1,
      "stockSymbol": "AKBNK",
      "stockName": "Akbank T.A.S.",
      "open": 45.50,
      "close": 46.20,
      "high": 46.80,
      "low": 45.10,
      "last": 46.20,
      "dailyChangePrice": 0.70,
      "dailyChangePercent": 1.54,
      "volumeTurkishLira": 125000000,
      "volumeLot": 2700000,
      "volatility": 0.85,
      "exchange": "BIST",
      "currency": "TRY",
      "lastUpdate": "2024-01-01T18:00:00Z",
      "fetchedAt": "2024-01-01T18:05:00Z",
      "createdAt": "2024-01-01T18:05:00Z",
      "updatedAt": "2024-01-01T18:05:00Z"
    }
  ],
  "total": 500
}
```

### 3. Get Stock Price by Symbol
- **Method**: `GET`
- **URL**: `/api/stock-prices/symbol?symbol={symbol}`
- **Description**: Retrieve latest stock price for a specific symbol

**Query Parameters**:
- `symbol` (string, required): Stock symbol (e.g., "AKBNK")

**Response Schema**: Same as Get Stock Price by ID response

---

## Stock Prediction Module (`/api/stock-prediction`)

### 1. Trigger Prediction
- **Method**: `POST`
- **URL**: `/api/stock-prediction/predictions/trigger`
- **Description**: Trigger AI prediction for a news article

**Request Schema**:
```json
{
  "articleId": 1,              // Required: News article ID
  "stockSymbol": "AKBNK",      // Required: Stock symbol
  "predictedImpact": "UP",     // Required: Predicted impact (UP, DOWN, NEUTRAL)
  "predictedChangePercent": 5.5, // Required: Predicted change percentage
  "predictionConfidence": 75,  // Required: Confidence level (0-100)
  "timeWindow": "1D",          // Required: Time window (1D, 1W, 1M)
  "reasoning": "AI analysis based on..." // Optional: Reasoning text
}
```

**Response Schema**:
```json
{
  "message": "Prediction triggered successfully"
}
```

### 2. Get Predictions List
- **Method**: `POST`
- **URL**: `/api/stock-prediction/getlist`
- **Description**: Retrieve paginated list of predictions with sorting support

**Request Schema**: CriteriaDto (same as RSS Sources getlist)
```json
{
  "page": 0,           // Optional: Page number (0-based, default: 0)
  "pageSize": 10,      // Optional: Items per page (default: 10)
  "sortField": "createdAt",  // Optional: Field to sort by
  "sortType": "DESC"   // Optional: Sort direction (ASC, DESC)
}
```

**Response Schema**:
```json
{
  "items": [
    {
      "id": 1,
      "articleId": 1,
      "stockSymbol": "AKBNK",
      "predictedImpact": "UP",
      "predictedChangePercent": 5.5,
      "predictionConfidence": 75,
      "timeWindow": "1D",
      "reasoning": "AI analysis",
      "actualImpact": "UP",
      "actualChangePercent": 4.2,
      "predictionAccuracy": 85,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50
}
```

### 2.1. Get Predictions by Stock Symbol
- **Method**: `GET`
- **URL**: `/api/stock-prediction/predictions/stock/{symbol}`
- **Description**: Retrieve all predictions for a specific stock symbol

**Path Parameters**:
- `symbol` (string, required): Stock symbol (e.g., "AKBNK")

**Response Schema**: Same as Get Predictions List response

### 2.2. Get Pending Predictions
- **Method**: `GET`
- **URL**: `/api/stock-prediction/predictions/pending`
- **Description**: Retrieve predictions that haven't been evaluated yet (no actual impact recorded)

**Response Schema**: Same as Get Predictions List response

### 3. Get Prediction by ID
- **Method**: `GET`
- **URL**: `/api/stock-prediction/predictions/{id}`
- **Description**: Retrieve a specific prediction by ID

**Path Parameters**:
- `id` (number, required): Prediction ID

**Response Schema**: Same as prediction item in Get Predictions List

### 4. Get Daily Reports
- **Method**: `POST`
- **URL**: `/api/stock-prediction/reports/daily`
- **Description**: Retrieve daily analysis reports

**Request Schema**: CriteriaDto

**Response Schema**:
```json
{
  "items": [
    {
      "id": 1,
      "reportDate": "2024-01-01T00:00:00Z",
      "totalArticles": 150,
      "totalPredictions": 45,
      "averageAccuracy": 78.5,
      "topGainers": ["AKBNK", "GARAN", "ISCTR"],
      "topLosers": ["THYAO", "TUPRS", "SAHOL"],
      "insights": ["Market sentiment positive", "Banking sector strong"],
      "recommendations": ["Buy AKBNK", "Hold GARAN"],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 30
}
```

### 5. Get Retrospective Analyses
- **Method**: `POST`
- **URL**: `/api/stock-prediction/reports/retrospective`
- **Description**: Retrieve retrospective analysis reports

**Request Schema**: CriteriaDto

**Response Schema**:
```json
{
  "items": [
    {
      "id": 1,
      "stockSymbol": "AKBNK",
      "movementPercent": 8.5,
      "analysisDate": "2024-01-01T00:00:00Z",
      "movementStartTime": "2024-01-01T09:30:00Z",
      "movementEndTime": "2024-01-01T16:00:00Z",
      "precedingNewsCount": 3,
      "existingPredictionsCount": 2,
      "missedOpportunity": true,
      "missedReasons": ["Low confidence threshold", "Pattern not recognized"],
      "retrospectiveAccuracy": 90,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 15
}
```

### 6. Get Patterns
- **Method**: `GET`
- **URL**: `/api/stock-prediction/patterns?type={type}`
- **Description**: Retrieve pattern recognition results

**Query Parameters**:
- `type` (string, optional): Pattern type filter

**Response Schema**:
```json
{
  "patterns": [
    {
      "id": 1,
      "patternType": "BREAKOUT",
      "confidence": 85,
      "description": "Price breakout pattern detected",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 7. Trigger Retrospective Analysis
- **Method**: `POST`
- **URL**: `/api/stock-prediction/analysis/retrospective`
- **Description**: Trigger retrospective analysis process

**Response Schema**:
```json
{
  "message": "Retrospective analysis triggered successfully"
}
```

### 8. Trigger Daily Report
- **Method**: `POST`
- **URL**: `/api/stock-prediction/analysis/daily-report`
- **Description**: Trigger daily report generation

**Response Schema**:
```json
{
  "message": "Daily report triggered successfully"
}
```

### 9. Get Prediction Rules
- **Method**: `GET`
- **URL**: `/api/stock-prediction/rules?type={type}`
- **Description**: Retrieve prediction rules

**Query Parameters**:
- `type` (string, optional): Rule type filter

**Response Schema**:
```json
{
  "rules": [
    {
      "id": 1,
      "ruleType": "SENTIMENT",
      "description": "Positive sentiment triggers buy signal",
      "accuracy": 75,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## News Reliability Module (`/api/reliability`)

### 1. Save Reliability Tracking (Create/Update)
- **Method**: `POST`
- **URL**: `/api/reliability/save`
- **Description**: Create or update reliability tracking record

**Request Schema**:
```json
{
  "id": 1,                              // Optional: ID for updates
  "articleId": 1,                       // Required: News article ID
  "stockSymbol": "AKBNK",               // Required: Stock symbol
  "predictedImpact": "UP",              // Optional: Predicted impact
  "predictedChangePercent": 5.5,        // Optional: Predicted change %
  "predictionConfidence": 75,           // Optional: Confidence level
  "timeWindow": "1D",                   // Optional: Time window
  "actualImpact": "UP",                 // Optional: Actual impact
  "actualChangePercent": 4.2,           // Optional: Actual change %
  "predictionAccuracy": 85,             // Optional: Prediction accuracy
  "evaluationDate": "2024-01-01T00:00:00Z" // Optional: Evaluation date
}
```

**Response Schema**:
```json
{
  "id": 1,
  "articleId": 1,
  "stockSymbol": "AKBNK",
  "predictedImpact": "UP",
  "predictedChangePercent": 5.5,
  "predictionConfidence": 75,
  "actualImpact": "UP",
  "actualChangePercent": 4.2,
  "predictionAccuracy": 85,
  "evaluationDate": "2024-01-01T00:00:00Z",
  "timeWindow": "1D",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 2. Get Reliability Tracking by ID
- **Method**: `GET`
- **URL**: `/api/reliability/get?id={id}`
- **Description**: Retrieve a specific reliability tracking record by ID

**Query Parameters**:
- `id` (number, required): Reliability tracking ID

**Response Schema**: Same as Save Reliability Tracking response

### 3. Get Reliability Tracking List
- **Method**: `POST`
- **URL**: `/api/reliability/getlist`
- **Description**: Retrieve paginated list of reliability tracking records

**Request Schema**: CriteriaDto (same as RSS Sources getlist)

**Response Schema**:
```json
{
  "items": [
    {
      "id": 1,
      "articleId": 1,
      "stockSymbol": "AKBNK",
      "predictedImpact": "UP",
      "predictedChangePercent": 5.5,
      "predictionConfidence": 75,
      "actualImpact": "UP",
      "actualChangePercent": 4.2,
      "predictionAccuracy": 85,
      "evaluationDate": "2024-01-01T00:00:00Z",
      "timeWindow": "1D",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100
}
```

### 4. Delete Reliability Tracking
- **Method**: `DELETE`
- **URL**: `/api/reliability/delete?id={id}`
- **Description**: Delete a specific reliability tracking record

**Query Parameters**:
- `id` (number, required): Reliability tracking ID

**Response Schema**:
```json
{
  "message": "Reliability Tracking deleted successfully"
}
```

---

## Job Execution History Module (`/api/job-execution-history`)

This module provides endpoints to view scheduled job execution history for monitoring and debugging purposes. All endpoints are read-only.

### 1. Get Job Execution History by ID
- **Method**: `GET`
- **URL**: `/api/job-execution-history/get?id={id}`
- **Description**: Retrieve a specific job execution history record by ID

**Query Parameters**:
- `id` (number, required): Job execution history ID

**Response Schema**:
```json
{
  "id": 1,
  "jobName": "RssFetchSchedule",
  "status": "SUCCESS",
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T10:05:00Z",
  "duration": 300000,
  "errorMessage": null,
  "errorStack": null,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:05:00Z"
}
```

### 2. Get Job Execution History List
- **Method**: `POST`
- **URL**: `/api/job-execution-history/getlist`
- **Description**: Retrieve paginated list of job execution history records

**Request Schema**:
```json
{
  "page": 0,           // Optional: Page number (0-based, default: 0)
  "pageSize": 10,      // Optional: Items per page (default: 10)
  "sortField": "startTime",  // Optional: Field to sort by
  "sortType": "DESC"   // Optional: Sort direction (ASC, DESC)
}
```

**Response Schema**:
```json
{
  "items": [
    {
      "id": 1,
      "jobName": "RssFetchSchedule",
      "status": "SUCCESS",
      "startTime": "2024-01-01T10:00:00Z",
      "endTime": "2024-01-01T10:05:00Z",
      "duration": 300000,
      "errorMessage": null,
      "errorStack": null,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:05:00Z"
    },
    {
      "id": 2,
      "jobName": "StockFetchSchedule",
      "status": "FAILED",
      "startTime": "2024-01-01T10:15:00Z",
      "endTime": "2024-01-01T10:15:30Z",
      "duration": 30000,
      "errorMessage": "Network timeout",
      "errorStack": "Error: Network timeout\n    at fetch...",
      "createdAt": "2024-01-01T10:15:00Z",
      "updatedAt": "2024-01-01T10:15:30Z"
    }
  ],
  "total": 150
}
```

### 3. Get Executions by Job Name
- **Method**: `GET`
- **URL**: `/api/job-execution-history/by-job-name?jobName={jobName}`
- **Description**: Retrieve all execution history records for a specific scheduled job

**Query Parameters**:
- `jobName` (string, required): Name of the scheduled job (e.g., "RssFetchSchedule", "StockFetchSchedule")

**Response Schema**: Same as Get Job Execution History List response

**Example**:
```
GET /api/job-execution-history/by-job-name?jobName=RssFetchSchedule
```

### 4. Get Job Execution Statistics
- **Method**: `GET`
- **URL**: `/api/job-execution-history/statistics?jobName={jobName}&days={days}`
- **Description**: Get execution statistics for a specific job over a time period

**Query Parameters**:
- `jobName` (string, required): Name of the scheduled job
- `days` (number, optional): Number of days to analyze (default: 7)

**Response Schema**:
```json
{
  "jobName": "RssFetchSchedule",
  "total": 100,
  "successful": 85,
  "failed": 10,
  "skipped": 5,
  "averageDuration": 245000,
  "successRate": 85.0
}
```

**Response Fields**:
- `total` - Total number of executions in the period
- `successful` - Number of successful executions
- `failed` - Number of failed executions
- `skipped` - Number of skipped executions
- `averageDuration` - Average execution duration in milliseconds (for successful executions)
- `successRate` - Success rate percentage (successful / total * 100)

**Example**:
```
GET /api/job-execution-history/statistics?jobName=RssFetchSchedule&days=30
```

### 5. Get Recent Executions
- **Method**: `GET`
- **URL**: `/api/job-execution-history/recent?limit={limit}`
- **Description**: Retrieve recent job executions across all jobs, ordered by start time (most recent first)

**Query Parameters**:
- `limit` (number, optional): Maximum number of records to return (default: 100)

**Response Schema**: Same as Get Job Execution History List response

**Example**:
```
GET /api/job-execution-history/recent?limit=50
```

---

## Enum Values Reference

### FeedTypeEnum
- `RSS2` - RSS 2.0 format
- `ATOM` - Atom feed format
- `JSON` - JSON feed format

### SourceCategoryEnum
- `COMPANY_NEWS` - Company-specific news
- `ECONOMY` - Economic news
- `SECTOR_NEWS` - Sector-specific news
- `INTERNATIONAL` - International news
- `POLICY` - Policy and regulation news
- `FINANCIAL_MARKETS` - Financial markets news

### NewsCategoryEnum
- `COMPANY_NEWS` - Company-specific news
- `MACRO_ECONOMY` - Macro economic news
- `SECTOR_NEWS` - Sector-specific news
- `INTERNATIONAL` - International news
- `POLICY_REGULATION` - Policy and regulation news
- `FINANCIAL_MARKETS` - Financial markets news

### ImpactLevelEnum
- `LOW` - Low impact
- `MEDIUM` - Medium impact
- `HIGH` - High impact
- `CRITICAL` - Critical impact

### NewsStatusEnum
- `PENDING` - Pending processing
- `PROCESSING` - Currently processing
- `PROCESSED` - Successfully processed
- `ARCHIVED` - Archived
- `FAILED` - Processing failed

### PredictionImpactEnum
- `UP` - Positive impact (price increase)
- `DOWN` - Negative impact (price decrease)
- `NEUTRAL` - No significant impact

### ExecutionStatusEnum
- `SUCCESS` - Job executed successfully
- `FAILED` - Job execution failed with error
- `SKIPPED` - Job execution was skipped (e.g., already running or shouldRun returned false)

---

## Common Response Patterns

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Success Message Response
```json
{
  "message": "Operation completed successfully"
}
```

### Pagination Response
```json
{
  "items": [...],
  "total": 100
}
```

---

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All numeric IDs are positive integers
3. Pagination is 0-based (first page is page 0)
4. Default page size is 10 items
5. All endpoints return JSON responses
6. Authentication headers may be required for production use
7. Rate limiting may apply to prevent abuse
