# RSS Feed Processing System - Implementation Roadmap

## Current Status ✅
- ✅ PostgreSQL Database mevcut (`insdb`)
- ✅ Entity class'ları oluşturuldu (`@AutoEntity` decorator ile)
- ✅ TypeORM Schema dosyaları oluşturuldu (EntitySchema API ile)
- ✅ Enum'lar tanımlandı
- ✅ Migration yapılandırması hazır (`typeorm-migration.config.ts`)
- ✅ Database configuration hazır (`database.config.ts`)

## Implementation Steps

---

## PHASE 1: Database Migrations

### 1.1. Environment Variables Kontrol
`.env` dosyasında gerekli değişkenleri kontrol et:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=insdb
```

### 1.2. Initial Migration Generate
```bash
npm run migration:generate --name=InitialSchema
```

**Oluşturulacak tablolar:**
- `rss_sources` - RSS feed kaynakları
- `source_reliability_scores` - Kaynak güvenilirlik skorları
- `news_articles` - Haber makaleleri
- `news_tags` - Etiketler
- `news_article_tags` - Makale-etiket ilişkileri (junction table)
- `stock_mentions` - Hisse senedi bahisleri
- `extracted_items` - Çıkarılan varlıklar (NER)
- `news_reliability_tracking` - Haber güvenilirlik takibi

### 1.3. Migration Run
```bash
npm run migration:run
```

### 1.4. Migration Doğrulama
```bash
# Migration durumunu kontrol et
npm run migration:show

# Veya psql ile
psql -U postgres -d insdb
\dt
\d rss_sources
\d news_articles
\q
```

---

## PHASE 2: Module Structure Setup

### 2.1. RSS Sources Module
**Dizin:** `src/modules/rss-sources/`

**Oluşturulacak dosyalar:**
```
rss-sources/
├── entities/
│   ├── rss-source.entity.ts ✅ (Mevcut)
│   └── source-reliability-score.entity.ts ✅ (Mevcut)
├── schemas/
│   ├── rss-source.schema.ts ✅ (Mevcut)
│   └── source-reliability-score.schema.ts ✅ (Mevcut)
├── enums/
│   ├── feed-type.enum.ts ✅ (Mevcut)
│   └── source-category.enum.ts ✅ (Mevcut)
├── dto/
│   ├── create-rss-source.dto.ts
│   ├── update-rss-source.dto.ts
│   └── mapping.ts
├── responses/
│   ├── rss-source-response.dto.ts
│   ├── rss-source-list-response.dto.ts
│   └── mapping.ts
├── rss-sources.controller.ts
├── rss-sources.service.ts
└── rss-sources.module.ts
```

**Module yapısı:**
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([RssSourceSchema, SourceReliabilityScoreSchema])],
  controllers: [RssSourcesController],
  providers: [RssSourcesService],
  exports: [RssSourcesService],
})
export class RssSourcesModule {}
```

### 2.2. News Module
**Dizin:** `src/modules/news/`

**Oluşturulacak dosyalar:**
```
news/
├── entities/ ✅ (Mevcut)
├── schemas/ ✅ (Mevcut)
├── enums/ ✅ (Mevcut)
├── dto/
│   ├── create-news-article.dto.ts
│   ├── update-news-article.dto.ts
│   ├── create-news-tag.dto.ts
│   ├── update-news-tag.dto.ts
│   ├── create-stock-mention.dto.ts
│   ├── create-extracted-item.dto.ts
│   └── mapping.ts
├── responses/
│   ├── news-article-response.dto.ts
│   ├── news-article-list-response.dto.ts
│   ├── news-tag-response.dto.ts
│   ├── stock-mention-response.dto.ts
│   ├── extracted-item-response.dto.ts
│   └── mapping.ts
├── news.controller.ts
├── news.service.ts
├── news-tags.service.ts
├── stock-mentions.service.ts
├── extracted-items.service.ts
└── news.module.ts
```

**Module yapısı:**
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([
      NewsArticleSchema,
      NewsTagSchema,
      NewsArticleTagSchema,
      StockMentionSchema,
      ExtractedItemSchema,
    ]),
  ],
  controllers: [NewsController],
  providers: [
    NewsService,
    NewsTagsService,
    StockMentionsService,
    ExtractedItemsService,
  ],
  exports: [
    NewsService,
    NewsTagsService,
    StockMentionsService,
    ExtractedItemsService,
  ],
})
export class NewsModule {}
```

### 2.3. News Reliability Module
**Dizin:** `src/modules/news-reliability/`

**Oluşturulacak dosyalar:**
```
news-reliability/
├── entities/
│   └── news-reliability-tracking.entity.ts ✅ (Mevcut)
├── schemas/
│   └── news-reliability-tracking.schema.ts ✅ (Mevcut)
├── enums/
│   └── prediction-impact.enum.ts ✅ (Mevcut)
├── dto/
│   ├── create-reliability-tracking.dto.ts
│   ├── update-reliability-tracking.dto.ts
│   └── mapping.ts
├── responses/
│   ├── reliability-tracking-response.dto.ts
│   ├── reliability-tracking-list-response.dto.ts
│   └── mapping.ts
├── news-reliability.controller.ts
├── news-reliability.service.ts
└── news-reliability.module.ts
```

### 2.4. AppModule'e Ekleme
`src/app.module.ts` dosyasını güncelle:
```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get<TypeOrmModuleOptions>('database'),
    }),
    // Yeni modüller
    RssSourcesModule,
    NewsModule,
    NewsReliabilityModule,
    PaymentModule, // Mevcut
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## PHASE 3: Service Layer Implementation

### 3.1. RSS Sources Service
**Dosya:** `src/modules/rss-sources/rss-sources.service.ts`

**Sorumluluklar:**
- RSS kaynaklarını CRUD operasyonları
- Aktif kaynak listesi sorgulama
- Kaynak güvenilirlik skorlarını hesaplama
- Fetch interval kontrolü

**Temel metodlar:**
```typescript
- create(dto: CreateRssSourceDto): Promise<RssSource>
- findAll(): Promise<RssSource[]>
- findOne(id: number): Promise<RssSource>
- findActiveSourcesByCategory(category: SourceCategoryEnum): Promise<RssSource[]>
- update(id: number, dto: UpdateRssSourceDto): Promise<RssSource>
- updateLastFetchTime(id: number): Promise<void>
- updateReliabilityScore(sourceId: number): Promise<void>
- remove(id: number): Promise<void>
```

### 3.2. News Service
**Dosya:** `src/modules/news/news.service.ts`

**Sorumluluklar:**
- Haber makalelerini CRUD operasyonları
- Kategoriye göre filtreleme
- Sentiment analizi entegrasyonu
- Impact level belirleme
- Güvenilirlik skoru hesaplama

**Temel metodlar:**
```typescript
- create(dto: CreateNewsArticleDto): Promise<NewsArticle>
- findAll(filters?: FilterDto): Promise<NewsArticle[]>
- findOne(id: number): Promise<NewsArticle>
- findByCategory(category: NewsCategoryEnum): Promise<NewsArticle[]>
- findByDateRange(startDate: Date, endDate: Date): Promise<NewsArticle[]>
- update(id: number, dto: UpdateNewsArticleDto): Promise<NewsArticle>
- updateSentiment(id: number, score: number): Promise<void>
- updateImpactLevel(id: number, level: ImpactLevelEnum): Promise<void>
- remove(id: number): Promise<void>
- checkDuplicate(url: string): Promise<boolean>
```

### 3.3. News Tags Service
**Dosya:** `src/modules/news/news-tags.service.ts`

**Sorumluluklar:**
- Tag CRUD operasyonları
- Makale-tag ilişkilendirme
- Popüler tag listesi
- Tag kullanım istatistikleri

**Temel metodlar:**
```typescript
- create(dto: CreateNewsTagDto): Promise<NewsTag>
- findAll(): Promise<NewsTag[]>
- findOne(id: number): Promise<NewsTag>
- findByType(type: TagTypeEnum): Promise<NewsTag[]>
- findOrCreate(name: string, type: TagTypeEnum): Promise<NewsTag>
- attachTagsToArticle(articleId: number, tagIds: number[]): Promise<void>
- getPopularTags(limit: number): Promise<NewsTag[]>
- incrementUsageCount(tagId: number): Promise<void>
- remove(id: number): Promise<void>
```

### 3.4. Stock Mentions Service
**Dosya:** `src/modules/news/stock-mentions.service.ts`

**Sorumluluklar:**
- Hisse senedi bahislerini kaydetme
- Symbol bazında arama
- Sentiment analizi entegrasyonu

**Temel metodlar:**
```typescript
- create(dto: CreateStockMentionDto): Promise<StockMention>
- findByArticle(articleId: number): Promise<StockMention[]>
- findByStock(stockSymbol: string): Promise<StockMention[]>
- findByStockAndDateRange(symbol: string, startDate: Date, endDate: Date): Promise<StockMention[]>
- updateSentiment(id: number, sentiment: SentimentEnum): Promise<void>
- remove(id: number): Promise<void>
```

### 3.5. Extracted Items Service
**Dosya:** `src/modules/news/extracted-items.service.ts`

**Sorumluluklar:**
- NER sonuçlarını kaydetme
- Entity type bazında arama
- Normalizasyon

**Temel metodlar:**
```typescript
- create(dto: CreateExtractedItemDto): Promise<ExtractedItem>
- createBulk(items: CreateExtractedItemDto[]): Promise<ExtractedItem[]>
- findByArticle(articleId: number): Promise<ExtractedItem[]>
- findByType(entityType: EntityTypeEnum): Promise<ExtractedItem[]>
- findByArticleAndType(articleId: number, entityType: EntityTypeEnum): Promise<ExtractedItem[]>
- remove(id: number): Promise<void>
```

### 3.6. News Reliability Service
**Dosya:** `src/modules/news-reliability/news-reliability.service.ts`

**Sorumluluklar:**
- Tahmin kaydı oluşturma
- Gerçekleşme bilgisi güncelleme
- Doğruluk oranı hesaplama
- Kaynak bazında doğruluk raporu

**Temel metodlar:**
```typescript
- createPrediction(dto: CreateReliabilityTrackingDto): Promise<NewsReliabilityTracking>
- updateActualImpact(id: number, actualImpact: PredictionImpactEnum): Promise<void>
- calculateAccuracy(articleId: number): Promise<boolean>
- getSourceAccuracyReport(sourceId: number): Promise<AccuracyReport>
- getPendingPredictions(): Promise<NewsReliabilityTracking[]>
- remove(id: number): Promise<void>
```

---

## PHASE 4: DTO & Response Layer

### 4.1. Input DTOs (Validation)

**Örnek:** `create-rss-source.dto.ts`
```typescript
import { BaseCreateDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';
import { CreateRssSourceMapping } from './mapping';

@AutoApplyDecorators(CreateRssSourceMapping)
export class CreateRssSourceDto extends BaseCreateDto {
  name: string;
  url: string;
  feedType: FeedTypeEnum;
  category: SourceCategoryEnum;
  country: string;
  fetchInterval: number;
  isActive?: boolean;
}
```

**Mapping dosyası:** `dto/mapping.ts`
```typescript
import { StringField, NumberField, EnumField, BooleanField } from '../../../common/decorators/field.decorator';
import { FeedTypeEnum } from '../enums/feed-type.enum';
import { SourceCategoryEnum } from '../enums/source-category.enum';

export const CreateRssSourceMapping = {
  name: () => StringField('RSS source name', 'Bloomberg Türkiye', true, 3, 255),
  url: () => StringField('RSS feed URL', 'https://example.com/rss', true, 10, 500),
  feedType: () => EnumField(FeedTypeEnum, 'RSS feed type', FeedTypeEnum.RSS_2_0, true),
  category: () => EnumField(SourceCategoryEnum, 'Source category', SourceCategoryEnum.NEWS, true),
  country: () => StringField('Country code', 'TR', true, 2, 10),
  fetchInterval: () => NumberField('Fetch interval in minutes', 60, true, 5, 1440),
  isActive: () => BooleanField('Is source active', true, false),
};
```

### 4.2. Response DTOs (Mapping)

**Örnek:** `rss-source-response.dto.ts`
```typescript
import { BaseResponseDto } from '../../../common/base/base-dto';
import { AutoResponse } from '../../../common/decorators/auto-response.decorator';
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
```

**Response Mapping:** `responses/mapping.ts`
```typescript
import { ResponseFieldConfig } from '../../../common/decorators/auto-response.decorator';
import { FeedTypeEnum } from '../enums/feed-type.enum';
import { SourceCategoryEnum } from '../enums/source-category.enum';

export const RssSourceResponseMapping: Record<string, ResponseFieldConfig> = {
  name: { description: 'RSS source name', example: 'Bloomberg Türkiye', required: true, type: String },
  url: { description: 'RSS feed URL', example: 'https://example.com/rss', required: true, type: String },
  feedType: { description: 'Feed type', example: 'RSS_2_0', required: true, enum: FeedTypeEnum },
  category: { description: 'Source category', example: 'NEWS', required: true, enum: SourceCategoryEnum },
  country: { description: 'Country code', example: 'TR', required: true, type: String },
  reliabilityScore: { description: 'Source reliability score', example: 8.5, required: true, type: Number },
  isActive: { description: 'Is source active', example: true, required: true, type: Boolean },
  fetchInterval: { description: 'Fetch interval in minutes', example: 60, required: true, type: Number },
  lastFetchedAt: { description: 'Last fetch timestamp', example: '2024-01-01T00:00:00Z', required: false, type: Date },
};
```

### 4.3. List Response DTOs

**Örnek:** `rss-source-list-response.dto.ts`
```typescript
import { BaseListResponseDto } from '../../../common/base/base-dto';
import { RssSourceResponseDto } from './rss-source-response.dto';

export class RssSourceListResponseDto extends BaseListResponseDto<RssSourceResponseDto> {}
```

---

## PHASE 5: Controller Layer

### 5.1. RSS Sources Controller
**Dosya:** `src/modules/rss-sources/rss-sources.controller.ts`

**Endpoints:**
```typescript
@CrudController('rss-sources', 'RssSource')
export class RssSourcesController extends BaseController<
  RssSource,
  CreateRssSourceDto,
  UpdateRssSourceDto,
  RssSourceResponseDto,
  RssSourceListResponseDto
> {
  constructor(private readonly rssSourcesService: RssSourcesService) {
    super(rssSourcesService);
  }

  protected getResponseClass = () => RssSourceResponseDto;
  protected getListResponseClass = () => RssSourceListResponseDto;
  protected getEntityName = () => 'RssSource';

  // GET /rss-sources/active
  @Get('active')
  async getActiveSources(): Promise<RssSourceListResponseDto>

  // GET /rss-sources/category/:category
  @Get('category/:category')
  async getByCategory(@Param('category') category: SourceCategoryEnum): Promise<RssSourceListResponseDto>

  // PATCH /rss-sources/:id/reliability
  @Patch(':id/reliability')
  async updateReliability(@Param('id') id: number): Promise<RssSourceResponseDto>
}
```

### 5.2. News Controller
**Dosya:** `src/modules/news/news.controller.ts`

**Endpoints:**
```typescript
@CrudController('news', 'NewsArticle')
export class NewsController extends BaseController<
  NewsArticle,
  CreateNewsArticleDto,
  UpdateNewsArticleDto,
  NewsArticleResponseDto,
  NewsArticleListResponseDto
> {
  constructor(private readonly newsService: NewsService) {
    super(newsService);
  }

  protected getResponseClass = () => NewsArticleResponseDto;
  protected getListResponseClass = () => NewsArticleListResponseDto;
  protected getEntityName = () => 'NewsArticle';

  // GET /news/category/:category
  @Get('category/:category')
  async getByCategory(@Param('category') category: NewsCategoryEnum): Promise<NewsArticleListResponseDto>

  // GET /news/date-range
  @Get('date-range')
  async getByDateRange(@Query() query: DateRangeDto): Promise<NewsArticleListResponseDto>

  // GET /news/:id/tags
  @Get(':id/tags')
  async getArticleTags(@Param('id') id: number): Promise<NewsTagListResponseDto>

  // GET /news/:id/stocks
  @Get(':id/stocks')
  async getArticleStocks(@Param('id') id: number): Promise<StockMentionListResponseDto>

  // GET /news/:id/entities
  @Get(':id/entities')
  async getExtractedEntities(@Param('id') id: number): Promise<ExtractedItemListResponseDto>

  // PATCH /news/:id/sentiment
  @Patch(':id/sentiment')
  async updateSentiment(@Param('id') id: number, @Body() dto: UpdateSentimentDto): Promise<NewsArticleResponseDto>
}
```

---

## PHASE 6: RSS Parser Implementation

### 6.1. RSS Parser Service
**Dosya:** `src/modules/rss-sources/rss-parser.service.ts`

**Sorumluluklar:**
- RSS/Atom feed parsing
- XML parsing
- Duplicate detection
- Error handling

**Dependencies:**
```bash
npm install rss-parser
npm install @types/rss-parser --save-dev
```

**Temel metodlar:**
```typescript
- parseFeed(url: string, feedType: FeedTypeEnum): Promise<ParsedFeed>
- fetchAndParse(source: RssSource): Promise<ParsedItem[]>
- normalizeItem(item: any): Promise<ParsedItem>
- detectDuplicate(url: string): Promise<boolean>
```

### 6.2. RSS Scheduler Service
**Dosya:** `src/modules/rss-sources/rss-scheduler.service.ts`

**Sorumluluklar:**
- Scheduled tasks (cron jobs)
- Interval-based fetching
- Error retry mechanism
- Source rotation

**Dependencies:**
```bash
npm install @nestjs/schedule
```

**Temel metodlar:**
```typescript
- @Cron('*/15 * * * *') // Her 15 dakikada
  async fetchAllActiveSources(): Promise<void>

- async fetchSource(source: RssSource): Promise<void>
- async processItems(items: ParsedItem[], sourceId: number): Promise<void>
- async handleFetchError(sourceId: number, error: Error): Promise<void>
```

### 6.3. RSS Module Güncelleme
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([RssSourceSchema, SourceReliabilityScoreSchema]),
    ScheduleModule.forRoot(),
  ],
  controllers: [RssSourcesController],
  providers: [
    RssSourcesService,
    RssParserService,
    RssSchedulerService,
  ],
  exports: [RssSourcesService, RssParserService],
})
export class RssSourcesModule {}
```

---

## PHASE 7: AI/NLP Integration

### 7.1. NLP Analysis Service
**Dosya:** `src/modules/news/nlp-analysis.service.ts`

**Sorumluluklar:**
- Sentiment analysis
- Named Entity Recognition (NER)
- Text categorization
- Keyword extraction

**Olası yaklaşımlar:**
1. **OpenAI GPT-4 API** (Yüksek doğruluk, maliyet)
2. **Hugging Face Transformers** (Açık kaynak, kendi host)
3. **Google Cloud Natural Language API** (Güçlü NER)
4. **Custom fine-tuned model** (Türkçe finans haberleri için özel)

**Temel metodlar:**
```typescript
- analyzeSentiment(text: string): Promise<SentimentResult>
- extractEntities(text: string): Promise<ExtractedEntity[]>
- categorizeNews(text: string): Promise<NewsCategoryEnum>
- extractKeywords(text: string): Promise<string[]>
- extractStockMentions(text: string): Promise<StockMention[]>
- calculateImpactLevel(article: NewsArticle): Promise<ImpactLevelEnum>
```

### 7.2. Sentiment Analysis Flow
```typescript
async analyzeSentiment(text: string): Promise<SentimentResult> {
  // 1. Text preprocessing
  const cleanText = this.preprocessText(text);
  
  // 2. API call (örnek: OpenAI)
  const result = await this.openaiService.analyzeSentiment(cleanText);
  
  // 3. Score normalization (-1 to 1)
  const normalizedScore = this.normalizeSentimentScore(result);
  
  // 4. Confidence calculation
  const confidence = this.calculateConfidence(result);
  
  return {
    score: normalizedScore,
    sentiment: this.scoreToSentiment(normalizedScore),
    confidence: confidence,
  };
}
```

### 7.3. NER (Named Entity Recognition) Flow
```typescript
async extractEntities(text: string): Promise<ExtractedEntity[]> {
  // 1. Text preprocessing
  const cleanText = this.preprocessText(text);
  
  // 2. NER API call
  const entities = await this.nlpService.extractEntities(cleanText);
  
  // 3. Filter by type (PERSON, ORGANIZATION, MONEY, etc.)
  const filtered = this.filterRelevantEntities(entities);
  
  // 4. Normalize values (örn: "$1 Million" -> 1000000)
  const normalized = this.normalizeEntityValues(filtered);
  
  return normalized;
}
```

### 7.4. Article Processing Pipeline
**Dosya:** `src/modules/news/article-processor.service.ts`

**Flow:**
```typescript
async processArticle(article: NewsArticle): Promise<void> {
  try {
    // 1. Sentiment Analysis
    const sentiment = await this.nlpService.analyzeSentiment(article.content);
    await this.newsService.updateSentiment(article.id, sentiment.score);
    
    // 2. NER - Extract Entities
    const entities = await this.nlpService.extractEntities(article.content);
    await this.extractedItemsService.createBulk(
      entities.map(e => ({ ...e, articleId: article.id }))
    );
    
    // 3. Extract Stock Mentions
    const stocks = await this.nlpService.extractStockMentions(article.content);
    for (const stock of stocks) {
      await this.stockMentionsService.create({ ...stock, articleId: article.id });
    }
    
    // 4. Categorization
    const category = await this.nlpService.categorizeNews(article.content);
    await this.newsService.update(article.id, { category });
    
    // 5. Impact Level
    const impactLevel = await this.nlpService.calculateImpactLevel(article);
    await this.newsService.updateImpactLevel(article.id, impactLevel);
    
    // 6. Auto-tagging
    const tags = await this.nlpService.extractKeywords(article.content);
    for (const tagName of tags) {
      const tag = await this.newsTagsService.findOrCreate(tagName, TagTypeEnum.KEYWORD);
      await this.newsTagsService.attachTagsToArticle(article.id, [tag.id]);
    }
    
    // 7. Reliability Prediction
    await this.createReliabilityPrediction(article);
    
  } catch (error) {
    console.error(`Failed to process article ${article.id}:`, error);
    await this.newsService.update(article.id, { status: NewsStatusEnum.FAILED });
  }
}
```

### 7.5. OpenAI Integration (Örnek)
**Dosya:** `src/common/services/openai.service.ts`

```bash
npm install openai
```

```typescript
@Injectable()
export class OpenAIService {
  private client: OpenAI;

  constructor(private configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    const prompt = `
      Analyze the sentiment of this Turkish financial news article.
      Return a JSON with: score (-1 to 1), sentiment (positive/negative/neutral), confidence (0-1).
      
      Article: ${text}
    `;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  async extractEntities(text: string): Promise<ExtractedEntity[]> {
    const prompt = `
      Extract named entities from this Turkish financial news.
      Return a JSON array with: entity_type, entity_text, normalized_value, confidence.
      Types: PERSON, ORGANIZATION, LOCATION, MONEY, PERCENT, DATE
      
      Article: ${text}
    `;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content).entities;
  }

  async categorizeNews(text: string): Promise<string> {
    const prompt = `
      Categorize this Turkish financial news article.
      Choose ONE category: COMPANY_NEWS, MACRO_ECONOMY, COMMODITY, ENERGY, POLITICS, CRYPTO
      Return only the category name.
      
      Article: ${text}
    `;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content.trim();
  }
}
```

---

## PHASE 8: Testing & Verification

### 8.1. Manual Testing
```bash
# RSS Source ekle
curl -X POST http://localhost:3000/api/v1/rss-sources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bloomberg HT",
    "url": "https://www.bloomberght.com/rss",
    "feedType": "RSS_2_0",
    "category": "NEWS",
    "country": "TR",
    "fetchInterval": 60
  }'

# Aktif kaynaklarını listele
curl http://localhost:3000/api/v1/rss-sources/active

# News listesi
curl http://localhost:3000/api/v1/news

# Kategoriye göre haberler
curl http://localhost:3000/api/v1/news/category/COMPANY_NEWS
```

### 8.2. Swagger Documentation
```
http://localhost:3000/api/docs
```

### 8.3. Scheduler Test
```bash
# Application başlat
npm run start:dev

# Logları izle (RSS fetch işlemleri)
tail -f logs/application.log
```

---

## PHASE 9: Production Optimization

### 9.1. Caching
```bash
npm install @nestjs/cache-manager cache-manager
```

**Cache stratejisi:**
- RSS feed results (15 dakika)
- Popular tags (1 saat)
- Source reliability scores (24 saat)
- News by category (5 dakika)

### 9.2. Rate Limiting
```bash
npm install @nestjs/throttler
```

**Limitler:**
- RSS fetch: Max 100 requests/hour per source
- API endpoints: Max 100 requests/minute per IP
- AI/NLP calls: Max 1000 requests/hour

### 9.3. Logging
```bash
npm install winston
```

**Log seviyerleri:**
- RSS fetch success/failure
- NLP processing errors
- Database errors
- API request/response times

### 9.4. Monitoring
```bash
npm install @nestjs/terminus
```

**Health checks:**
- Database connection
- External APIs (RSS feeds, OpenAI)
- Memory usage
- Scheduler status

---

## PHASE 10: Deployment

### 10.1. Environment Variables
```env
# Production .env
NODE_ENV=production
PORT=3000

# Database
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_USERNAME=prod_user
DB_PASSWORD=secure_password
DB_DATABASE=insdb_prod

# OpenAI
OPENAI_API_KEY=sk-...

# Redis Cache
REDIS_HOST=your-redis-endpoint
REDIS_PORT=6379

# Logging
LOG_LEVEL=info
```

### 10.2. Docker Setup
**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: insdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  postgres_data:
```

### 10.3. Migration Strategy
```bash
# Production migration
npm run migration:run

# Rollback if needed
npm run migration:revert
```

---

## Success Criteria

### ✅ Phase 1: Database
- [ ] Environment variables verified (DB_DATABASE=insdb)
- [ ] All migrations run successfully
- [ ] 8 tables created with correct schema
- [ ] Indexes and foreign keys working

### ✅ Phase 2: Modules
- [ ] 3 modules registered in AppModule
- [ ] All services injectable
- [ ] All controllers exposed

### ✅ Phase 3: Services
- [ ] CRUD operations working for all entities
- [ ] Business logic implemented
- [ ] Error handling in place

### ✅ Phase 4: DTOs
- [ ] Input validation working
- [ ] Response mapping working
- [ ] Swagger documentation visible

### ✅ Phase 5: Controllers
- [ ] All endpoints accessible
- [ ] Swagger UI showing all endpoints
- [ ] Request/response formatted correctly

### ✅ Phase 6: RSS Parser
- [ ] RSS feeds fetched successfully
- [ ] Duplicate detection working
- [ ] Scheduled tasks running
- [ ] Articles saved to database

### ✅ Phase 7: AI/NLP
- [ ] Sentiment analysis working
- [ ] NER extracting entities
- [ ] Categorization accurate
- [ ] Stock mentions detected

### ✅ Phase 8: Testing
- [ ] Manual API tests passing
- [ ] Swagger documentation complete
- [ ] Scheduler running without errors

### ✅ Phase 9: Production
- [ ] Caching implemented
- [ ] Rate limiting active
- [ ] Logging configured
- [ ] Health checks working

### ✅ Phase 10: Deployment
- [ ] Docker image built
- [ ] Application deployed
- [ ] Migrations run on production
- [ ] Monitoring active

---

## Estimated Timeline

| Phase | Estimated Time |
|-------|---------------|
| Phase 1: Database Migrations | 0.5-1 hours |
| Phase 2: Module Structure | 2-3 hours |
| Phase 3: Service Layer | 4-6 hours |
| Phase 4: DTO & Response | 3-4 hours |
| Phase 5: Controller Layer | 2-3 hours |
| Phase 6: RSS Parser | 4-6 hours |
| Phase 7: AI/NLP Integration | 8-12 hours |
| Phase 8: Testing | 2-4 hours |
| Phase 9: Production Optimization | 4-6 hours |
| Phase 10: Deployment | 2-3 hours |
| **TOTAL** | **31-48 hours** |

---

## Priority Order (If Time Constrained)

**Critical (Must Have):**
1. Phase 1: Database Migrations
2. Phase 2: Module Structure (minimum)
3. Phase 3: Service Layer (CRUD only)
4. Phase 6: RSS Parser (basic fetch)

**Important (Should Have):**
5. Phase 4: DTOs (basic validation)
6. Phase 5: Controller Layer
7. Phase 7: AI/NLP (sentiment + categorization only)

**Nice to Have:**
8. Phase 7: AI/NLP (full features)
9. Phase 8: Testing
10. Phase 9: Production Optimization
11. Phase 10: Deployment

---

## Next Immediate Steps

1. **Environment variables kontrol:**
   ```bash
   # .env dosyasında DB_DATABASE=insdb olduğundan emin ol
   ```

2. **Migration generate:**
   ```bash
   npm run migration:generate --name=InitialSchema
   ```

3. **Migration run:**
   ```bash
   npm run migration:run
   ```

4. **Verification:**
   ```bash
   npm run migration:show
   psql -U postgres -d insdb -c "\dt"
   ```

5. **Module dosyalarını oluşturmaya başla** (Phase 2)

---

## Notes

- Her phase'den sonra test et
- Swagger documentation'ı düzenli kontrol et
- AI/NLP integration maliyet optimizasyonu yap
- Production'a geçmeden önce tüm endpoints test edilmeli
- Migration'ları asla production'da revert etme
- Database backup stratejisi belirle
- RSS feed rate limiting'e dikkat et (429 errors)
- OpenAI API quota'sını izle

---

**Last Updated:** 2024-01-26
**Status:** Ready for implementation - Start with Phase 1

