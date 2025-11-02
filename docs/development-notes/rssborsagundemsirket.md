# Borsa Gündem Şirket Haberleri RSS Feed Dökümantasyonu

## 📋 Genel Bilgiler

**RSS Feed URL:** `https://www.borsagundem.com.tr/rss/sirket-haberleri`

**Kaynak:** Borsa Gündem TR  
**Kategori:** Şirket Haberleri  
**Feed Tipi:** RSS 2.0  
**Dil:** Türkçe (tr-TR)  
**Haber Sayısı:** ~20 adet (her güncelleme)  
**Güncelleme Sıklığı:** Gerçek zamanlı (yeni haber eklendiğinde)

---

## 🔍 Feed Yapısı

### Feed Metadata

```typescript
{
  title: "Borsa Gundem TR",
  description: "Borsa Gundem: %100 Borsa, güncel borsa haberleri, hisse senedi analizleri, Bitcoin, kripto paralar ve ekonomi gündemiyle yatırımcılar için en doğru adres",
  link: "https://www.borsagundem.com.tr",
  language: "tr-TR",
  copyright: "Borsa Gundem - Copyright © 2025. Her hakkı saklıdır.",
  lastBuildDate: "Sun, 02 Nov 2025 20:55:08 +0300",
  items: [] // Haber dizisi
}
```

### Feed Item (Haber) Yapısı

Her bir haber item'ı aşağıdaki alanları içerir:

```typescript
interface RssFeedItem {
  // Temel Alanlar
  title: string;                    // Haber başlığı
  link: string;                     // Haber URL'i (benzersiz)
  guid: string;                     // Benzersiz identifier (link ile aynı)
  pubDate: string;                  // RFC 2822 format: "Sat, 01 Nov 2025 16:12:00 +0300"
  isoDate: string;                  // ISO 8601 format: "2025-11-01T13:12:00.000Z"
  
  // İçerik Alanları
  description: string;              // Kısa açıklama/özet
  content: string;                  // Kısa içerik
  contentEncoded: string;           // Tam HTML içerik (en detaylı)
  contentSnippet: string;           // Düz metin snippet
  
  // Kategorilendirme
  categories: string[];             // Örn: ["Şirket Haberleri"], ["Borsa, Şirket Haberleri"]
  
  // Medya
  enclosure: {
    url: string;                    // Görsel URL'i
    type: string;                   // "image/jpeg"
    length: string;                 // Dosya boyutu (byte)
  };
}
```

### Gerçek Örnek Item

```json
{
  "title": "Geçtiğimiz haftanın öne çıkan KAP bildirimleri!",
  "link": "https://www.borsagundem.com.tr/gectigimiz-haftanin-one-cikan-kap-bildirimleri-1",
  "pubDate": "Sat, 01 Nov 2025 16:12:00 +0300",
  "isoDate": "2025-11-01T13:12:00.000Z",
  "guid": "https://www.borsagundem.com.tr/gectigimiz-haftanin-one-cikan-kap-bildirimleri-1",
  "categories": ["Şirket Haberleri"],
  "description": "İşte, 27-31 Ekim haftasında şirketlerin öne çıkan KAP bildirimleri...",
  "contentEncoded": "<p><strong>1. Türkiye İhracat Kredi Bankası A.Ş. – Yurt Dışı Borçlanma Aracı İhraç Tavanı Başvurusu (27 Ekim 2025)</strong><br />...</p>",
  "enclosure": {
    "url": "https://borsagundemcomtr.teimg.com/crop/1280x720/borsagundem-com-tr/uploads/2025/07/kap-kamuyu-aydinlatma-platformu.png",
    "type": "image/jpeg",
    "length": "15138"
  }
}
```

---

## 🔧 Parse İşlemi

### 1. Kullanılan Kütüphane

**rss-parser** (v3.13.0)  
- Hafif ve hızlı RSS/Atom feed parser
- Custom field desteği
- TypeScript uyumlu
- Promise-based asenkron yapı

### 2. Kurulum

```bash
npm install rss-parser
npm install --save-dev @types/rss-parser
```

### 3. Temel Kullanım

```typescript
import Parser from 'rss-parser';

// Parser oluştur
const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
});

// Feed'i fetch ve parse et
async function fetchRssFeed() {
  try {
    const feed = await parser.parseURL('https://www.borsagundem.com.tr/rss/sirket-haberleri');
    
    console.log('Feed Title:', feed.title);
    console.log('Total Items:', feed.items.length);
    
    // Her bir haberi işle
    for (const item of feed.items) {
      console.log('Title:', item.title);
      console.log('Link:', item.link);
      console.log('Date:', item.isoDate);
      console.log('Content:', item.contentEncoded);
    }
    
    return feed;
  } catch (error) {
    console.error('RSS fetch error:', error);
    throw error;
  }
}
```

### 4. NestJS Service Örneği

```typescript
import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';

@Injectable()
export class RssFetchService {
  private readonly logger = new Logger(RssFetchService.name);
  private readonly parser: Parser;
  
  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ['content:encoded', 'contentEncoded'],
          ['media:content', 'mediaContent'],
        ],
      },
    });
  }
  
  async fetchBorsaGundemNews(): Promise<Parser.Item[]> {
    const feedUrl = 'https://www.borsagundem.com.tr/rss/sirket-haberleri';
    
    try {
      this.logger.log(`Fetching RSS feed from: ${feedUrl}`);
      const feed = await this.parser.parseURL(feedUrl);
      
      this.logger.log(`Successfully fetched ${feed.items.length} items`);
      return feed.items;
    } catch (error) {
      this.logger.error(`Failed to fetch RSS feed: ${error.message}`);
      throw error;
    }
  }
}
```

---

## 🗄️ Veritabanı Modeli

### Entity Tanımı

```typescript
import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';

@AutoEntity()
export class News {
  id: number;
  
  // RSS Feed Bilgileri
  title: string;                    // Haber başlığı
  link: string;                     // Benzersiz URL (UNIQUE constraint)
  guid: string;                     // RSS GUID (UNIQUE constraint)
  publishedDate: Date;              // Yayın tarihi
  
  // İçerik
  description: string;              // Kısa açıklama
  content: string;                  // Tam HTML içerik
  contentSnippet: string;           // Düz metin içerik
  
  // Kategorilendirme ve Etiketleme
  categories: string;               // JSON array olarak saklanır: '["Şirket Haberleri"]'
  tags: string;                     // AI ile çıkarılan etiketler (JSON)
  
  // Medya
  imageUrl: string;                 // Haber görseli URL'i
  
  // Kaynak Bilgisi
  rssSourceId: number;              // Foreign Key -> rss_sources.id
  
  // Analiz ve İşleme
  isProcessed: boolean;             // AI analizi yapıldı mı?
  stockMentions: string;            // Bahsedilen hisse senetleri (JSON array)
  sentiment: string;                // Sentiment analizi: 'POSITIVE', 'NEGATIVE', 'NEUTRAL'
  impactLevel: number;              // Etki seviyesi (0-100)
  
  // Timestamp
  fetchedAt: Date;                  // RSS'den çekilme zamanı
  processedAt: Date;                // AI analizi zamanı
  createdAt: Date;
  updatedAt: Date;
}
```

### TypeORM Schema

```typescript
import { EntitySchema } from 'typeorm';
import { News } from '../entities/news.entity';
import { EntitySchemaColumnOptions } from '../../../../common/decorators/entity-schema.decorator';

export const NewsSchema = new EntitySchema<News>({
  name: 'News',
  tableName: 'news',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    } as EntitySchemaColumnOptions,
    
    title: {
      type: String,
      length: 500,
      nullable: false,
    } as EntitySchemaColumnOptions,
    
    link: {
      type: String,
      length: 1000,
      nullable: false,
      unique: true, // Deduplication için
    } as EntitySchemaColumnOptions,
    
    guid: {
      type: String,
      length: 1000,
      nullable: false,
      unique: true, // Deduplication için
    } as EntitySchemaColumnOptions,
    
    publishedDate: {
      type: 'timestamp',
      nullable: false,
    } as EntitySchemaColumnOptions,
    
    description: {
      type: 'text',
      nullable: true,
    } as EntitySchemaColumnOptions,
    
    content: {
      type: 'text',
      nullable: true,
    } as EntitySchemaColumnOptions,
    
    contentSnippet: {
      type: 'text',
      nullable: true,
    } as EntitySchemaColumnOptions,
    
    categories: {
      type: 'json',
      nullable: true,
    } as EntitySchemaColumnOptions,
    
    tags: {
      type: 'json',
      nullable: true,
    } as EntitySchemaColumnOptions,
    
    imageUrl: {
      type: String,
      length: 1000,
      nullable: true,
    } as EntitySchemaColumnOptions,
    
    rssSourceId: {
      type: Number,
      nullable: false,
    } as EntitySchemaColumnOptions,
    
    isProcessed: {
      type: Boolean,
      default: false,
    } as EntitySchemaColumnOptions,
    
    stockMentions: {
      type: 'json',
      nullable: true,
    } as EntitySchemaColumnOptions,
    
    sentiment: {
      type: String,
      length: 20,
      nullable: true,
    } as EntitySchemaColumnOptions,
    
    impactLevel: {
      type: Number,
      nullable: true,
    } as EntitySchemaColumnOptions,
    
    fetchedAt: {
      type: 'timestamp',
      nullable: false,
    } as EntitySchemaColumnOptions,
    
    processedAt: {
      type: 'timestamp',
      nullable: true,
    } as EntitySchemaColumnOptions,
    
    createdAt: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    } as EntitySchemaColumnOptions,
    
    updatedAt: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      onUpdate: 'CURRENT_TIMESTAMP',
    } as EntitySchemaColumnOptions,
  },
  relations: {
    rssSource: {
      type: 'many-to-one',
      target: 'RssSource',
      joinColumn: { name: 'rss_source_id' },
      nullable: false,
    },
  },
  indices: [
    {
      name: 'idx_news_published_date',
      columns: ['publishedDate'],
    },
    {
      name: 'idx_news_rss_source_id',
      columns: ['rssSourceId'],
    },
    {
      name: 'idx_news_is_processed',
      columns: ['isProcessed'],
    },
    {
      name: 'idx_news_fetched_at',
      columns: ['fetchedAt'],
    },
  ],
});
```

---

## 🔄 RSS Fetch ve Kaydetme Servisi

### Service Implementation

```typescript
import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';
import { NewsRepository } from '../../data/repositories/news.repository';
import { RssSourceRepository } from '../../../rss-sources/data/repositories/rss-source.repository';
import { News } from '../../data/entities/news.entity';

@Injectable()
export class NewsFetchService {
  private readonly logger = new Logger(NewsFetchService.name);
  private readonly parser: Parser;
  
  constructor(
    private readonly newsRepository: NewsRepository,
    private readonly rssSourceRepository: RssSourceRepository,
  ) {
    this.parser = new Parser({
      customFields: {
        item: [
          ['content:encoded', 'contentEncoded'],
          ['media:content', 'mediaContent'],
        ],
      },
    });
  }
  
  async fetchAndSaveBorsaGundemNews(): Promise<{ saved: number; skipped: number }> {
    const feedUrl = 'https://www.borsagundem.com.tr/rss/sirket-haberleri';
    
    try {
      // RSS kaynağını bul
      const rssSource = await this.rssSourceRepository.findByUrl(feedUrl);
      if (!rssSource) {
        throw new Error(`RSS source not found for URL: ${feedUrl}`);
      }
      
      // Feed'i fetch et
      this.logger.log(`Fetching RSS feed from: ${feedUrl}`);
      const feed = await this.parser.parseURL(feedUrl);
      
      let savedCount = 0;
      let skippedCount = 0;
      
      // Her bir haberi işle
      for (const item of feed.items) {
        try {
          // Deduplication check (guid veya link ile)
          const existingNews = await this.newsRepository.findByGuid(item.guid);
          if (existingNews) {
            this.logger.debug(`News already exists, skipping: ${item.guid}`);
            skippedCount++;
            continue;
          }
          
          // Yeni haber oluştur
          const news = new News();
          news.title = item.title || '';
          news.link = item.link || '';
          news.guid = item.guid || '';
          news.publishedDate = item.isoDate ? new Date(item.isoDate) : new Date();
          news.description = item.description || item.contentSnippet || '';
          news.content = (item as any).contentEncoded || item.content || '';
          news.contentSnippet = item.contentSnippet || '';
          news.categories = JSON.stringify(item.categories || []);
          news.imageUrl = (item as any).enclosure?.url || null;
          news.rssSourceId = rssSource.id;
          news.isProcessed = false;
          news.fetchedAt = new Date();
          news.createdAt = new Date();
          news.updatedAt = new Date();
          
          // Veritabanına kaydet
          await this.newsRepository.save(news);
          savedCount++;
          this.logger.debug(`Saved news: ${news.title}`);
          
        } catch (error) {
          this.logger.error(`Failed to save news item: ${error.message}`, error.stack);
          skippedCount++;
        }
      }
      
      this.logger.log(`Fetch completed. Saved: ${savedCount}, Skipped: ${skippedCount}`);
      
      // RSS kaynağının lastFetchedAt'ini güncelle
      await this.rssSourceRepository.update(rssSource.id, {
        lastFetchedAt: new Date(),
      });
      
      return { saved: savedCount, skipped: skippedCount };
      
    } catch (error) {
      this.logger.error(`Failed to fetch RSS feed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

---

## ⏰ Scheduled Task (Otomatik Fetch)

### Schedule Service

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsFetchService } from '../services/news-fetch.service';

@Injectable()
export class NewsFetchSchedule {
  private readonly logger = new Logger(NewsFetchSchedule.name);
  
  constructor(private readonly newsFetchService: NewsFetchService) {}
  
  // Her 30 dakikada bir çalışır
  @Cron(CronExpression.EVERY_30_MINUTES)
  async fetchBorsaGundemNews() {
    this.logger.log('Starting scheduled Borsa Gündem news fetch...');
    
    try {
      const result = await this.newsFetchService.fetchAndSaveBorsaGundemNews();
      this.logger.log(`Scheduled fetch completed. Saved: ${result.saved}, Skipped: ${result.skipped}`);
    } catch (error) {
      this.logger.error(`Scheduled fetch failed: ${error.message}`, error.stack);
    }
  }
  
  // Her saat başı çalışır
  @Cron(CronExpression.EVERY_HOUR)
  async fetchBorsaGundemNewsHourly() {
    this.logger.log('Starting hourly Borsa Gündem news fetch...');
    
    try {
      const result = await this.newsFetchService.fetchAndSaveBorsaGundemNews();
      this.logger.log(`Hourly fetch completed. Saved: ${result.saved}, Skipped: ${result.skipped}`);
    } catch (error) {
      this.logger.error(`Hourly fetch failed: ${error.message}`, error.stack);
    }
  }
}
```

---

## 🔑 Önemli Noktalar

### 1. Deduplication (Tekrar Önleme)

**GUID ve Link kontrolü yapılmalı:**
```typescript
// Option 1: GUID ile kontrol
const existingNews = await this.newsRepository.findByGuid(item.guid);

// Option 2: Link ile kontrol
const existingNews = await this.newsRepository.findByLink(item.link);

// Option 3: Her ikisiyle kontrol (en güvenli)
const existingNews = await this.newsRepository.findByGuidOrLink(item.guid, item.link);
```

**Veritabanında UNIQUE constraint:**
```sql
CREATE UNIQUE INDEX idx_news_guid ON news(guid);
CREATE UNIQUE INDEX idx_news_link ON news(link);
```

### 2. HTML Content Parse

HTML içeriğini temizlemek için **cheerio** kullanılabilir:

```typescript
import * as cheerio from 'cheerio';

function extractPlainText(html: string): string {
  const $ = cheerio.load(html);
  return $.text().trim();
}

// Kullanım
const plainText = extractPlainText(item.contentEncoded);
```

### 3. Kategori Parse

Kategoriler genelde array olarak gelir:

```typescript
// RSS'den gelen: ["Şirket Haberleri"] veya ["Borsa, Şirket Haberleri"]
const categories = item.categories || [];

// Veritabanına JSON olarak kaydet
news.categories = JSON.stringify(categories);

// Veritabanından okurken:
const categoriesArray = JSON.parse(news.categories);
```

### 4. Tarih Parse

RSS feed'lerde farklı tarih formatları olabilir:

```typescript
// isoDate kullan (en güvenli)
const publishedDate = item.isoDate ? new Date(item.isoDate) : new Date();

// Alternatif: pubDate parse
const publishedDate = item.pubDate ? new Date(item.pubDate) : new Date();
```

### 5. Hata Yönetimi

```typescript
try {
  const feed = await parser.parseURL(feedUrl);
  // Process items...
} catch (error) {
  if (error.code === 'ENOTFOUND') {
    // DNS çözümlenemedi
    logger.error('Feed URL not found');
  } else if (error.code === 'ETIMEDOUT') {
    // Timeout
    logger.error('Feed fetch timeout');
  } else {
    // Diğer hatalar
    logger.error('Feed fetch error:', error);
  }
  
  // Retry stratejisi eklenebilir
  // throw error; veya return empty result
}
```

### 6. Performance Optimizasyonu

**Batch Insert kullan:**
```typescript
// Her bir item için ayrı INSERT yerine batch insert
const newsItems = feed.items
  .filter(item => !existingGuids.includes(item.guid))
  .map(item => this.mapRssItemToEntity(item, rssSourceId));

// Toplu kaydetme
await this.newsRepository.saveBatch(newsItems);
```

**Veritabanı İndeksleri:**
```sql
-- Sık kullanılan sorgular için indeksler
CREATE INDEX idx_news_published_date ON news(published_date);
CREATE INDEX idx_news_rss_source_id ON news(rss_source_id);
CREATE INDEX idx_news_is_processed ON news(is_processed);
CREATE INDEX idx_news_fetched_at ON news(fetched_at);

-- Composite index
CREATE INDEX idx_news_source_date ON news(rss_source_id, published_date DESC);
```

---

## 🧪 Test Script

Test scripti `test-rss-parser.ts` dosyasında bulunur:

```bash
# RSS feed'i test et
npx ts-node test-rss-parser.ts
```

**Örnek Output:**
```
🔍 Fetching RSS feed from: https://www.borsagundem.com.tr/rss/sirket-haberleri
✅ Feed fetched successfully!

📰 FEED INFORMATION
═══════════════════════════════════════════════════════════
Title: Borsa Gundem TR
Total Items: 20

📄 SAMPLE ITEMS (First 3)
[1] Geçtiğimiz haftanın öne çıkan KAP bildirimleri!
[2] Tüpraş'ın Kârı Artarken Satışlar Geriledi
[3] İş Girişim'in sermaye artırımı Borsa İstanbul endekslerine yansıdı
```

---

## 📚 Ek Kaynaklar

- **rss-parser Documentation:** https://github.com/rbren/rss-parser
- **RSS 2.0 Specification:** https://www.rssboard.org/rss-specification
- **NestJS Scheduling:** https://docs.nestjs.com/techniques/task-scheduling
- **TypeORM Relations:** https://typeorm.io/relations

---

## 🔄 Güncellemeler

| Tarih | Versiyon | Değişiklik |
|-------|----------|-----------|
| 02.11.2025 | 1.0 | İlk dokümantasyon oluşturuldu |

---

## 📞 İletişim

Sorular veya öneriler için:
- GitHub Issues: [insightapi/issues](https://github.com/your-repo/insightapi/issues)
- Email: dev@example.com

