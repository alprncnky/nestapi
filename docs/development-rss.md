# RSS Feed Analizi ve Veritabanı Tasarımı

## 📊 Kontrol Edilen RSS Feedleri

1. **Borsa Gündem - Şirket Haberleri**: https://www.borsagundem.com.tr/rss/sirket-haberleri
2. **Borsa Gündem - Ekonomi**: https://www.borsagundem.com.tr/rss/ekonomi
3. **NTV Ekonomi**: https://www.ntv.com.tr/ekonomi.rss
4. **Milliyet Ekonomi**: https://www.milliyet.com.tr/rss/rssnew/ekonomi.xml

---

## 🔍 RSS Feed Yapı Analizi

### Ortak Veri Alanları (Tüm Feedlerde)
- **title**: Haber başlığı
- **link/url**: Haberin tam URL'si
- **description**: Haber özeti/açıklaması
- **pubDate/published**: Yayın tarihi (RFC 822 formatı)
- **category**: Kategori bilgisi
- **guid/id**: Benzersiz tanımlayıcı

### Ek Alanlar (Feed'e Özgü)
- **content:encoded**: Haberin tam HTML içeriği (Borsa Gündem, Milliyet)
- **enclosure**: Görsel/medya dosyası bilgileri (URL, type, length)
- **author**: Yazar bilgisi (NTV)
- **updated**: Son güncellenme tarihi (NTV - Atom format)

### Feed Format Farklılıkları
- **Borsa Gündem**: RSS 2.0 + Content modülü + Atom uzantıları
- **NTV**: Atom Feed formatı
- **Milliyet**: RSS 2.0 + Content modülü

---

## 📋 İçerik Analizi

### 1. Haber Tipleri ve Kategoriler

#### A. Borsa Gündem - Şirket Haberleri
**Tespit Edilen Alt Kategoriler:**
- Kurumsal Gelişmeler (sözleşme, anlaşma)
- Finansal Raporlama (sermaye artırımı, genel kurul)
- Proje Duyuruları
- Şirket Operasyonları

**Örnekler:**
- "Hareket Proje, Abu Dabi'de yeni petrol ve doğalgaz projesi sözleşmesi imzaladı"
- "Orçay'ın bedelli sermaye artırımına SPK onayı"
- "Galatasaray ile Puma arasındaki sponsorluk sözleşmesi 2036'ya kadar uzatıldı"

**Veri Kalitesi:** ⭐⭐⭐⭐⭐
- Yapılandırılmış içerik
- Şirket kodları (HRKET, GSRAY, IHLAS, ORCAY)
- Sayısal veriler (sözleşme bedelleri, tutarlar)
- Tarih bilgileri net

#### B. Borsa Gündem - Ekonomi
**Tespit Edilen Alt Kategoriler:**
- Makro Ekonomi Gelişmeleri
- Politika ve Teşvikler
- Sektörel Haberler
- Uluslararası İlişkiler

**Örnekler:**
- "Türkiye, nitelikli insan kaynağıyla küresel bir AR-GE üssüne dönüşüyor"
- "ABD ve Çin, ön çerçeve anlaşmasına vardı"
- "Üreticilere 27 milyar lira hasar ödemesi yapıldı"

**Veri Kalitesi:** ⭐⭐⭐⭐
- İstatistiksel veriler mevcut
- Bakan/yetkili açıklamaları
- Makro ekonomik göstergeler

#### C. NTV Ekonomi
**Tespit Edilen Alt Kategoriler:**
- Politika ve Yönetmelik Haberleri
- Kurumsal Atamalar
- Ekonomik Göstergeler
- Tüketici Haberleri

**Örnekler:**
- "Bakan Ömer Bolat'dan reeskont kredi açıklaması"
- "Türk Telekom Genel Müdürlüğü'ne Ebubekir Şahin atandı"
- "ABD'de enflasyon beklentinin altında gerçekleşti"

**Veri Kalitesi:** ⭐⭐⭐⭐
- Resmi açıklamalar
- Sayısal göstergeler
- Görsel içerik zengin

#### D. Milliyet Ekonomi
**Tespit Edilen Alt Kategoriler:**
- Savunma Sanayi ve Teknoloji
- Küresel Ekonomi
- Finansal Piyasalar
- Sosyal Güvenlik

**Örnekler:**
- "Milli füze TAYFUN'dan tam isabet!"
- "ABD ile Çin'den ticaret görüşmeleriyle ilgili yeni gelişme"
- "Küresel piyasalarda gözler merkez bankalarında"

**Veri Kalitesi:** ⭐⭐⭐⭐
- Detaylı içerik
- Çoklu görseller
- Gömülü içerik

---

## 🗂️ Önerilen Kategorilendirme Sistemi

### 1. Ana Kategoriler (Level 1)
```
1. ŞİRKET HABERLERİ
2. MAKRO EKONOMİ
3. SEKTÖREL HABERLER
4. ULUSLARARASI
5. POLİTİKA VE MEVZUAT
6. FİNANSAL PİYASALAR
```

### 2. Alt Kategoriler (Level 2)

#### ŞİRKET HABERLERİ:
- Kurumsal Gelişmeler
- Finansal Sonuçlar
- Sermaye ve Ortaklık Yapısı
- Projeler ve Yatırımlar
- Genel Kurul/Toplantılar

#### MAKRO EKONOMİ:
- Enflasyon
- Büyüme
- İstihdam
- Dış Ticaret
- Üretim

#### SEKTÖREL HABERLER:
- Sanayi
- Tarım
- Teknoloji
- Enerji
- İnşaat
- Turizm

#### ULUSLARARASI:
- Ticaret Anlaşmaları
- Dış İlişkiler
- Global Piyasalar

#### POLİTİKA VE MEVZUAT:
- Teşvikler
- Yönetmelikler
- Atamalar

#### FİNANSAL PİYASALAR:
- Borsa
- Döviz
- Faiz
- Emtia

### 3. Otomatik Etiketleme (Tags)

**Şirket Kodları** (RegEx ile yakalama):
- Pattern: `\b[A-Z]{3,6}\b` (GSRAY, HRKET, IHLAS, etc.)

**Para Birimleri:**
- TL, USD, EUR, DOLAR, LİRA

**Sayısal Değerler:**
- Tutarlar: "X milyon", "X milyar"
- Yüzde değerleri: "%X"
- Artış/Azalış: "yükseldi", "düştü", "arttı", "geriledi"

**Coğrafi Bölgeler:**
- Ülke isimleri (Türkiye, ABD, Çin, AB, vs.)
- Şehirler (İstanbul, Ankara, vs.)

**Kurumlar:**
- TCMB, SPK, SGK, Fed, ECB, IMF

**Sentiment (Duygu Analizi):**
- Pozitif: "yükseldi", "arttı", "kazandı", "başarı"
- Negatif: "düştü", "geriledi", "kaybetti", "risk"
- Nötr: "açıkladı", "bildirdi", "duyurdu"

---

## 🗄️ Veritabanı Tablo Yapısı

### 1. `rss_sources` (RSS Kaynakları)
```typescript
{
  id: number (PK)
  name: string              // "Borsa Gündem - Şirket"
  url: string              // RSS feed URL'si
  feedType: string         // "RSS2", "ATOM"
  category: string         // "Company News", "Economy"
  country: string          // "TR", "GLOBAL"
  reliability_score: number // 0-100 arası güvenilirlik puanı
  is_active: boolean
  fetch_interval: number   // dakika cinsinden (örn: 15, 30, 60)
  last_fetched_at: Date
  createdAt: Date
  updatedAt: Date
}
```

### 2. `news_articles` (Haber Makaleleri)
```typescript
{
  id: number (PK)
  source_id: number (FK -> rss_sources)
  
  // Temel Bilgiler
  title: string
  url: string (unique)
  guid: string (unique)     // Feed'den gelen unique ID
  
  // İçerik
  summary: string          // Kısa özet
  content: text           // Tam içerik (HTML)
  content_plain: text    // Plain text içerik (NLP için)
  
  // Zaman
  published_at: Date      // Kaynaktan gelen tarih
  scraped_at: Date       // Sistemimize alındığı tarih
  
  // Görsel
  image_url: string
  image_type: string
  
  // Kategorizasyon (Manuel veya AI)
  main_category: string
  sub_category: string
  
  // Analiz Sonuçları
  sentiment_score: number  // -1 (negatif) ile +1 (pozitif) arası
  relevance_score: number  // Borsa ile ilişki 0-100
  impact_level: string     // LOW, MEDIUM, HIGH, CRITICAL
  
  // Durum
  status: string          // PENDING, PROCESSED, ARCHIVED
  is_duplicate: boolean
  
  createdAt: Date
  updatedAt: Date
}
```

### 3. `news_tags` (Haber Etiketleri)
```typescript
{
  id: number (PK)
  name: string (unique)
  tag_type: string         // COMPANY, SECTOR, KEYWORD, LOCATION, INSTITUTION
  description: string
  createdAt: Date
  updatedAt: Date
}
```

### 4. `news_article_tags` (Çoka Çok İlişki)
```typescript
{
  id: number (PK)
  article_id: number (FK -> news_articles)
  tag_id: number (FK -> news_tags)
  confidence: number       // 0-1 arası, etiketin doğruluğuna güven
  detection_method: string // AUTO, MANUAL, AI
  createdAt: Date
}
```

### 5. `stock_mentions` (Hisse Senedi Bahisleri)
```typescript
{
  id: number (PK)
  article_id: number (FK -> news_articles)
  stock_symbol: string     // GSRAY, HRKET, etc.
  stock_name: string       // "Galatasaray Sportif"
  mention_count: number    // Haberde kaç kez geçiyor
  context: text           // Bahsedildiği cümle/paragraf
  sentiment: string       // POSITIVE, NEGATIVE, NEUTRAL
  createdAt: Date
}
```

### 6. `extracted_items` (Çıkarılan Varlıklar - NER için)
```typescript
{
  id: number (PK)
  article_id: number (FK -> news_articles)
  entity_type: string      // PERSON, ORGANIZATION, LOCATION, MONEY, PERCENT, DATE
  entity_text: string      // "23 milyar lira", "Mehmet Fatih Kacır"
  normalized_value: string // Normalize edilmiş değer (örn: 23000000000)
  position: number         // Metindeki konum
  confidence: number       // 0-1 arası
  createdAt: Date
}
```

### 7. `news_reliability_tracking` (Haber Güvenilirlik Takibi)
```typescript
{
  id: number (PK)
  article_id: number (FK -> news_articles)
  stock_symbol: string
  
  // Tahmin
  predicted_impact: string      // UP, DOWN, NEUTRAL
  predicted_change_percent: number
  prediction_confidence: number
  
  // Gerçekleşen
  actual_change_percent: number
  actual_impact: string
  
  // Değerlendirme
  prediction_accuracy: number   // 0-100
  evaluation_date: Date
  time_window: string          // "1H", "4H", "1D", "1W"
  
  createdAt: Date
  updatedAt: Date
}
```

### 8. `source_reliability_scores` (Kaynak Güvenilirlik Skorları)
```typescript
{
  id: number (PK)
  source_id: number (FK -> rss_sources)
  evaluation_period: string    // "2025-10", "2025-Q4"
  
  // Metrikler
  total_predictions: number
  correct_predictions: number
  accuracy_rate: number        // 0-100
  average_confidence: number
  
  // Kategoriye göre başarı
  company_news_accuracy: number
  macro_news_accuracy: number
  
  calculated_at: Date
  createdAt: Date
}
```

---

## 🤖 AI/ML İşleme Pipeline'ı

### Adım 1: Veri Toplama
```
RSS Feedleri → Parse → `news_articles` tablosuna kaydet (status: PENDING)
```

### Adım 2: Ön İşleme
```
- HTML temizleme
- Plain text çıkarma
- Dil tespiti (Türkçe doğrulaması)
- Duplicate kontrolü (URL, title similarity)
```

### Adım 3: NLP Analizi
```
A. Named Entity Recognition (NER):
   - Şirket isimleri → stock_mentions
   - Para birimleri ve tutarlar → extracted_items
   - Kişi isimleri, kurumlar → extracted_items
   - Tarih ve zaman → extracted_items

B. Sentiment Analysis:
   - Genel sentiment (pozitif/negatif/nötr)
   - Şirket bazlı sentiment (stock_mentions.sentiment)

C. Keyword Extraction:
   - TF-IDF ile önemli kelimeler
   - news_tags ile eşleştirme
```

### Adım 4: Kategorilendirme
```
- Rule-based classification (keyword matching)
- ML-based classification (eğitilmiş model)
- main_category ve sub_category ataması
```

### Adım 5: Borsa İlişkilendirme
```
- Hisse kodu tespiti (regex: \b[A-Z]{3,6}\b)
- Şirket ismi eşleştirme
- stock_mentions tablosuna kayıt
```

### Adım 6: Etki Analizi
```
- Haberin potansiyel etkisi (impact_level)
- İlgili hisselere skorlama
- Relevance score hesaplama
```

### Adım 7: Duplication & Clustering
```
- Aynı olayı anlatan farklı kaynaklardan haberleri grupla
- En detaylı/güvenilir olanı "master" olarak işaretle
```

---

## 📊 Örnek Veri Akışı

### Senaryo: "Galatasaray-Puma Sponsorluk Haberi"

**1. Raw RSS Data**
```xml
<item>
  <title>Galatasaray ile Puma arasındaki sponsorluk sözleşmesi 2036'ya kadar uzatıldı</title>
  <link>https://www.borsagundem.com.tr/galatasaray-puma-sozlesmesi</link>
  <category>Şirket Haberleri</category>
  <pubDate>Fri, 24 Oct 2025 11:51:00 +0300</pubDate>
</item>
```

**2. Processed Data → `news_articles`**
```json
{
  "title": "Galatasaray ile Puma arasındaki sponsorluk...",
  "source_id": 1,
  "main_category": "ŞİRKET HABERLERİ",
  "sub_category": "Kurumsal Gelişmeler",
  "sentiment_score": 0.85,
  "impact_level": "HIGH",
  "relevance_score": 95
}
```

**3. Extracted Entities**
```json
[
  { "entity_type": "ORGANIZATION", "entity_text": "Galatasaray", "confidence": 0.99 },
  { "entity_type": "ORGANIZATION", "entity_text": "Puma", "confidence": 0.99 },
  { "entity_type": "MONEY", "entity_text": "83 milyon euro", "normalized_value": "83000000" },
  { "entity_type": "DATE", "entity_text": "2035-2036", "confidence": 0.95 }
]
```

**4. Stock Mentions**
```json
{
  "stock_symbol": "GSRAY",
  "stock_name": "Galatasaray Sportif",
  "mention_count": 3,
  "sentiment": "POSITIVE"
}
```

**5. Tags**
```json
["GSRAY", "Sponsorluk", "Puma", "Futbol", "Spor Sektörü"]
```

---

## 🎯 Güvenilirlik Skorlama Sistemi

### Kaynak Bazlı Skorlama
```
1. Geçmiş Performans (40%):
   - Doğru tahminlerin oranı
   - Haberlerin gerçekleşme oranı

2. Güncellik (20%):
   - Ne kadar hızlı haber veriliyor
   - İlk kaynak olma oranı

3. Detay Seviyesi (20%):
   - Sayısal veri içeriği
   - Kaynak belirtme
   - Doğrulanabilir bilgi

4. Tutarlılık (20%):
   - Çelişkili haberler vermeme
   - Düzeltme oranı
```

### Haber Bazlı Skorlama
```
1. Kaynak Güvenilirliği (30%)
2. Doğrulanabilirlik (30%):
   - Resmi kaynak var mı?
   - KAP duyurusu var mı?
   - Çoklu kaynak doğrulaması
3. Detay ve Veri (20%)
4. Zaman Uyumu (20%):
   - Piyasa saatleriyle uyum
   - Güncel olma durumu
```

---

## 🔄 Veri Güncelleme Stratejisi

### Fetch Intervals (Çekme Sıklığı)
```
- ŞİRKET HABERLERİ: 15 dakika
- MAKRO EKONOMİ: 30 dakika
- SEKTÖREL: 60 dakika
- GENEL: 120 dakika
```

### Piyasa Saatlerine Göre Ayarlama
```
Borsa Açık (09:00-18:00):
  → Yüksek frekansta çekme (5-15 dakika)

Borsa Kapalı:
  → Düşük frekansta çekme (60-120 dakika)

Hafta Sonu:
  → Minimal çekme (4-6 saat)
```

### Duplicate Detection
```
1. URL bazlı (exact match)
2. Title similarity (Levenshtein distance > 0.85)
3. Content similarity (TF-IDF cosine similarity > 0.90)
4. Time window: 24 saat içindeki haberler karşılaştırılır
```

---

## 📈 Dashboard & Raporlama

### Real-time Monitoring
- Son 1 saatteki haber sayısı
- Kategori dağılımı
- Sentiment dağılımı
- En çok bahsedilen hisseler
- Critical impact haberler

### Analitik Raporlar
- Kaynak performans analizi
- Haber güvenilirlik skorları
- Tahmin başarı oranları
- Hisse bazlı haber etkileri

---

## 🚀 Geliştirme Roadmap

### Faz 1: Temel Altyapı (1-2 Hafta)
- [x] RSS feed analizi
- [ ] Database schema oluşturma
- [ ] RSS parser modülü (NestJS)
- [ ] CRUD API endpoints
- [ ] Basic categorization

### Faz 2: NLP Entegrasyonu (2-3 Hafta)
- [ ] NER implementation (spaCy veya OpenAI API)
- [ ] Sentiment analysis
- [ ] Keyword extraction
- [ ] Stock symbol detection

### Faz 3: AI/ML Pipeline (3-4 Hafta)
- [ ] Auto-categorization model
- [ ] Impact scoring algorithm
- [ ] Reliability tracking system
- [ ] Prediction module

### Faz 4: Borsa Entegrasyonu (2-3 Hafta)
- [ ] Borsa API integration
- [ ] Real-time price tracking
- [ ] News-price correlation
- [ ] Backtesting module

### Faz 5: Dashboard & Raporlama (2 Hafta)
- [ ] Admin dashboard
- [ ] Analytics reports
- [ ] Alert system
- [ ] API for frontend

---

## 🔧 Teknoloji Stack Önerileri

### Backend (Mevcut)
- **Framework**: NestJS ✅
- **Database**: PostgreSQL (JSON fields için uygun)
- **ORM**: TypeORM ✅

### Yeni Eklemeler
- **RSS Parsing**: `rss-parser` (npm package)
- **HTML Parsing**: `cheerio` veya `jsdom`
- **Scheduler**: `@nestjs/schedule` (cron jobs için)
- **NLP/AI**:
  - OpenAI API (GPT-4 for advanced NER, sentiment)
  - veya Hugging Face models (açık kaynak)
  - `natural` (JS NLP library)
- **Similarity**: `string-similarity`, `tf-idf`
- **Queue System**: BullMQ (yoğun işlemler için)

---

## 📝 Notlar ve Öneriler

1. **Dil Desteği**: Şu an sadece Türkçe kaynaklar. İngilizce kaynaklar eklenirse multi-language NLP gerekir.

2. **Rate Limiting**: RSS feedleri çok sık çekilirse IP ban riski. Respectful crawling önemli.

3. **Storage**: Tam HTML içerik saklanacaksa storage maliyeti artabilir. S3 gibi object storage düşünülebilir.

4. **Legal**: Web scraping ve içerik kullanımı için kaynaklarla anlaşma/izin gerekebilir.

5. **Duplicate Content**: Aynı haber farklı kaynaklarda çıkabilir. Clustering algoritması önemli.

6. **Real-time vs Batch**: Critical haberler için real-time processing, diğerleri için batch processing dengesi kurulmalı.

7. **Caching**: Sık erişilen veriler (son 24 saat haberleri) Redis'te cache'lenebilir.

8. **API Rate Limits**: OpenAI/external API kullanımında maliyet ve rate limit yönetimi kritik.

---

## ✅ Sonraki Adımlar

1. **Database Schema'yı oluştur** (TypeORM entities)
2. **RSS Parser Service** yaz
3. **Scheduled Tasks** kur (cron ile periyodik çekme)
4. **Temel CRUD endpoints** hazırla
5. **Admin panel** için basit bir view oluştur
6. **Test data** ile kategorilendirme algoritmalarını test et

---

**Doküman Tarihi**: 26 Ekim 2025  
**Versiyon**: 1.0  
**Hazırlayan**: AI Development Assistant  
**Durum**: İnceleme Bekliyor ✅

