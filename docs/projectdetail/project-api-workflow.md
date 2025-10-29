# InsightAPI - Project Workflow Documentation

## 📋 Genel Bakış

Bu doküman, InsightAPI projesindeki tüm scheduled job'ların çalışma mantığını, iş akışlarını, bağımlılıklarını ve veritabanı operasyonlarını detaylı bir şekilde açıklar.

### Sistem Mimarisi
```
RSS Sources → News Articles → Article Processing → Stock Predictions → Impact Tracking → Learning System
```

### Ana Modüller
- **RSS Sources Module**: RSS feed kaynaklarından haber çekme
- **News Module**: Haber makalelerini işleme ve analiz etme
- **Stock Prices Module**: Borsa fiyatlarını çekme
- **Stock Prediction Module**: AI destekli tahmin üretme ve öğrenme sistemi
- **News Reliability Module**: Tahmin doğruluğunu takip etme

---

## 🕐 Job Çalışma Zaman Çizelgesi

### Saatlik Çalışma Paterni

| Zaman | Job Adı | Sıklık | Süre | Bağımlılıklar |
|-------|---------|--------|------|---------------|
| `:00` | **RssFetchSchedule** | Her 30 dakika | ~2-5 dk | - |
| `:00` | **StockFetchSchedule** | Her 15 dakika | ~1-3 dk | - |
| `:00` | **NewsClusteringSchedule** | Her saat | ~3-8 dk | ArticleProcessorSchedule |
| `:05` | **ArticleProcessorSchedule** | Her saat | ~5-15 dk | RssFetchSchedule |
| `:15` | **PredictionProcessorSchedule** | Her saat | ~5-15 dk | ArticleProcessorSchedule |
| `:15` | **StockFetchSchedule** | Her 15 dakika | ~1-3 dk | - |
| `:30` | **RssFetchSchedule** | Her 30 dakika | ~2-5 dk | - |
| `:30` | **StockFetchSchedule** | Her 15 dakika | ~1-3 dk | - |
| `:35` | **ArticleProcessorSchedule** | Her saat | ~5-15 dk | RssFetchSchedule |
| `:45` | **ActualImpactTrackerSchedule** | Her saat | ~3-10 dk | PredictionProcessorSchedule, StockFetchSchedule |
| `:45` | **StockFetchSchedule** | Her 15 dakika | ~1-3 dk | - |

### Günlük Çalışma Paterni

| Zaman | Job Adı | Süre | Bağımlılıklar |
|-------|---------|------|---------------|
| `18:00` | **DailyAnalysisSchedule** | ~10-20 dk | ActualImpactTrackerSchedule |
| `18:30` | **DailyLearningReportSchedule** | ~5-15 dk | DailyAnalysisSchedule |
| `19:00` | **RetrospectiveLearningSchedule** | ~15-30 dk | DailyLearningReportSchedule |

---

## 🔄 Detaylı Job Açıklamaları

### 1. RssFetchSchedule

**Dosya**: `src/modules/rss-sources/business/orchestration/schedules/rss-fetch.schedule.ts`

**Zaman Planı**: Her 30 dakikada bir (`:00` ve `:30`)

**Amaç**: Aktif RSS kaynaklarından yeni haber makalelerini çekmek ve veritabanına kaydetmek.

**İş Akışı**:
1. Aktif RSS kaynaklarını (`isActive = true`) bulur
2. Her kaynak için RSS feed'i parse eder
3. Her makale için duplicate kontrolü yapar (URL ve title benzerliği)
4. Yeni makaleleri `news_articles` tablosuna kaydeder (status: `PENDING`)
5. Kaynakların `lastFetchedAt` zamanını günceller

**Kullandığı Servisler**:
- `RssSourceRepository`: Aktif kaynakları bulma
- `RssFetchService`: RSS feed'i parse etme ve makale kaydetme
- `RssSourcesService`: Son fetch zamanını güncelleme

**Kaydettiği/Güncellediği Tablolar**:
- ✅ **news_articles** (INSERT): Yeni makaleler eklenir
  - `sourceId`, `title`, `url`, `guid`, `summary`, `content`, `contentPlain`
  - `publishedAt`, `scrapedAt`, `imageUrl`
  - `status = 'PENDING'`
- ✅ **rss_sources** (UPDATE): `lastFetchedAt` güncellenir

**Önemli Notlar**:
- Duplicate kontrolü hem URL hem de title benzerliğine göre yapılır
- Başarısız kaynaklar için hata loglanır ancak diğer kaynakların işlenmesi devam eder
- Kaynaklar arası 2 saniye bekleme süresi vardır (rate limiting)

---

### 2. ArticleProcessorSchedule

**Dosya**: `src/modules/news/business/orchestration/schedules/article-processor.schedule.ts`

**Zaman Planı**: Her saatte `:05` ve `:35` dakikalarında

**Amaç**: PENDING durumundaki haber makalelerini AI/NLP ile işleyerek sentiment analizi, kategorizasyon, hisse senedi sembolü çıkarma ve entity extraction yapmak.

**İş Akışı**:
1. `status = 'PENDING'` olan makaleleri bulur
2. Her makale için:
   - **Sentiment Analysis**: OpenAI ile sentiment skoru hesaplanır (-1 ile +1 arası)
   - **Categorization**: Makale kategorisi belirlenir (COMPANY_NEWS, MACRO_ECONOMY, vs.)
   - **Impact Level**: Etki seviyesi hesaplanır (LOW, MEDIUM, HIGH)
   - **Stock Symbol Extraction**: Metinde geçen hisse senedi sembolleri çıkarılır
   - **Entity Extraction (NER)**: Named Entity Recognition ile varlıklar çıkarılır
   - **Tag Extraction**: Anahtar kelimeler tag olarak eklenir
3. Makale durumu `PROCESSED` olarak güncellenir

**Bağımlılıklar**:
- ✅ **RssFetchSchedule** tamamlanmalı (makaleler PENDING durumuna gelmeli)
- ✅ OpenAI API erişilebilir olmalı

**Kullandığı Servisler**:
- `NewsService`: Makaleleri bulma ve güncelleme
- `ArticleProcessorService`: AI/NLP işlemlerini koordine etme
- `OpenAIService`: OpenAI API çağrıları
- `StockMentionsService`: Hisse senedi bahislerini kaydetme
- `ExtractedItemsService`: Entity'leri kaydetme
- `NewsTagsService`: Tag'leri oluşturma ve ilişkilendirme

**Kaydettiği/Güncellediği Tablolar**:
- ✅ **news_articles** (UPDATE): 
  - `sentimentScore`, `mainCategory`, `impactLevel`, `status = 'PROCESSED'`
- ✅ **stock_mentions** (INSERT): Çıkarılan hisse senedi sembolleri
  - `articleId`, `stockSymbol`, `stockName`, `mentionCount`, `sentiment`
- ✅ **extracted_items** (INSERT): Named Entity Recognition sonuçları
  - `articleId`, `entityType`, `entityText`, `normalizedValue`, `confidence`, `position`
- ✅ **news_tags** (INSERT/UPDATE): Anahtar kelime tag'leri
  - `name`, `tagType`, `usageCount`
- ✅ **news_article_tags** (INSERT): Makale-tag ilişkileri
  - `articleId`, `tagId`, `confidence`

**Önemli Notlar**:
- OpenAI API rate limiting için makaleler arası 1 saniye bekleme vardır
- Bir makale işlenirken hata oluşursa, diğer makalelerin işlenmesi devam eder
- Makale içeriği yoksa işlem atlanır

---

### 3. StockFetchSchedule

**Dosya**: `src/modules/stock-prices/business/orchestration/schedules/stock-fetch.schedule.ts`

**Zaman Planı**: Her 15 dakikada bir (`:00`, `:15`, `:30`, `:45`)

**Amaç**: BIST100 API'sinden güncel hisse senedi fiyatlarını çekmek ve veritabanına kaydetmek.

**İş Akışı**:
1. BIST100 API'sinden hisse senedi fiyatlarını çeker
2. Her hisse için:
   - Veritabanında son kayıt kontrolü yapar
   - API'den gelen veri daha yeniyse kaydeder
   - Aynı veya daha eskiyse skip eder
3. İstatistikleri loglar (saved, skipped, errors)

**Kullandığı Servisler**:
- `StockFetchService`: BIST API çağrıları ve veri işleme
- `StockPriceRepository`: Fiyat kayıtlarını kontrol etme ve kaydetme

**Kaydettiği/Güncellediği Tablolar**:
- ✅ **stock_prices** (INSERT): Yeni fiyat kayıtları
  - `stockSymbol`, `stockName`, `open`, `close`, `high`, `low`, `last`
  - `dailyChangePrice`, `dailyChangePercent`, `volumeTurkishLira`, `volumeLot`
  - `volatility`, `exchange`, `currency`, `lastUpdate`, `fetchedAt`

**Önemli Notlar**:
- Aynı `lastUpdate` zamanına sahip kayıtlar duplicate olarak kabul edilir ve skip edilir
- Market kapalıyken bile çalışır (son fiyatları kaydeder)

---

### 4. PredictionProcessorSchedule

**Dosya**: `src/modules/stock-prediction/business/orchestration/schedules/prediction-processor.schedule.ts`

**Zaman Planı**: Her saatte `:15` dakikasında

**Amaç**: İşlenmiş haber makalelerinden AI destekli hisse senedi tahminleri üretmek.

**İş Akışı**:
1. Son 15 dakika içinde işlenmiş (`PROCESSED`) makaleleri bulur
2. Her makale için:
   - Makalede bahsedilen hisse senetlerini (`stock_mentions`) bulur
   - Her hisse için AI ile tahmin üretir:
     - Tahmin yönü (UP/DOWN/NEUTRAL)
     - Tahmin yüzdesi (-15% ile +15% arası)
     - Güven skoru (0-100)
     - Tahmin zaman penceresi (1H, 4H, 1D, 1W)
     - Tahmin gerekçesi ve faktörler
   - Öğrenme kurallarını uygular (LearningSystemService'den)
   - Tahmini `news_reliability_tracking` tablosuna kaydeder

**Bağımlılıklar**:
- ✅ **ArticleProcessorSchedule** tamamlanmalı (makaleler PROCESSED ve stock_mentions eklenmiş olmalı)
- ✅ OpenAI API erişilebilir olmalı

**Kullandığı Servisler**:
- `PredictionEngineService`: Tahmin üretme mantığı
- `NewsService`: İşlenmiş makaleleri bulma
- `NewsReliabilityService`: Tahminleri kaydetme
- `LearningSystemService`: Öğrenme kurallarını uygulama
- `OpenAIService`: AI tahminleri için

**Kaydettiği/Güncellediği Tablolar**:
- ✅ **news_reliability_tracking** (INSERT): Yeni tahminler
  - `articleId`, `stockSymbol`
  - `predictedImpact` (UP/DOWN/NEUTRAL)
  - `predictedChangePercent`
  - `predictionConfidence` (0-100)
  - `timeWindow` (1H, 4H, 1D, 1W)
  - `createdAt`

**Önemli Notlar**:
- Sadece stock mention'ı olan makaleler için tahmin üretilir
- AI başarısız olursa fallback olarak rule-based tahmin yapılır
- Öğrenme kuralları tahminleri ayarlayabilir

---

### 5. ActualImpactTrackerSchedule

**Dosya**: `src/modules/stock-prediction/business/orchestration/schedules/actual-impact-tracker.schedule.ts`

**Zaman Planı**: Her saatte `:45` dakikasında

**Amaç**: Bekleyen tahminlerin gerçek hisse senedi performansı ile karşılaştırılması ve doğruluk skorunun hesaplanması.

**İş Akışı**:
1. Bekleyen tahminleri bulur (`actualImpact` null olanlar)
2. Her tahmin için:
   - Tahmin zamanı ve zaman penceresini (`timeWindow`) alır
   - Tahmin zaman penceresi içindeki gerçek fiyat hareketlerini `stock_prices` tablosundan çeker
   - Gerçek değişim yüzdesini hesaplar
   - Gerçek etkiyi belirler (UP/DOWN/NEUTRAL)
   - Tahmin doğruluğunu hesaplar:
     - Yön doğruluğu (%50 ağırlık)
     - Büyüklük doğruluğu (%50 ağırlık)
   - `news_reliability_tracking` tablosunu günceller
   - Öğrenme sistemini günceller (LearningSystemService)

**Bağımlılıklar**:
- ✅ **PredictionProcessorSchedule** tamamlanmalı (tahminler oluşturulmuş olmalı)
- ✅ **StockFetchSchedule** çalışmış olmalı (gerçek fiyat verileri mevcut olmalı)

**Kullandığı Servisler**:
- `ActualImpactTrackerService`: Tahmin değerlendirme mantığı
- `StockPricesService`: Hisse senedi fiyatlarını bulma
- `NewsReliabilityService`: Tahmin sonuçlarını güncelleme
- `LearningSystemService`: Öğrenme sistemini güncelleme

**Kaydettiği/Güncellediği Tablolar**:
- ✅ **news_reliability_tracking** (UPDATE):
  - `actualImpact` (UP/DOWN/NEUTRAL)
  - `actualChangePercent`
  - `predictionAccuracy` (0-100)
  - `evaluationDate`
- ✅ **prediction_rules** (UPDATE): Öğrenme kuralları güncellenir
  - Kategori bazlı kurallar
  - Sentiment bazlı kurallar
  - Impact level bazlı kurallar
  - Kaynak bazlı kurallar

**Önemli Notlar**:
- Tahmin zaman penceresi dolmadan değerlendirme yapılmaz
- Yetersiz fiyat verisi varsa tahmin değerlendirmesi atlanır
- Her tahmin sonucu öğrenme sistemini iyileştirir

---

### 6. NewsClusteringSchedule

**Dosya**: `src/modules/stock-prediction/business/orchestration/schedules/news-clustering.schedule.ts`

**Zaman Planı**: Her saatte `:00` dakikasında

**Amaç**: İşlenmiş haber makalelerini içerik benzerliği, hisse senedi bahisleri ve zaman yakınlığına göre kümeler halinde gruplamak.

**İş Akışı**:
1. Son 24 saat içinde `PROCESSED` durumundaki makaleleri bulur
2. Her makale için:
   - İçerik benzerliğine göre benzer makaleleri bulur (keyword matching)
   - Aynı hisse senedini bahseden makaleleri bulur
   - Zaman yakınlığına göre (2 saat içinde) makaleleri bulur
3. Bulunan makaleleri birleştirir ve duplicate'leri temizler
4. Eğer benzer makale bulunursa:
   - Mevcut cluster varsa günceller
   - Yoksa yeni cluster oluşturur

**Bağımlılıklar**:
- ✅ **ArticleProcessorSchedule** tamamlanmalı (makaleler PROCESSED olmalı)

**Kullandığı Servisler**:
- `NewsClusteringService`: Kümelenme mantığı
- `NewsService`: İşlenmiş makaleleri bulma
- `NewsClusterRepository`: Cluster kayıtlarını yönetme

**Kaydettiği/Güncellediği Tablolar**:
- ✅ **news_clusters** (INSERT/UPDATE): Haber kümeleri
  - `clusterType` (CONTENT_SIMILARITY, STOCK_MENTION, TIME_PROXIMITY)
  - `mainArticleId` (ana makale)
  - `articleIds` (JSON array - küme içindeki makale ID'leri)
  - `clusterScore` (0-100 güven skoru)

**Önemli Notlar**:
- Kümelenme sadece PROCESSED makaleler için yapılır
- Benzerlik eşiği %70'tir
- Zaman penceresi 2 saat olarak belirlenmiştir

---

### 7. DailyAnalysisSchedule

**Dosya**: `src/modules/stock-prediction/business/orchestration/schedules/daily-analysis.schedule.ts`

**Zaman Planı**: Her gün saat `18:00`

**Amaç**: Günlük kapsamlı analiz raporu oluşturmak (haber istatistikleri, hisse performansı, tahmin doğruluğu).

**İş Akışı**:
1. Bir önceki günün verilerini toplar:
   - Haber istatistikleri (toplam, işlenen, kategoriler, sentiment dağılımı)
   - Hisse performansı (toplam, kazananlar, kaybedenler, ortalama değişim)
   - Tahmin doğruluğu (toplam, ortalama, başarılı tahminler, kategori bazlı breakdown)
   - Top movers (en çok yükselen/düşen hisseler ve ilgili haberler)
2. İçgörüler oluşturur (sentiment analizi, tahmin performansı, piyasa trendleri)
3. Öneriler üretir (kategori bazlı, performans bazlı)
4. Raporu `daily_reports` tablosuna kaydeder

**Bağımlılıklar**:
- ✅ **ActualImpactTrackerSchedule** çalışmış olmalı (tahmin değerlendirmeleri tamamlanmış olmalı)

**Kullandığı Servisler**:
- `DailyReportService`: Rapor oluşturma mantığı
- `NewsService`: Haber istatistikleri
- `StockPricesService`: Hisse performansı
- `NewsReliabilityService`: Tahmin doğruluğu

**Kaydettiği/Güncellediği Tablolar**:
- ✅ **daily_reports** (INSERT): Günlük raporlar
  - `reportDate`
  - `reportData` (JSONB - tam rapor verisi)
  - `totalArticles`, `totalPredictions`, `averageAccuracy`
  - `topGainers`, `topLosers` (JSONB)
  - `insights`, `recommendations` (JSONB)

**Önemli Notlar**:
- Her gün için sadece bir rapor oluşturulur
- Rapor bir önceki günün verilerini analiz eder
- Rapor hem JSONB hem de parse edilmiş alanlar olarak saklanır

---

### 8. DailyLearningReportSchedule

**Dosya**: `src/modules/stock-prediction/business/orchestration/schedules/daily-learning-report.schedule.ts`

**Zaman Planı**: Her gün saat `18:30`

**Amaç**: Günlük öğrenme raporu oluşturmak (en iyi performans gösteren kurallar, öneriler, içgörüler).

**İş Akışı**:
1. Bir önceki günün tahminlerini analiz eder
2. En iyi performans gösteren kuralları bulur:
   - Kategori bazlı kurallar
   - Sentiment bazlı kurallar
   - Impact level bazlı kurallar
   - Kaynak bazlı kurallar
3. Öğrenme önerileri üretir:
   - Yüksek doğruluklu kategoriler için öneriler
   - Düşük doğruluklu kategoriler için iyileştirme önerileri
4. İçgörüler oluşturur:
   - Zaman bazlı desenler (saatlik performans)
   - Kategori bazlı desenler
5. Raporu kaydeder ve loglar

**Bağımlılıklar**:
- ✅ **DailyAnalysisSchedule** tamamlanmalı (günlük veriler hazır olmalı)

**Kullandığı Servisler**:
- `LearningSystemService`: Öğrenme raporu oluşturma
- `NewsReliabilityService`: Tahmin verilerini çekme
- `PredictionRuleRepository`: Kural performanslarını analiz etme

**Kaydettiği/Güncellediği Tablolar**:
- ✅ **daily_reports** (UPDATE): Öğrenme raporu eklenir
  - `insights` ve `recommendations` alanları güncellenir
- ✅ **prediction_rules** (READ): Kural performansları analiz edilir

**Önemli Notlar**:
- Rapor DailyAnalysisSchedule'ın 30 dakika sonrasında çalışır
- Öğrenme sistemindeki tüm kurallar analiz edilir
- Yüksek başarı oranına sahip kurallar öne çıkarılır

---

### 9. RetrospectiveLearningSchedule

**Dosya**: `src/modules/stock-prediction/business/orchestration/schedules/retrospective-learning.schedule.ts`

**Zaman Planı**: Her gün saat `19:00`

**Amaç**: Önemli hisse senedi hareketlerini geriye dönük analiz ederek kaçırılan fırsatları ve desenleri tespit etmek.

**İş Akışı**:
1. Bir önceki günün önemli hisse hareketlerini bulur (>%5 değişim)
2. Her hareket için:
   - Hareketten önceki 24-48 saat içindeki haberleri bulur
   - Bu haberler için tahmin yapılıp yapılmadığını kontrol eder
   - Eğer tahmin yapılmadıysa:
     - Kaçırılan fırsat analizi yapar
     - Kaçırılma nedenlerini belirler (stock mention yok, zayıf sentiment, vs.)
   - Eğer tahmin yapıldıysa:
     - Tahmin doğruluğunu geriye dönük analiz eder
3. İlgili hisseleri bulur (aynı sektör, benzer hareketler)
4. Öğrenme sistemini geriye dönük verilerle günceller
5. İçgörüler oluşturur ve kaydeder

**Bağımlılıklar**:
- ✅ **DailyLearningReportSchedule** tamamlanmalı
- ✅ Günün tüm verileri hazır olmalı

**Kullandığı Servisler**:
- `RetrospectiveLearningService`: Geriye dönük analiz mantığı
- `StockPricesService`: Hisse hareketlerini bulma
- `NewsService`: Önceki haberleri bulma
- `NewsReliabilityService`: Tahminleri kontrol etme
- `LearningSystemService`: Öğrenme sistemini güncelleme

**Kaydettiği/Güncellediği Tablolar**:
- ✅ **retrospective_analysis** (INSERT): Geriye dönük analiz kayıtları
  - `stockSymbol`, `movementPercent`
  - `analysisDate`, `movementStartTime`, `movementEndTime`
  - `precedingNewsCount`, `existingPredictionsCount`
  - `missedOpportunity` (boolean)
  - `missedReasons` (JSON array)
  - `retrospectiveAccuracy`
  - `analysisData` (JSONB - tam analiz verisi)
- ✅ **prediction_rules** (UPDATE): Öğrenme kuralları geriye dönük verilerle güncellenir

**Önemli Notlar**:
- Sadece %5'ten fazla değişim gösteren hareketler analiz edilir
- 24-48 saatlik geriye dönük bakış penceresi kullanılır
- Kaçırılan fırsatlar öğrenme sistemini iyileştirmek için kullanılır

---

## 📊 Veri Akış Diyagramı

```
┌─────────────────┐
│ RssFetchSchedule│ :00, :30
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  news_articles  │ (status: PENDING)
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ArticleProcessor     │ :05, :35
│Schedule             │
└────────┬────────────┘
         │
         ├──► news_articles (status: PROCESSED)
         ├──► stock_mentions
         ├──► extracted_items
         └──► news_tags, news_article_tags
         │
         ▼
┌─────────────────────┐
│PredictionProcessor  │ :15
│Schedule             │
└────────┬────────────┘
         │
         ▼
┌──────────────────────────┐
│ news_reliability_tracking│ (predictedImpact, predictedChangePercent)
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ActualImpactTracker       │ :45
│Schedule                  │
└────────┬─────────────────┘
         │
         ├──► news_reliability_tracking (actualImpact, accuracy)
         └──► prediction_rules (updated with learning)
         │
         ▼
┌─────────────────────┐
│DailyAnalysis        │ 18:00
│Schedule             │
└────────┬────────────┘
         │
         ├──► daily_reports
         │
         ▼
┌─────────────────────┐
│DailyLearningReport   │ 18:30
│Schedule              │
└────────┬─────────────┘
         │
         └──► daily_reports (insights, recommendations)
         │
         ▼
┌─────────────────────┐
│RetrospectiveLearning │ 19:00
│Schedule              │
└────────┬─────────────┘
         │
         └──► retrospective_analysis
```

---

## 🔗 Tablo Bağımlılıkları

### Ana Tablolar

| Tablo Adı | Açıklama | İlişkiler |
|-----------|----------|-----------|
| **rss_sources** | RSS feed kaynakları | - |
| **news_articles** | Haber makaleleri | → rss_sources |
| **stock_mentions** | Hisse senedi bahisleri | → news_articles |
| **extracted_items** | Çıkarılan varlıklar (NER) | → news_articles |
| **news_tags** | Etiketler | - |
| **news_article_tags** | Makale-etiket ilişkileri | → news_articles, news_tags |
| **news_clusters** | Haber kümeleri | → news_articles |
| **stock_prices** | Hisse senedi fiyatları | - |
| **news_reliability_tracking** | Tahminler ve sonuçları | → news_articles |
| **prediction_rules** | Öğrenme kuralları | - |
| **daily_reports** | Günlük raporlar | - |
| **retrospective_analysis** | Geriye dönük analizler | - |

### Veri Akış Özeti

```
rss_sources (1) ──→ (N) news_articles
news_articles (1) ──→ (N) stock_mentions
news_articles (1) ──→ (N) extracted_items
news_articles (1) ──→ (N) news_article_tags ──→ (N) news_tags
news_articles (1) ──→ (N) news_reliability_tracking
news_articles (1) ──→ (N) news_clusters
news_reliability_tracking ──→ prediction_rules (indirect learning)
```

---

## ⚠️ Kritik Bağımlılıklar ve Sıralama

### 1. Zorunlu Sıralama
- **RssFetchSchedule** → **ArticleProcessorSchedule**: Makaleler önce PENDING olarak kaydedilmeli
- **ArticleProcessorSchedule** → **PredictionProcessorSchedule**: Makaleler PROCESSED ve stock mention'ları eklenmiş olmalı
- **PredictionProcessorSchedule** → **ActualImpactTrackerSchedule**: Tahminler oluşturulmuş olmalı
- **ActualImpactTrackerSchedule** → **DailyAnalysisSchedule**: Tahmin değerlendirmeleri tamamlanmış olmalı
- **DailyAnalysisSchedule** → **DailyLearningReportSchedule**: Günlük analiz tamamlanmış olmalı
- **DailyLearningReportSchedule** → **RetrospectiveLearningSchedule**: Öğrenme raporu hazır olmalı

### 2. Paralel Çalışabilen Job'lar
- **StockFetchSchedule**: Diğer job'lardan bağımsız çalışır
- **NewsClusteringSchedule**: ArticleProcessorSchedule tamamlandıktan sonra herhangi bir zamanda çalışabilir

### 3. Overlap Prevention
- Her job, `BaseSchedulerService` kullanarak overlap prevention mekanizmasına sahiptir
- Aynı job çalışırken yeni execution skip edilir

---

## 📈 Performans Metrikleri

### Beklenen Süreler
- **RssFetchSchedule**: 2-5 dakika (kaynak sayısına bağlı)
- **ArticleProcessorSchedule**: 5-15 dakika (makale sayısı ve OpenAI API response time'a bağlı)
- **StockFetchSchedule**: 1-3 dakika (BIST API response time'a bağlı)
- **PredictionProcessorSchedule**: 5-15 dakika (makale sayısına bağlı)
- **ActualImpactTrackerSchedule**: 3-10 dakika (bekleyen tahmin sayısına bağlı)
- **NewsClusteringSchedule**: 3-8 dakika (makale sayısına bağlı)
- **DailyAnalysisSchedule**: 10-20 dakika (veri hacmine bağlı)
- **DailyLearningReportSchedule**: 5-15 dakika
- **RetrospectiveLearningSchedule**: 15-30 dakika

### Kaynak Kullanımı
- **Database Connections**: Optimize edilmiş pool yönetimi
- **Memory Usage**: Job'lar cleanup yapar
- **API Rate Limits**: External API'lerin limitlerine saygı gösterilir

---

## 🔍 Monitoring ve Debugging

### Log Formatları
Her job aşağıdaki formatı kullanır:
- ✅ Başarılı: `✅ [JobName] completed in Xs`
- ❌ Hata: `❌ [JobName] failed: error message`
- ⚠️ Uyarı: `⚠️ [JobName] warning message`
- 📊 Özet: `📊 Summary: X processed, Y errors`

### Önemli Metrikler
1. **Execution Duration**: Beklenen süreyi aşan job'lar
2. **Overlap Warnings**: Aynı anda çalışan job'lar
3. **Error Rates**: Başarısız job execution'ları
4. **Data Quality**: Tahmin doğruluğu trendleri
5. **API Response Times**: External service performance

---

## 📝 Son Güncelleme

**Son Güncelleme**: 2025-01-26  
**Versiyon**: 1.0  
**Durum**: Production Ready

---

## 🔄 Değişiklik Geçmişi

- **v1.0** (2025-01-26): İlk doküman oluşturuldu
  - Tüm scheduled job'lar dokümante edildi
  - Veri akış diyagramları eklendi
  - Tablo bağımlılıkları belirlendi

