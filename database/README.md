# Database Migrations Guide

Bu proje TypeORM migration kullanarak veritabanı schema değişikliklerini yönetir.

## 🔧 Kurulum ve Yapılandırma

### 1. Ortam Değişkenleri

`.env` dosyasında aşağıdaki değişkenleri ayarlayın:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=insightapi
DB_SSL_MODE=false
```

### 2. PostgreSQL Veritabanı Oluşturma

```bash
# PostgreSQL'e bağlan
psql -U postgres

# Veritabanını oluştur
CREATE DATABASE insightapi;

# Bağlantıyı test et
\c insightapi
```

## 📋 Migration Komutları

### Yeni Migration Oluşturma (Otomatik)

Entity'lerinizde yaptığınız değişikliklere göre otomatik migration oluşturur:

```bash
npm run migration:generate --name=InitialSchema
```

Örnek:
```bash
npm run migration:generate --name=CreateRssSourcesTable
npm run migration:generate --name=AddReliabilityScoreToArticles
```

### Yeni Migration Oluşturma (Manuel)

Boş bir migration dosyası oluşturur, içini kendiniz doldurabilirsiniz:

```bash
npm run migration:create --name=CustomChanges
```

### Migration'ları Çalıştırma

Bekleyen tüm migration'ları çalıştırır:

```bash
npm run migration:run
```

### Migration'ı Geri Alma

Son çalıştırılan migration'ı geri alır:

```bash
npm run migration:revert
```

### Migration Durumunu Görüntüleme

Hangi migration'ların çalıştırıldığını gösterir:

```bash
npm run migration:show
```

## 🚀 İlk Kurulum Adımları

### 1. Tüm Entity'leri Oluştur

Tüm entity'ler zaten oluşturuldu:
- `rss-sources`: RSS kaynak yönetimi
- `news`: Haber yönetimi (articles, tags, mentions, entities)
- `news-reliability`: Güvenilirlik takibi

### 2. İlk Migration'ı Oluştur

```bash
# Entity'lerden migration oluştur
npm run migration:generate --name=InitialSchema
```

Bu komut şu dosyayı oluşturacak:
```
database/migrations/1234567890123-InitialSchema.ts
```

### 3. Migration'ı Çalıştır

```bash
npm run migration:run
```

### 4. Doğrulama

PostgreSQL'de tabloları kontrol edin:

```bash
psql -U postgres -d insightapi

# Tabloları listele
\dt

# Tablo yapısını görüntüle
\d rss_sources
\d news_articles
```

## 📂 Oluşturulan Tablolar

### RSS Sources Modülü
- `rss_sources` - RSS feed kaynakları
- `source_reliability_scores` - Kaynak güvenilirlik skorları

### News Modülü
- `news_articles` - Haber makaleleri
- `news_tags` - Etiketler
- `news_article_tags` - Haber-etiket ilişkileri
- `stock_mentions` - Hisse senedi bahisleri
- `extracted_entities` - NER ile çıkarılan varlıklar

### News Reliability Modülü
- `news_reliability_tracking` - Haber güvenilirlik takibi

### Sistem Tablosu
- `migrations` - Migration geçmişi (TypeORM tarafından otomatik oluşturulur)

## 🔄 Geliştirme İş Akışı

### Entity Değişikliği Yaparken:

1. **Entity'yi Güncelle**
   ```typescript
   // src/modules/news/entities/news-article.entity.ts
   @Column({ type: 'varchar', length: 100, nullable: true })
   author: string; // Yeni alan
   ```

2. **Migration Oluştur**
   ```bash
   npm run migration:generate --name=AddAuthorToNewsArticles
   ```

3. **Migration'ı İncele**
   - `database/migrations/` klasöründe oluşan dosyayı kontrol edin
   - `up` ve `down` metodlarını gözden geçirin

4. **Migration'ı Uygula**
   ```bash
   npm run migration:run
   ```

5. **Test Et**
   - Uygulamayı çalıştırın ve yeni alanın çalıştığını kontrol edin

### Hata Durumunda:

```bash
# Son migration'ı geri al
npm run migration:revert

# Düzelt ve tekrar oluştur
npm run migration:generate --name=FixedMigration

# Tekrar çalıştır
npm run migration:run
```

## ⚠️ Önemli Notlar

### Production Ortamında:

1. **ASLA** `synchronize: true` kullanmayın
2. Migration'ları önce staging'de test edin
3. Production'a deploy öncesi migration'ları çalıştırın:
   ```bash
   NODE_ENV=production npm run migration:run
   ```

### Rollback Stratejisi:

- Her migration'ın `down()` metodu doğru yazılmalıdır
- Production'da rollback planınız olmalıdır
- Kritik migration'lar için backup alın

### Best Practices:

1. **Küçük Adımlar**: Her değişiklik için ayrı migration
2. **Açıklayıcı İsimler**: `AddUserEmailIndex` yerine `add_user_email_index`
3. **Test Edilebilir**: Her migration test edilmeli
4. **Veri Göçü**: Veri migration'larını dikkatli yapın
5. **Geriye Dönük Uyumluluk**: Mümkünse eski versiyonla uyumlu kalın

## 🔍 Troubleshooting

### Problem: "Cannot find module 'pg'"
```bash
npm install pg --save
```

### Problem: "Database does not exist"
```bash
createdb insightapi
```

### Problem: "Migration failed"
```bash
# Migration'ı geri al
npm run migration:revert

# Veritabanını sıfırla (DEV ONLY!)
dropdb insightapi && createdb insightapi
npm run migration:run
```

### Problem: "Duplicate table"
```bash
# Migration geçmişini kontrol et
npm run migration:show

# Gerekirse manuel düzelt
psql -U postgres -d insightapi
DROP TABLE IF EXISTS table_name;
```

## 📚 Kaynaklar

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [NestJS Database Documentation](https://docs.nestjs.com/techniques/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🎯 Sonraki Adımlar

1. İlk migration'ı oluştur: `npm run migration:generate --name=InitialSchema`
2. Migration'ı çalıştır: `npm run migration:run`
3. Seed data ekle (isteğe bağlı)
4. CI/CD pipeline'a migration komutlarını ekle

