# RSS Feed Processing System - Advanced Implementation

## Current Status ✅

**COMPLETED PHASES:**
- ✅ Phase 1: Database Migrations (Tables created, schema ready)
- ✅ Phase 2: Module Structure (All modules implemented)
- ✅ Phase 3: Service Layer (Business logic complete)
- ✅ Phase 4: DTO & Response Layer (Validation ready)
- ✅ Phase 5: Controller Layer (API endpoints ready)
- ✅ BONUS: Angular Dashboard (Frontend complete)

**Database Tables Ready:**
- ✅ `rss_sources` - RSS feed sources
- ✅ `source_reliability_scores` - Source reliability tracking
- ✅ `news_articles` - News articles
- ✅ `news_tags` - Tags
- ✅ `news_article_tags` - Article-tag relations
- ✅ `stock_mentions` - Stock mentions
- ✅ `extracted_items` - Extracted entities (NER)
- ✅ `news_reliability_tracking` - Reliability tracking

---

## REMAINING PHASES

This document covers the implementation of:
- **Phase 6**: RSS Parser Implementation
- **Phase 7**: AI/NLP Integration
- **Phase 8**: Testing & Verification
- **Phase 9**: Production Optimization
- **Phase 10**: Deployment

---

# PHASE 6: RSS Parser Implementation

## 📦 Required Dependencies

```bash
# RSS Parsing
npm install rss-parser
npm install @types/rss-parser --save-dev

# Scheduling
npm install @nestjs/schedule

# HTML/Text Processing
npm install cheerio
npm install @types/cheerio --save-dev

# String Similarity (for duplicate detection)
npm install string-similarity
npm install @types/string-similarity --save-dev
```

---

## 6.1. RSS Parser Service

**File:** `src/modules/rss-sources/rss-parser.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import * as Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { FeedTypeEnum } from './enums/feed-type.enum';

export interface ParsedItem {
  title: string;
  link: string;
  guid: string;
  description: string;
  content?: string;
  contentPlain?: string;
  pubDate: Date;
  author?: string;
  imageUrl?: string;
  categories?: string[];
}

@Injectable()
export class RssParserService {
  private readonly logger = new Logger(RssParserService.name);
  private readonly parser: Parser;

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ['content:encoded', 'contentEncoded'],
          ['media:content', 'mediaContent'],
          ['enclosure', 'enclosure'],
        ],
      },
      timeout: 10000, // 10 seconds timeout
    });
  }

  /**
   * Fetch and parse RSS feed
   */
  async parseFeed(url: string, feedType: FeedTypeEnum): Promise<ParsedItem[]> {
    try {
      this.logger.log(`Fetching RSS feed: ${url}`);
      
      const feed = await this.parser.parseURL(url);
      
      if (!feed.items || feed.items.length === 0) {
        this.logger.warn(`No items found in feed: ${url}`);
        return [];
      }

      this.logger.log(`Found ${feed.items.length} items in feed: ${url}`);
      
      return feed.items.map(item => this.normalizeItem(item));
    } catch (error) {
      this.logger.error(`Failed to parse RSS feed: ${url}`, error.stack);
      throw error;
    }
  }

  /**
   * Normalize feed item to common format
   */
  private normalizeItem(item: any): ParsedItem {
    // Extract content
    const content = item.contentEncoded || item.content || item.description || '';
    const contentPlain = this.stripHtml(content);

    // Extract image URL
    let imageUrl: string | undefined;
    if (item.enclosure?.url) {
      imageUrl = item.enclosure.url;
    } else if (item.mediaContent?.url) {
      imageUrl = item.mediaContent.url;
    } else {
      // Try to extract first image from content
      imageUrl = this.extractFirstImage(content);
    }

    return {
      title: item.title?.trim() || 'No Title',
      link: item.link || item.guid || '',
      guid: item.guid || item.link || '',
      description: this.stripHtml(item.description || '').substring(0, 500),
      content: content,
      contentPlain: contentPlain,
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      author: item.creator || item.author || undefined,
      imageUrl: imageUrl,
      categories: item.categories || [],
    };
  }

  /**
   * Strip HTML tags from text
   */
  private stripHtml(html: string): string {
    if (!html) return '';
    
    const $ = cheerio.load(html);
    return $.text().replace(/\s+/g, ' ').trim();
  }

  /**
   * Extract first image URL from HTML content
   */
  private extractFirstImage(html: string): string | undefined {
    if (!html) return undefined;

    const $ = cheerio.load(html);
    const firstImg = $('img').first();
    
    return firstImg.attr('src');
  }

  /**
   * Validate feed URL
   */
  async validateFeedUrl(url: string): Promise<boolean> {
    try {
      await this.parser.parseURL(url);
      return true;
    } catch (error) {
      this.logger.warn(`Invalid RSS feed URL: ${url}`);
      return false;
    }
  }
}
```

---

## 6.2. RSS Scheduler Service

**File:** `src/modules/rss-sources/rss-scheduler.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RssSourcesService } from './rss-sources.service';
import { RssParserService } from './rss-parser.service';
import { NewsService } from '../news/news.service';
import { RssSource } from './entities/rss-source.entity';
import { NewsStatusEnum } from '../news/enums/news-status.enum';
import stringSimilarity from 'string-similarity';

@Injectable()
export class RssSchedulerService {
  private readonly logger = new Logger(RssSchedulerService.name);
  private isProcessing = false;

  constructor(
    private readonly rssSourcesService: RssSourcesService,
    private readonly rssParserService: RssParserService,
    private readonly newsService: NewsService,
  ) {}

  /**
   * Fetch all active sources every 15 minutes
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async fetchAllActiveSources(): Promise<void> {
    // Prevent overlapping executions
    if (this.isProcessing) {
      this.logger.warn('Previous fetch still in progress, skipping...');
      return;
    }

    this.isProcessing = true;

    try {
      this.logger.log('Starting scheduled RSS fetch...');
      
      const activeSources = await this.rssSourcesService.findActiveSources();
      
      if (activeSources.length === 0) {
        this.logger.warn('No active RSS sources found');
        return;
      }

      this.logger.log(`Fetching ${activeSources.length} active sources`);

      // Process sources sequentially to avoid rate limiting
      for (const source of activeSources) {
        await this.fetchSource(source);
        
        // Small delay between sources (respectful crawling)
        await this.delay(2000); // 2 seconds
      }

      this.logger.log('Scheduled RSS fetch completed');
    } catch (error) {
      this.logger.error('Error in scheduled RSS fetch', error.stack);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Fetch and process a single RSS source
   */
  async fetchSource(source: RssSource): Promise<void> {
    try {
      this.logger.log(`Fetching source: ${source.name}`);

      // Parse RSS feed
      const items = await this.rssParserService.parseFeed(
        source.url,
        source.feedType as any,
      );

      if (items.length === 0) {
        this.logger.warn(`No items found for source: ${source.name}`);
        return;
      }

      // Process each item
      let newArticlesCount = 0;
      let duplicatesCount = 0;

      for (const item of items) {
        const isDuplicate = await this.checkDuplicate(item.link, item.title);
        
        if (isDuplicate) {
          duplicatesCount++;
          continue;
        }

        // Create news article
        await this.newsService.create({
          sourceId: source.id,
          title: item.title,
          url: item.link,
          guid: item.guid,
          summary: item.description,
          content: item.content,
          contentPlain: item.contentPlain,
          publishedAt: item.pubDate,
          scrapedAt: new Date(),
          imageUrl: item.imageUrl,
          status: NewsStatusEnum.PENDING,
          isDuplicate: false,
        });

        newArticlesCount++;
      }

      // Update last fetch time
      await this.rssSourcesService.updateLastFetchTime(source.id);

      this.logger.log(
        `Source ${source.name}: ${newArticlesCount} new, ${duplicatesCount} duplicates`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to fetch source ${source.name}: ${error.message}`,
        error.stack,
      );
      await this.handleFetchError(source.id, error);
    }
  }

  /**
   * Check if article is duplicate
   */
  private async checkDuplicate(url: string, title: string): Promise<boolean> {
    // 1. Check by exact URL
    const existingByUrl = await this.newsService.findByUrl(url);
    if (existingByUrl) {
      return true;
    }

    // 2. Check by title similarity (last 24 hours)
    const recentArticles = await this.newsService.findRecentArticles(24);
    
    for (const article of recentArticles) {
      const similarity = stringSimilarity.compareTwoStrings(
        title.toLowerCase(),
        article.title.toLowerCase(),
      );

      // If similarity > 85%, consider duplicate
      if (similarity > 0.85) {
        this.logger.debug(`Duplicate found: "${title}" similar to "${article.title}"`);
        return true;
      }
    }

    return false;
  }

  /**
   * Handle fetch error
   */
  private async handleFetchError(sourceId: number, error: Error): Promise<void> {
    // TODO: Implement error tracking
    // - Log error to database
    // - Disable source after N consecutive failures
    // - Send notification to admin
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## 6.3. Update News Service

**Add to:** `src/modules/news/news.service.ts`

```typescript
/**
 * Find article by URL
 */
async findByUrl(url: string): Promise<NewsArticle | null> {
  return await this.newsArticleRepository.findOne({
    where: { url },
  });
}

/**
 * Find recent articles (for duplicate detection)
 */
async findRecentArticles(hours: number): Promise<NewsArticle[]> {
  const date = new Date();
  date.setHours(date.getHours() - hours);

  return await this.newsArticleRepository.find({
    where: {
      scrapedAt: MoreThan(date),
    },
    order: { scrapedAt: 'DESC' },
  });
}
```

**Don't forget to import:**
```typescript
import { MoreThan } from 'typeorm';
```

---

## 6.4. Update RSS Sources Module

**File:** `src/modules/rss-sources/rss-sources.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RssSourceSchema } from './schemas/rss-source.schema';
import { SourceReliabilityScoreSchema } from './schemas/source-reliability-score.schema';
import { RssSourcesController } from './rss-sources.controller';
import { RssSourcesService } from './rss-sources.service';
import { RssParserService } from './rss-parser.service';
import { RssSchedulerService } from './rss-scheduler.service';
import { NewsModule } from '../news/news.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RssSourceSchema, SourceReliabilityScoreSchema]),
    ScheduleModule.forRoot(), // Enable scheduling
    NewsModule, // Import NewsModule for NewsService
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

## 6.5. Testing RSS Parser

### Manual Test:

```bash
# 1. Start application
npm run start:dev

# 2. Add RSS source via Swagger or cURL
curl -X POST http://localhost:3000/api/v1/rss-sources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Borsa Gündem - Şirket Haberleri",
    "url": "https://www.borsagundem.com.tr/rss/sirket-haberleri",
    "feedType": "RSS2",
    "category": "COMPANY_NEWS",
    "country": "TR",
    "fetchInterval": 15,
    "isActive": true
  }'

# 3. Wait for scheduler (runs every 10 minutes)
# Or manually trigger fetch in code

# 4. Check news articles
curl http://localhost:3000/api/v1/news

# 5. Check logs
# Look for: "Fetching source:", "new articles", "duplicates"
```

---

# PHASE 7: AI/NLP Integration

## 📦 Required Dependencies

```bash
# OpenAI API (recommended)
npm install openai

# OR Hugging Face (open source alternative)
npm install @huggingface/inference

# Text processing
npm install natural
npm install @types/natural --save-dev
```

---

## 7.1. OpenAI Service

**File:** `src/common/services/openai.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface SentimentResult {
  score: number; // -1 to 1
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0 to 1
}

export interface ExtractedEntity {
  entityType: string;
  entityText: string;
  normalizedValue?: string;
  confidence: number;
  position: number;
}

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly client: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not found, AI features will be disabled');
      return;
    }

    this.client = new OpenAI({ apiKey });
  }

  /**
   * Analyze sentiment of Turkish financial news
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    try {
      const prompt = `
Analiz et: Türkçe finansal haber sentiment analizi.
JSON formatında dön: { "score": -1 ile 1 arası, "sentiment": "positive/negative/neutral", "confidence": 0-1 arası }

Haber: ${text.substring(0, 2000)}
`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini', // Faster and cheaper
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 200,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        score: result.score || 0,
        sentiment: result.sentiment || 'neutral',
        confidence: result.confidence || 0.5,
      };
    } catch (error) {
      this.logger.error('Sentiment analysis failed', error.stack);
      return { score: 0, sentiment: 'neutral', confidence: 0 };
    }
  }

  /**
   * Extract named entities (NER)
   */
  async extractEntities(text: string): Promise<ExtractedEntity[]> {
    try {
      const prompt = `
Türkçe finansal haberden varlıkları çıkar.
JSON array dön: [{ "entityType": "PERSON/ORGANIZATION/LOCATION/MONEY/PERCENT/DATE", "entityText": "...", "normalizedValue": "...", "confidence": 0-1, "position": 0 }]

Haber: ${text.substring(0, 2000)}
`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 1000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"entities":[]}');
      
      return result.entities || [];
    } catch (error) {
      this.logger.error('Entity extraction failed', error.stack);
      return [];
    }
  }

  /**
   * Categorize news article
   */
  async categorizeNews(text: string): Promise<string> {
    try {
      const prompt = `
Türkçe finansal haberi kategorize et.
Sadece kategori adını dön: COMPANY_NEWS, MACRO_ECONOMY, SECTOR_NEWS, INTERNATIONAL, POLICY, FINANCIAL_MARKETS

Haber: ${text.substring(0, 1500)}
`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 50,
      });

      return response.choices[0].message.content?.trim() || 'MACRO_ECONOMY';
    } catch (error) {
      this.logger.error('Categorization failed', error.stack);
      return 'MACRO_ECONOMY';
    }
  }

  /**
   * Extract stock symbols from text
   */
  async extractStockSymbols(text: string): Promise<string[]> {
    // Regex for Turkish stock symbols (3-6 uppercase letters)
    const regex = /\b[A-Z]{3,6}\b/g;
    const matches = text.match(regex) || [];
    
    // Filter out common false positives
    const stopwords = ['CEO', 'TL', 'USD', 'EUR', 'ABD', 'NATO', 'OECD', 'IMF'];
    
    return [...new Set(matches)].filter(symbol => !stopwords.includes(symbol));
  }
}
```

---

## 7.2. NLP Analysis Service

**File:** `src/modules/news/nlp-analysis.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../../common/services/openai.service';
import { NewsArticle } from './entities/news-article.entity';
import { ImpactLevelEnum } from './enums/impact-level.enum';

@Injectable()
export class NlpAnalysisService {
  private readonly logger = new Logger(NlpAnalysisService.name);

  constructor(private readonly openaiService: OpenAIService) {}

  /**
   * Calculate impact level based on content analysis
   */
  async calculateImpactLevel(article: NewsArticle): Promise<ImpactLevelEnum> {
    const text = article.contentPlain || article.summary || '';

    // Keywords that indicate high impact
    const highImpactKeywords = [
      'milyar', 'trilyonlar', 'kriz', 'iflas', 'şok',
      'rekor', 'tarihinin en', 'kritik', 'acil',
    ];

    // Keywords that indicate medium impact
    const mediumImpactKeywords = [
      'milyon', 'anlaşma', 'sözleşme', 'yatırım',
      'satış', 'birleşme', 'ortaklık',
    ];

    const lowerText = text.toLowerCase();

    // Check for high impact
    if (highImpactKeywords.some(keyword => lowerText.includes(keyword))) {
      return ImpactLevelEnum.HIGH;
    }

    // Check for medium impact
    if (mediumImpactKeywords.some(keyword => lowerText.includes(keyword))) {
      return ImpactLevelEnum.MEDIUM;
    }

    // Default to low
    return ImpactLevelEnum.LOW;
  }

  /**
   * Extract keywords using simple frequency analysis
   */
  async extractKeywords(text: string, limit: number = 10): Promise<string[]> {
    // Remove common Turkish stopwords
    const stopwords = new Set([
      'bir', 'bu', 've', 'ile', 'için', 'olan', 'ancak',
      'gibi', 'daha', 'çok', 'sonra', 'kadar', 'şu', 'o',
    ]);

    // Tokenize and count
    const words = text
      .toLowerCase()
      .match(/\b[a-zçğıöşü]{3,}\b/g) || [];

    const frequency: Record<string, number> = {};

    words.forEach(word => {
      if (!stopwords.has(word)) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    // Sort by frequency
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word);
  }
}
```

---

## 7.3. Article Processor Service

**File:** `src/modules/news/article-processor.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsService } from './news.service';
import { NewsTagsService } from './news-tags.service';
import { StockMentionsService } from './stock-mentions.service';
import { ExtractedItemsService } from './extracted-items.service';
import { OpenAIService } from '../../common/services/openai.service';
import { NlpAnalysisService } from './nlp-analysis.service';
import { NewsStatusEnum } from './enums/news-status.enum';
import { TagTypeEnum } from './enums/tag-type.enum';
import { SentimentEnum } from './enums/sentiment.enum';

@Injectable()
export class ArticleProcessorService {
  private readonly logger = new Logger(ArticleProcessorService.name);
  private isProcessing = false;

  constructor(
    private readonly newsService: NewsService,
    private readonly newsTagsService: NewsTagsService,
    private readonly stockMentionsService: StockMentionsService,
    private readonly extractedItemsService: ExtractedItemsService,
    private readonly openaiService: OpenAIService,
    private readonly nlpAnalysisService: NlpAnalysisService,
  ) {}

  /**
   * Process pending articles every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async processPendingArticles(): Promise<void> {
    if (this.isProcessing) {
      this.logger.warn('Previous processing still running, skipping...');
      return;
    }

    this.isProcessing = true;

    try {
      const pendingArticles = await this.newsService.findByStatus(
        NewsStatusEnum.PENDING,
      );

      if (pendingArticles.length === 0) {
        return;
      }

      this.logger.log(`Processing ${pendingArticles.length} pending articles`);

      for (const article of pendingArticles) {
        await this.processArticle(article);
        
        // Small delay between articles (API rate limits)
        await this.delay(1000);
      }

      this.logger.log('Article processing completed');
    } catch (error) {
      this.logger.error('Error in article processing', error.stack);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process single article with AI/NLP
   */
  async processArticle(article: any): Promise<void> {
    try {
      this.logger.log(`Processing article: ${article.id}`);

      const text = article.contentPlain || article.summary || '';

      if (!text) {
        this.logger.warn(`No text content for article ${article.id}`);
        return;
      }

      // 1. Sentiment Analysis
      const sentimentResult = await this.openaiService.analyzeSentiment(text);
      await this.newsService.update(article.id, {
        sentimentScore: sentimentResult.score,
      });

      // 2. Categorization
      const category = await this.openaiService.categorizeNews(text);
      await this.newsService.update(article.id, {
        mainCategory: category,
      });

      // 3. Impact Level
      const impactLevel = await this.nlpAnalysisService.calculateImpactLevel(article);
      await this.newsService.update(article.id, {
        impactLevel: impactLevel,
      });

      // 4. Extract Stock Symbols
      const stockSymbols = await this.openaiService.extractStockSymbols(
        article.title + ' ' + text,
      );

      for (const symbol of stockSymbols) {
        await this.stockMentionsService.create({
          articleId: article.id,
          stockSymbol: symbol,
          stockName: symbol,
          mentionCount: 1,
          sentiment: this.scoreToSentiment(sentimentResult.score),
        });
      }

      // 5. Extract Entities (NER)
      const entities = await this.openaiService.extractEntities(text);
      
      if (entities.length > 0) {
        await this.extractedItemsService.createBulk(
          entities.map(entity => ({
            articleId: article.id,
            entityType: entity.entityType,
            entityText: entity.entityText,
            normalizedValue: entity.normalizedValue,
            position: entity.position,
            confidence: entity.confidence,
          })),
        );
      }

      // 6. Extract Keywords as Tags
      const keywords = await this.nlpAnalysisService.extractKeywords(text, 5);
      
      for (const keyword of keywords) {
        const tag = await this.newsTagsService.findOrCreate(
          keyword,
          TagTypeEnum.KEYWORD,
        );
        await this.newsTagsService.attachTagsToArticle(article.id, [tag.id]);
      }

      // 7. Mark as processed
      await this.newsService.update(article.id, {
        status: NewsStatusEnum.PROCESSED,
      });

      this.logger.log(`Article ${article.id} processed successfully`);
    } catch (error) {
      this.logger.error(`Failed to process article ${article.id}`, error.stack);
      
      // Mark as failed (you might want to add FAILED status to enum)
      // await this.newsService.update(article.id, { status: NewsStatusEnum.FAILED });
    }
  }

  /**
   * Convert sentiment score to enum
   */
  private scoreToSentiment(score: number): SentimentEnum {
    if (score > 0.3) return SentimentEnum.POSITIVE;
    if (score < -0.3) return SentimentEnum.NEGATIVE;
    return SentimentEnum.NEUTRAL;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## 7.4. Update News Module

**File:** `src/modules/news/news.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsArticleSchema } from './schemas/news-article.schema';
import { NewsTagSchema } from './schemas/news-tag.schema';
import { NewsArticleTagSchema } from './schemas/news-article-tag.schema';
import { StockMentionSchema } from './schemas/stock-mention.schema';
import { ExtractedItemSchema } from './schemas/extracted-item.schema';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsTagsService } from './news-tags.service';
import { StockMentionsService } from './stock-mentions.service';
import { ExtractedItemsService } from './extracted-items.service';
import { ArticleProcessorService } from './article-processor.service';
import { NlpAnalysisService } from './nlp-analysis.service';
import { OpenAIService } from '../../common/services/openai.service';

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
    ArticleProcessorService,
    NlpAnalysisService,
    OpenAIService,
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

---

## 7.5. Environment Variables

**Add to `.env`:**

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
```

---

# PHASE 8: Testing & Verification

## 8.1. End-to-End Test Flow

```bash
# 1. Start application
npm run start:dev

# 2. Add RSS source
curl -X POST http://localhost:3000/api/v1/rss-sources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Source",
    "url": "https://www.borsagundem.com.tr/rss/sirket-haberleri",
    "feedType": "RSS2",
    "category": "COMPANY_NEWS",
    "country": "TR",
    "fetchInterval": 15,
    "isActive": true
  }'

# 3. Wait for RSS scheduler (10 minutes) or manually trigger

# 4. Check pending articles
curl http://localhost:3000/api/v1/news/status/PENDING

# 5. Wait for article processor (5 minutes) or manually trigger

# 6. Check processed articles
curl http://localhost:3000/api/v1/news/status/PROCESSED

# 7. Check article details with all relations
curl http://localhost:3000/api/v1/news/1
curl http://localhost:3000/api/v1/news/1/tags
curl http://localhost:3000/api/v1/news/1/stocks
curl http://localhost:3000/api/v1/news/1/entities
```

---

## 8.2. Monitor Application Logs

```bash
# Watch logs in real-time
npm run start:dev

# Look for:
# - "Fetching source:" (RSS Scheduler)
# - "new articles" (RSS Parser)
# - "Processing article:" (Article Processor)
# - "processed successfully" (NLP completion)
```

---

## 8.3. Verify Dashboard

```bash
# Start dashboard
cd ../dashweb
npm start

# Open browser
# http://localhost:4200

# Check:
# - Dashboard shows statistics
# - News list shows articles
# - Sources list shows RSS feeds
# - Stock tracker shows mentions
# - Reliability shows predictions
```

---

# PHASE 9: Production Optimization

## 9.1. Caching Implementation

```bash
npm install @nestjs/cache-manager cache-manager
```

**File:** `src/app.module.ts`

```typescript
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    // ... other imports
    CacheModule.register({
      ttl: 300, // 5 minutes default
      max: 100, // max items in cache
      isGlobal: true,
    }),
  ],
})
```

**Use in controllers:**

```typescript
import { CacheInterceptor, UseInterceptors } from '@nestjs/common';

@UseInterceptors(CacheInterceptor)
@Get('active')
async getActiveSources() {
  return await this.rssSourcesService.findActiveSources();
}
```

---

## 9.2. Rate Limiting

```bash
npm install @nestjs/throttler
```

**File:** `src/app.module.ts`

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    // ... other imports
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),
  ],
})
```

**Apply globally in `main.ts`:**

```typescript
import { ThrottlerGuard } from '@nestjs/throttler';

app.useGlobalGuards(new ThrottlerGuard());
```

---

## 9.3. Logging

```bash
npm install winston
npm install nest-winston
```

**File:** `src/common/logger/winston.config.ts`

```typescript
import * as winston from 'winston';

export const winstonConfig = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
};
```

---

## 9.4. Health Checks

```bash
npm install @nestjs/terminus
```

**File:** `src/health/health.controller.ts`

```typescript
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
```

---

# PHASE 10: Deployment

## 10.1. Docker Setup

**File:** `Dockerfile`

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
```

---

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
      - DB_DATABASE=insdb
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: insdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## 10.2. Production Environment

**File:** `.env.production`

```env
NODE_ENV=production
PORT=3000

# Database
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USERNAME=prod_user
DB_PASSWORD=secure_password
DB_DATABASE=insdb_prod

# OpenAI
OPENAI_API_KEY=sk-production-key
OPENAI_MODEL=gpt-4o-mini

# Logging
LOG_LEVEL=info
```

---

## 10.3. Deployment Commands

```bash
# Build Docker image
docker build -t stock-insight-api .

# Run with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f api

# Run migrations
docker-compose exec api npm run migration:run

# Stop services
docker-compose down
```

---

# Success Checklist

## ✅ Phase 6: RSS Parser
- [ ] rss-parser installed
- [ ] RssParserService implemented
- [ ] RssSchedulerService implemented
- [ ] Duplicate detection working
- [ ] Articles being fetched automatically
- [ ] Last fetch time updating

## ✅ Phase 7: AI/NLP
- [ ] OpenAI API key configured
- [ ] OpenAIService implemented
- [ ] Sentiment analysis working
- [ ] Entity extraction working
- [ ] Stock symbol detection working
- [ ] Articles being processed automatically
- [ ] Tags being created
- [ ] Processed articles visible in dashboard

## ✅ Phase 8: Testing
- [ ] End-to-end flow verified
- [ ] Dashboard showing live data
- [ ] All API endpoints tested
- [ ] Logs show successful processing

## ✅ Phase 9: Optimization
- [ ] Caching implemented
- [ ] Rate limiting active
- [ ] Logging configured
- [ ] Health checks working

## ✅ Phase 10: Deployment
- [ ] Docker image built
- [ ] docker-compose working
- [ ] Production environment configured
- [ ] Application deployed
- [ ] Monitoring active

---

# Estimated Timeline

| Phase | Estimated Time |
|-------|---------------|
| Phase 6: RSS Parser | 4-6 hours |
| Phase 7: AI/NLP Integration | 8-12 hours |
| Phase 8: Testing | 2-4 hours |
| Phase 9: Production Optimization | 4-6 hours |
| Phase 10: Deployment | 2-3 hours |
| **TOTAL** | **20-31 hours** |

---

# Next Immediate Steps

1. **Install dependencies:**
   ```bash
   npm install rss-parser @nestjs/schedule cheerio string-similarity openai
   npm install -D @types/rss-parser @types/cheerio @types/string-similarity
   ```

2. **Create OpenAIService:**
   ```bash
   # Create common services directory if not exists
   mkdir -p src/common/services
   # Copy OpenAIService code from above
   ```

3. **Create RSS Parser Services:**
   ```bash
   # In rss-sources module
   # Copy RssParserService and RssSchedulerService
   ```

4. **Add OPENAI_API_KEY to .env:**
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```

5. **Test RSS fetch manually first:**
   ```bash
   npm run start:dev
   # Add source via Swagger
   # Check logs for "Fetching source:"
   ```

6. **Enable schedulers and monitor:**
   ```bash
   # Schedulers will run automatically
   # RSS: every 10 minutes
   # NLP: every 5 minutes
   ```

---

**Last Updated:** 2025-01-26  
**Status:** Ready for Phase 6+ implementation  
**Prerequisites:** Database ready, Phases 1-5 complete ✅


