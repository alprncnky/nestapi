# Migration Kurulum ve Kullanım Kılavuzu

## 🚀 Hızlı Başlangıç

### 1. Gerekli Paketler Zaten Kurulu ✅
```bash
# Kontrol et
npm list typeorm pg @nestjs/typeorm
```

Çıktı:
```
typeorm@0.3.27
pg@8.16.3
@nestjs/typeorm@11.0.0
```

### 2. Ortam Değişkenlerini Ayarla

`.env` dosyasını oluştur veya güncelle:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_NAME=insightapi
DB_SSL_MODE=false

# Application
NODE_ENV=development
PORT=3000
```

### 3. PostgreSQL Veritabanı Oluştur

```bash
# PostgreSQL'e bağlan
psql -U postgres

# Veritabanı oluştur
CREATE DATABASE insightapi;

# Çıkış
\q
```

Veya tek komutla:
```bash
createdb -U postgres insightapi
```

### 4. İlk Migration'ı Oluştur

```bash
npm run migration:generate --name=InitialSchema
```

Bu komut:
- Tüm entity'leri tarar
- Veritabanı ile karşılaştırır
- `database/migrations/` klasörüne migration dosyası oluşturur

Örnek çıktı:
```
Migration database/migrations/1735236000000-InitialSchema.ts has been generated successfully.
```

### 5. Migration'ı Çalıştır

```bash
npm run migration:run
```

Çıktı:
```
query: SELECT * FROM "migrations" "migrations"
query: CREATE TABLE "rss_sources" (...)
query: CREATE TABLE "news_articles" (...)
...
Migration InitialSchema has been executed successfully.
```

### 6. Doğrulama

```bash
# Migration durumunu kontrol et
npm run migration:show
```

Çıktı:
```
[X] InitialSchema (1735236000000)
```

PostgreSQL'de tablolarıı kontrol et:
```bash
psql -U postgres -d insightapi -c "\dt"
```

Beklenen tablolar:
```
 Schema |            Name             | Type  |  Owner
--------+-----------------------------+-------+----------
 public | rss_sources                 | table | postgres
 public | source_reliability_scores   | table | postgres
 public | news_articles               | table | postgres
 public | news_tags                   | table | postgres
 public | news_article_tags           | table | postgres
 public | stock_mentions              | table | postgres
 public | extracted_entities          | table | postgres
 public | news_reliability_tracking   | table | postgres
 public | migrations                  | table | postgres
```

## ✅ Tamamlandı!

Veritabanınız hazır. Artık uygulamayı çalıştırabilirsiniz:

```bash
npm run start:dev
```

---

## 🔄 Gelecekte Entity Değişiklikleri

### Senaryo: Yeni bir alan eklemek istiyorsunuz

**Örnek:** `news_articles` tablosuna `author` alanı eklemek

#### 1. Entity'yi Güncelle

```typescript
// src/modules/news/entities/news-article.entity.ts

@Column({ type: 'varchar', length: 100, nullable: true })
author: string;
```

#### 2. Migration Oluştur

```bash
npm run migration:generate --name=AddAuthorToNewsArticles
```

#### 3. Migration'ı İncele

```bash
cat database/migrations/*-AddAuthorToNewsArticles.ts
```

Örnek içerik:
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "news_articles" 
        ADD "author" character varying(100)
    `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "news_articles" 
        DROP COLUMN "author"
    `);
}
```

#### 4. Migration'ı Uygula

```bash
npm run migration:run
```

#### 5. Doğrula

```bash
psql -U postgres -d insightapi -c "\d news_articles"
```

`author` alanının eklendiğini göreceksiniz.

---

## ⚠️ Troubleshooting

### Problem 1: "Cannot find module 'dotenv'"

**Çözüm:**
```bash
npm install dotenv --save
```

### Problem 2: "ECONNREFUSED localhost:5432"

**Çözüm:**
```bash
# PostgreSQL'in çalıştığını kontrol et
sudo service postgresql status

# Veya Mac'te
brew services list | grep postgresql

# Başlat
sudo service postgresql start
# veya Mac'te
brew services start postgresql
```

### Problem 3: "Database does not exist"

**Çözüm:**
```bash
createdb -U postgres insightapi
```

### Problem 4: "Migration failed"

**Çözüm:**
```bash
# Migration'ı geri al
npm run migration:revert

# Sorunu düzelt ve tekrar dene
npm run migration:run
```

### Problem 5: "permission denied"

**Çözüm:**
```bash
# PostgreSQL kullanıcısına yetki ver
psql -U postgres
GRANT ALL PRIVILEGES ON DATABASE insightapi TO postgres;
\q
```

---

## 🧪 Test Ortamı İçin

Eğer ayrı bir test veritabanı kullanmak istiyorsanız:

### 1. Test Veritabanı Oluştur

```bash
createdb -U postgres insightapi_test
```

### 2. `.env.test` Dosyası Oluştur

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=insightapi_test
DB_SSL_MODE=false
```

### 3. Test Migration Script Ekle

`package.json`'a:
```json
{
  "scripts": {
    "migration:run:test": "NODE_ENV=test npm run typeorm -- -d src/config/typeorm-migration.config.ts migration:run"
  }
}
```

### 4. Test Migration'larını Çalıştır

```bash
npm run migration:run:test
```

---

## 📊 Migration Dosyası Anatomisi

Oluşturulan migration dosyaları şu yapıya sahip:

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1735236000000 implements MigrationInterface {
    name = 'InitialSchema1735236000000'

    // İleri yönde çalışır (migration:run)
    public async up(queryRunner: QueryRunner): Promise<void> {
        // CREATE TABLE komutları
        // ALTER TABLE komutları
        // CREATE INDEX komutları
    }

    // Geri yönde çalışır (migration:revert)
    public async down(queryRunner: QueryRunner): Promise<void> {
        // DROP TABLE komutları (ters sırada)
        // DROP INDEX komutları
    }
}
```

### Önemli Notlar:

1. **up()**: Migration uygulandığında çalışır
2. **down()**: Migration geri alındığında çalışır
3. **name**: Unique migration ismi (timestamp + isim)
4. **QueryRunner**: SQL komutlarını çalıştırır

---

## 🔐 Production Deployment

### Hazırlık:

1. **Migration'ları Test Et**
   ```bash
   # Staging ortamında
   NODE_ENV=staging npm run migration:run
   ```

2. **Backup Al**
   ```bash
   pg_dump -U postgres insightapi > backup_$(date +%Y%m%d).sql
   ```

3. **Production'da Çalıştır**
   ```bash
   NODE_ENV=production npm run migration:run
   ```

4. **Rollback Planı Hazırla**
   ```bash
   # Geri alma gerekirse
   NODE_ENV=production npm run migration:revert
   ```

### Production Checklist:

- [ ] Database backup alındı
- [ ] Staging'de test edildi
- [ ] Rollback planı hazır
- [ ] Downtime için maintenance mode aktif
- [ ] Takım bilgilendirildi
- [ ] Migration'lar gözden geçirildi

---

## 📚 Ek Kaynaklar

- [TypeORM Migrations](https://typeorm.io/migrations)
- [NestJS Database](https://docs.nestjs.com/techniques/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Project Database README](./database/README.md)
- [Entity Summary](./database-entities-summary.md)

---

## 💡 İpuçları

1. **Her Değişiklik İçin Yeni Migration**: Birden fazla değişikliği tek migration'da birleştirmeyin

2. **Açıklayıcı İsimler**: `migration1`, `fix` gibi isimler yerine `AddEmailToUsers` gibi isimler kullanın

3. **down() Metodunu Test Edin**: Her migration'ın rollback'inin çalıştığından emin olun

4. **Veri Migration'larında Dikkatli Olun**: Büyük veri migration'larında batch processing kullanın

5. **Production'da Önce Backup**: Her zaman önce backup alın

---

**Son Güncelleme**: 26 Ekim 2025  
**Versiyon**: 1.0  
**Durum**: ✅ Kullanıma Hazır

