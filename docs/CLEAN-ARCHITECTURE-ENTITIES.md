# Clean Architecture: Entity Pattern

## 📐 Mimari Yaklaşım

Bu projede **Clean Architecture** prensiplerini takip ederek entity'leri **domain katmanında saf** tutuyoruz. TypeORM gibi infrastructure concern'lerini entity'lerden ayırarak daha temiz ve bakımı kolay bir yapı elde ediyoruz.

## 🎯 Amaç

1. **Saf Domain Modelleri**: Entity'ler sadece business logic ve property'leri içersin
2. **Framework Bağımsızlığı**: Entity'ler TypeORM'e bağımlı olmasın
3. **Test Edilebilirlik**: Entity'ler kolayca test edilebilsin
4. **Sürdürülebilirlik**: Infrastructure değişikliği entity'leri etkilemesin

## 🏗️ Yapı

### 1. Domain Entity (Temiz ve Sade)

**Örnek:** `src/modules/news/entities/news-article.entity.ts`

```typescript
import { AutoEntity } from '../../../common/decorators/auto-entity.decorator';
import { NewsStatusEnum } from '../enums/news-status.enum';

/**
 * News Article entity - Core news content
 * TypeORM schema is defined in ./news-article.schema.ts
 */
@AutoEntity()
export class NewsArticle {
  id: number;
  sourceId: number;
  title: string;
  url: string;
  status: NewsStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}
```

✅ **Özellikler:**
- Sadece `@AutoEntity()` decorator
- Basit property tanımlamaları
- TypeORM decorator'ları yok
- Temiz ve okunabilir
- Test edilmesi kolay

### 2. TypeORM Schema (Infrastructure Katmanı)

**Örnek:** `src/modules/news/schemas/news-article.schema.ts`

```typescript
import { EntitySchema } from 'typeorm';
import { NewsArticle } from '../entities/news-article.entity';
import { NewsStatusEnum } from '../enums/news-status.enum';

export const NewsArticleSchema = new EntitySchema<NewsArticle>({
  name: 'NewsArticle',
  target: NewsArticle,
  tableName: 'news_articles',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    sourceId: {
      type: Number,
    },
    title: {
      type: String,
      length: 500,
    },
    url: {
      type: String,
      unique: true,
    },
    status: {
      type: 'enum',
      enum: NewsStatusEnum,
      default: NewsStatusEnum.PENDING,
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,
    },
  },
  indices: [
    {
      columns: ['url'],
    },
  ],
  relations: {
    // İlişki tanımlamaları
  },
});
```

✅ **Özellikler:**
- TypeORM EntitySchema kullanımı
- Tüm database metadata burada
- Column tanımlamaları
- Index tanımlamaları
- İlişki tanımlamaları
- Entity'den ayrı

## 📁 Klasör Yapısı

```
modules/
├── news/
│   ├── entities/               # Domain entities (temiz)
│   │   ├── news-article.entity.ts
│   │   ├── news-tag.entity.ts
│   │   └── ...
│   ├── schemas/                # TypeORM schemas (infrastructure)
│   │   ├── news-article.schema.ts
│   │   ├── news-tag.schema.ts
│   │   └── ...
│   ├── enums/                  # Domain enums
│   ├── dto/                    # Data Transfer Objects
│   └── responses/              # Response DTOs
```

## 🔄 Entity'den Schema'ya Geçiş

### Önce (TypeORM Decorator'lı):

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('news_articles')
export class NewsArticle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', unique: true })
  url: string;
}
```

❌ **Sorunlar:**
- Entity TypeORM'e bağımlı
- Framework değişikliğinde entity'ler etkilenir
- Test etmek zor
- Çok fazla decorator karmaşası

### Sonra (Clean Architecture):

**Entity:**
```typescript
import { AutoEntity } from '../../../common/decorators/auto-entity.decorator';

@AutoEntity()
export class NewsArticle {
  id: number;
  title: string;
  url: string;
}
```

**Schema:**
```typescript
import { EntitySchema } from 'typeorm';
import { NewsArticle } from '../entities/news-article.entity';

export const NewsArticleSchema = new EntitySchema<NewsArticle>({
  name: 'NewsArticle',
  target: NewsArticle,
  tableName: 'news_articles',
  columns: {
    id: { type: Number, primary: true, generated: true },
    title: { type: String, length: 500 },
    url: { type: String, unique: true },
  },
});
```

✅ **Avantajlar:**
- Entity temiz ve sade
- TypeORM dependency ayrı
- Test edilmesi çok kolay
- Framework değişikliği sadece schema'ları etkiler
- Business logic odaklı

## 🎨 @AutoEntity Decorator

`@AutoEntity()` decorator'ı entity'lere otomatik property mapping ekler:

```typescript
@AutoEntity()
export class NewsArticle {
  id: number;
  title: string;
}

// Kullanım:
const article = new NewsArticle({
  id: 1,
  title: 'Test Article',
});

console.log(article.id);     // 1
console.log(article.title);  // 'Test Article'
```

**Özellikler:**
- Otomatik constructor
- Object mapping
- Type safety
- Clean syntax

## 🔧 Configuration

### Database Config

**`src/config/database.config.ts`:**

```typescript
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { NewsArticleSchema } from '../modules/news/schemas/news-article.schema';
// ... diğer schema'lar

export default registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'postgres',
  // ... diğer ayarlar
  entities: [
    NewsArticleSchema,
    // ... diğer schema'lar
  ],
}));
```

### Migration Config

**`src/config/typeorm-migration.config.ts`:**

```typescript
import { DataSource } from 'typeorm';
import { NewsArticleSchema } from '../modules/news/schemas/news-article.schema';
// ... diğer schema'lar

export const dataSourceOptions = {
  type: 'postgres',
  // ... diğer ayarlar
  entities: [
    NewsArticleSchema,
    // ... diğer schema'lar
  ],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
```

## 📊 Modül Yapısı

### RSS Sources Modülü

**Entities (2):**
- `RssSource` - RSS kaynak bilgileri
- `SourceReliabilityScore` - Kaynak güvenilirlik skorları

**Schemas (2):**
- `rss-source.schema.ts`
- `source-reliability-score.schema.ts`

### News Modülü

**Entities (5):**
- `NewsArticle` - Haber içeriği (master entity)
- `NewsTag` - Etiketler
- `NewsArticleTag` - Many-to-many junction table
- `StockMention` - Hisse senedi bahisleri
- `ExtractedEntity` - NER sonuçları

**Schemas (5):**
- `news-article.schema.ts`
- `news-tag.schema.ts`
- `news-article-tag.schema.ts`
- `stock-mention.schema.ts`
- `extracted-entity.schema.ts`

### News Reliability Modülü

**Entities (1):**
- `NewsReliabilityTracking` - Tahmin doğruluğu takibi

**Schemas (1):**
- `news-reliability-tracking.schema.ts`

## 🚀 Migration Kullanımı

Entity'ler temiz olsa da, migration'lar schema'ları kullanarak çalışır:

```bash
# Migration oluştur
npm run migration:generate --name=InitialSchema

# Migration çalıştır
npm run migration:run

# Migration geri al
npm run migration:revert
```

TypeORM migration CLI, schema'ları okuyarak database yapısını analiz eder ve migration'ları oluşturur.

## 🧪 Test Avantajları

### Önce (TypeORM Decorator'lı):

```typescript
// TypeORM mock'lamak gerekir
import { getRepository } from 'typeorm';

test('create article', () => {
  const mockRepo = { save: jest.fn() };
  // Karmaşık mock setup...
});
```

### Sonra (Clean Entity):

```typescript
// Entity doğrudan kullanılabilir
import { NewsArticle } from './entities/news-article.entity';

test('create article', () => {
  const article = new NewsArticle({
    id: 1,
    title: 'Test',
  });
  
  expect(article.title).toBe('Test');
  // Hiç mock yok, saf JavaScript!
});
```

## 📈 Karşılaştırma

| Özellik | TypeORM Decorators | Clean Architecture |
|---------|-------------------|-------------------|
| Entity Temizliği | ❌ Karmaşık | ✅ Çok temiz |
| Framework Bağımsızlığı | ❌ Bağımlı | ✅ Bağımsız |
| Test Edilebilirlik | ⚠️ Zor | ✅ Kolay |
| Kod Okunabilirliği | ⚠️ Orta | ✅ Yüksek |
| Bakım Kolaylığı | ⚠️ Orta | ✅ Yüksek |
| Migration Desteği | ✅ Var | ✅ Var |
| Learning Curve | ⚠️ Orta | ✅ Kolay |

## ✅ Best Practices

1. **Entity'leri Sade Tut**: Sadece business properties
2. **Schema'larda Infrastructure**: Database detayları schema'da
3. **Enum'ları Kullan**: Type-safe kategorilendirme
4. **İlişkileri Ayır**: Relations schema'da tanımla
5. **Test Öncelikli**: Entity'leri kolayca test et
6. **Dokümante Et**: Her entity ve schema'yı açıkla

## 🎯 Sonuç

Bu mimari yaklaşım:
- ✅ Entity'leri temiz tutar (Payment entity pattern)
- ✅ TypeORM'i ayrıştırır (infrastructure concern)
- ✅ Test edilebilirliği artırır
- ✅ Maintainability yükseltir
- ✅ Clean Architecture prensiplerini uygular
- ✅ Migration desteğini korur

**Payment entity'sindeki yaklaşım başarıyla tüm RSS/News entity'lerine uygulandı!**

---

**Oluşturma Tarihi**: 26 Ekim 2025  
**Versiyon**: 2.0 (Clean Architecture)  
**Durum**: ✅ Tamamlandı ve Test Edildi

