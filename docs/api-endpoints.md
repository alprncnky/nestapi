# API Endpoints Documentation

Bu dokümantasyon InsightAPI'nin tüm endpoint'lerini, request/response modellerini ve enum değerlerini içerir.

## Base URL
```
http://localhost:3000/api/v1
```

## Global Response Format
Tüm endpoint'ler aşağıdaki format ile response döner:

```json
{
  "data": { /* actual response */ },
  "message": "Success",
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Common DTOs

### CriteriaDto (Pagination)
```json
{
  "page": 0,           // Page number (0-based)
  "pageSize": 10,      // Items per page
  "sortField": "createdAt",  // Field to sort by
  "sortType": "DESC"   // Sort direction: ASC | DESC
}
```

### BaseListResponseDto
```json
{
  "items": [],         // Array of items
  "total": 0           // Total count
}
```

---

## RSS Sources Module

**Base Path:** `/rss-sources`

### 1. Save RSS Source
- **Method:** `POST`
- **URL:** `/rss-sources/save`
- **Description:** Create or update RSS source (.NET-style upsert)

#### Request Model: SaveRssSourceDto
```json
{
  "id": 1,                    // Optional: ID for updates
  "name": "Bloomberg HT",     // Required: RSS source name
  "url": "https://www.bloomberght.com/rss",  // Required: RSS feed URL
  "feedType": "RSS2",         // Required: Feed type
  "category": "COMPANY_NEWS", // Required: Source category
  "country": "TR",            // Required: Country code (ISO 3166-1 alpha-2)
  "fetchInterval": 60,        // Required: Fetch interval in minutes
  "isActive": true,           // Optional: Is source active
  "reliabilityScore": 75.5    // Optional: Reliability score (0-100)
}
```

#### Response Model: RssSourceResponseDto
```json
{
  "id": 1,
  "name": "Bloomberg HT",
  "url": "https://www.bloomberght.com/rss",
  "feedType": "RSS2",
  "category": "COMPANY_NEWS",
  "country": "TR",
  "reliabilityScore": 75.5,
  "isActive": true,
  "fetchInterval": 60,
  "lastFetchedAt": "2024-01-01T12:00:00.000Z",
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### 2. Get RSS Source
- **Method:** `GET`
- **URL:** `/rss-sources/get?id={id}`
- **Description:** Get RSS source by ID

#### Query Parameters
- `id` (number, required): RSS source ID

#### Response Model: RssSourceResponseDto
Same as Save RSS Source response.

### 3. Get RSS Sources List
- **Method:** `POST`
- **URL:** `/rss-sources/getlist`
- **Description:** Get paginated list of RSS sources

#### Request Model: CriteriaDto
```json
{
  "page": 0,
  "pageSize": 10,
  "sortField": "createdAt",
  "sortType": "DESC"
}
```

#### Response Model: RssSourceListResponseDto
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
      "reliabilityScore": 75.5,
      "isActive": true,
      "fetchInterval": 60,
      "lastFetchedAt": "2024-01-01T12:00:00.000Z",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "total": 1
}
```

### 4. Delete RSS Source
- **Method:** `DELETE`
- **URL:** `/rss-sources/delete?id={id}`
- **Description:** Delete RSS source by ID

#### Query Parameters
- `id` (number, required): RSS source ID

#### Response Model
```json
{
  "message": "RssSource with ID 1 deleted successfully"
}
```

---

## News Module

**Base Path:** `/news`

### 1. Save News Article
- **Method:** `POST`
- **URL:** `/news/save`
- **Description:** Create or update news article (.NET-style upsert)

#### Request Model: SaveNewsArticleDto
```json
{
  "id": 1,                    // Optional: ID for updates
  "sourceId": 1,              // Required: RSS source ID
  "title": "Breaking News",   // Required: Article title
  "url": "https://example.com/news",  // Required: Article URL
  "guid": "unique-guid",       // Required: Unique identifier
  "summary": "Article summary", // Optional: Article summary
  "content": "<p>Full content</p>", // Optional: HTML content
  "contentPlain": "Plain text content", // Optional: Plain text content
  "publishedAt": "2024-01-01T10:00:00.000Z", // Required: Publication date
  "scrapedAt": "2024-01-01T10:05:00.000Z",  // Optional: Scraping date
  "imageUrl": "https://example.com/image.jpg", // Optional: Image URL
  "status": "PENDING",        // Optional: Processing status
  "isDuplicate": false,      // Optional: Is duplicate
  "category": "COMPANY_NEWS", // Optional: News category
  "sentimentScore": 0.75,     // Optional: Sentiment score (-1 to 1)
  "impactLevel": "MEDIUM"    // Optional: Impact level
}
```

#### Response Model: NewsArticleResponseDto
```json
{
  "id": 1,
  "sourceId": 1,
  "title": "Breaking News",
  "url": "https://example.com/news",
  "guid": "unique-guid",
  "summary": "Article summary",
  "content": "<p>Full content</p>",
  "publishedAt": "2024-01-01T10:00:00.000Z",
  "imageUrl": "https://example.com/image.jpg",
  "category": "COMPANY_NEWS",
  "sentimentScore": 0.75,
  "impactLevel": "MEDIUM",
  "status": "PENDING",
  "createdAt": "2024-01-01T10:05:00.000Z",
  "updatedAt": "2024-01-01T10:05:00.000Z"
}
```

### 2. Get News Article
- **Method:** `GET`
- **URL:** `/news/get?id={id}`
- **Description:** Get news article by ID

#### Query Parameters
- `id` (number, required): News article ID

#### Response Model: NewsArticleResponseDto
Same as Save News Article response.

### 3. Get News Articles List
- **Method:** `POST`
- **URL:** `/news/getlist`
- **Description:** Get paginated list of news articles

#### Request Model: CriteriaDto
```json
{
  "page": 0,
  "pageSize": 10,
  "sortField": "publishedAt",
  "sortType": "DESC"
}
```

#### Response Model: NewsArticleListResponseDto
```json
{
  "items": [
    {
      "id": 1,
      "sourceId": 1,
      "title": "Breaking News",
      "url": "https://example.com/news",
      "guid": "unique-guid",
      "summary": "Article summary",
      "content": "<p>Full content</p>",
      "publishedAt": "2024-01-01T10:00:00.000Z",
      "imageUrl": "https://example.com/image.jpg",
      "category": "COMPANY_NEWS",
      "sentimentScore": 0.75,
      "impactLevel": "MEDIUM",
      "status": "PENDING",
      "createdAt": "2024-01-01T10:05:00.000Z",
      "updatedAt": "2024-01-01T10:05:00.000Z"
    }
  ],
  "total": 1
}
```

### 4. Delete News Article
- **Method:** `DELETE`
- **URL:** `/news/delete?id={id}`
- **Description:** Delete news article by ID

#### Query Parameters
- `id` (number, required): News article ID

#### Response Model
```json
{
  "message": "NewsArticle with ID 1 deleted successfully"
}
```

---

## News Reliability Module

**Base Path:** `/reliability`

### 1. Save Reliability Tracking
- **Method:** `POST`
- **URL:** `/reliability/save`
- **Description:** Create or update reliability tracking (.NET-style upsert)

#### Request Model: SaveReliabilityTrackingDto
```json
{
  "id": 1,                    // Optional: ID for updates
  "articleId": 1,             // Required: News article ID
  "stockSymbol": "AAPL",      // Required: Stock symbol
  "predictedImpact": "UP",    // Optional: Predicted impact
  "predictedChangePercent": 5.5, // Optional: Predicted change percentage
  "predictionConfidence": 0.85,  // Optional: Prediction confidence (0-1)
  "timeWindow": "1D",         // Optional: Time window for evaluation
  "actualImpact": "UP",       // Optional: Actual impact
  "actualChangePercent": 4.2, // Optional: Actual change percentage
  "predictionAccuracy": 0.92,  // Optional: Prediction accuracy (0-1)
  "evaluationDate": "2024-01-01T15:00:00.000Z" // Optional: Evaluation date
}
```

#### Response Model: ReliabilityTrackingResponseDto
```json
{
  "id": 1,
  "articleId": 1,
  "stockSymbol": "AAPL",
  "predictedImpact": "UP",
  "predictedChangePercent": 5.5,
  "predictionConfidence": 0.85,
  "actualImpact": "UP",
  "actualChangePercent": 4.2,
  "predictionAccuracy": 0.92,
  "evaluationDate": "2024-01-01T15:00:00.000Z",
  "timeWindow": "1D",
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-01T15:00:00.000Z"
}
```

### 2. Get Reliability Tracking
- **Method:** `GET`
- **URL:** `/reliability/get?id={id}`
- **Description:** Get reliability tracking by ID

#### Query Parameters
- `id` (number, required): Reliability tracking ID

#### Response Model: ReliabilityTrackingResponseDto
Same as Save Reliability Tracking response.

### 3. Get Reliability Tracking List
- **Method:** `POST`
- **URL:** `/reliability/getlist`
- **Description:** Get paginated list of reliability tracking records

#### Request Model: CriteriaDto
```json
{
  "page": 0,
  "pageSize": 10,
  "sortField": "evaluationDate",
  "sortType": "DESC"
}
```

#### Response Model: ReliabilityTrackingListResponseDto
```json
{
  "items": [
    {
      "id": 1,
      "articleId": 1,
      "stockSymbol": "AAPL",
      "predictedImpact": "UP",
      "predictedChangePercent": 5.5,
      "predictionConfidence": 0.85,
      "actualImpact": "UP",
      "actualChangePercent": 4.2,
      "predictionAccuracy": 0.92,
      "evaluationDate": "2024-01-01T15:00:00.000Z",
      "timeWindow": "1D",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T15:00:00.000Z"
    }
  ],
  "total": 1
}
```

### 4. Delete Reliability Tracking
- **Method:** `DELETE`
- **URL:** `/reliability/delete?id={id}`
- **Description:** Delete reliability tracking by ID

#### Query Parameters
- `id` (number, required): Reliability tracking ID

#### Response Model
```json
{
  "message": "ReliabilityTracking with ID 1 deleted successfully"
}
```

---

## Enum Values

### FeedTypeEnum
- `RSS2` - RSS 2.0 format
- `ATOM` - Atom format
- `JSON` - JSON Feed format

### SourceCategoryEnum
- `COMPANY_NEWS` - Company-specific news
- `ECONOMY` - Economic news
- `SECTOR_NEWS` - Sector-specific news
- `INTERNATIONAL` - International news
- `POLICY` - Policy and regulation news
- `FINANCIAL_MARKETS` - Financial markets news

### NewsStatusEnum
- `PENDING` - Waiting for processing
- `PROCESSING` - Currently being processed
- `PROCESSED` - Processing completed
- `ARCHIVED` - Archived
- `FAILED` - Processing failed

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

### PredictionImpactEnum
- `UP` - Positive impact (stock price up)
- `DOWN` - Negative impact (stock price down)
- `NEUTRAL` - Neutral impact

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/rss-sources/save",
  "message": "Validation failed"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/rss-sources/get?id=999",
  "message": "RssSource with ID 999 not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/rss-sources/save",
  "message": "RSS source with URL \"https://example.com\" already exists"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/rss-sources/save",
  "message": "Internal server error"
}
```

---

## Swagger Documentation

API dokümantasyonuna erişim:
- **URL:** `http://localhost:3000/api/docs`
- **Description:** Interactive API documentation with request/response examples

---

## Notes

1. **Upsert Pattern**: Tüm `save` endpoint'leri .NET-style upsert pattern kullanır. `id` gönderilirse update, gönderilmezse create işlemi yapar.

2. **Pagination**: List endpoint'leri `CriteriaDto` ile pagination destekler.

3. **Validation**: Tüm request'ler otomatik validation'dan geçer.

4. **Response Wrapping**: Tüm response'lar `ResponseInterceptor` ile sarılır.

5. **Error Handling**: Tüm hatalar `HttpExceptionFilter` ile formatlanır.
