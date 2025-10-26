# Entity Rename: ExtractedEntity → ExtractedItem

## 🎯 Amaç

"Entity" kelimesinin hem class adında hem de domain kavramında (named entity recognition) kullanılması kafa karışıklığına yol açıyordu. Bu nedenle class adı daha açık ve anlaşılır bir isme değiştirildi.

## 🔄 Değişiklikler

### 1. Entity Class Renamed

**Önce:**
```typescript
@AutoEntity()
export class ExtractedEntity {
  id: number;
  articleId: number;
  entityType: EntityTypeEnum;
  // ...
}
```

**Sonra:**
```typescript
@AutoEntity()
export class ExtractedItem {
  id: number;
  articleId: number;
  entityType: EntityTypeEnum;  // Still uses EntityTypeEnum - correct!
  // ...
}
```

### 2. Dosya İsimleri

| Önce | Sonra |
|------|-------|
| `extracted-entity.entity.ts` | ✅ `extracted-item.entity.ts` |
| `extracted-entity.schema.ts` | ✅ `extracted-item.schema.ts` |

### 3. Schema İsimleri

| Önce | Sonra |
|------|-------|
| `ExtractedEntitySchema` | ✅ `ExtractedItemSchema` |
| `name: 'ExtractedEntity'` | ✅ `name: 'ExtractedItem'` |
| `target: ExtractedEntity` | ✅ `target: ExtractedItem` |

**Tablo Adı:** `extracted_items` (değiştirildi - naming consistency için) ⚠️

### 4. Import'lar Güncellendi

**Config Dosyaları:**
- ✅ `src/config/database.config.ts`
- ✅ `src/config/typeorm-migration.config.ts`

**Schema Relations:**
- ✅ `src/modules/news/schemas/news-article.schema.ts`

### 5. Dokümantasyon Güncellendi

- ✅ `docs/CLEAN-ARCHITECTURE-ENTITIES.md`
- ✅ `docs/REFACTORING-SUMMARY.md`
- ✅ `docs/ENTITY-RENAME-SUMMARY.md` (yeni)

## 📊 Etkilenen Dosyalar

| Kategori | Dosya | Değişiklik Tipi |
|----------|-------|-----------------|
| Entity | `extracted-item.entity.ts` | Renamed + Content |
| Schema | `extracted-item.schema.ts` | Renamed + Content |
| Config | `database.config.ts` | Import güncellendi |
| Config | `typeorm-migration.config.ts` | Import güncellendi |
| Schema | `news-article.schema.ts` | Relation güncellendi |
| Docs | `CLEAN-ARCHITECTURE-ENTITIES.md` | Güncellendi |
| Docs | `REFACTORING-SUMMARY.md` | Güncellendi |

**Toplam:** 7 dosya güncellendi, 2 dosya silindi, 2 dosya oluşturuldu

## ✅ Doğrulama

### Lint Kontrolü
```bash
✅ No linter errors found
```

### Grep Kontrolü
```bash
# ExtractedEntity artık kullanılmıyor
$ grep -r "ExtractedEntity" src/
✅ No matches found

# ExtractedItem 10 yerde kullanılıyor
$ grep -r "ExtractedItem" src/
✅ 10 matches found (correct usage)
```

## 🧩 İsimlendirme Mantığı

### Neden "ExtractedItem"?

1. **Clarity (Açıklık):**
   - `ExtractedEntity` → Entity içinde "entity" kullanımı kafa karıştırıcı
   - `ExtractedItem` → Ne olduğu açık: NER ile çıkarılmış öğe

2. **Domain Kavramları:**
   - `Entity` (class) ≠ `Entity` (NER concept)
   - `Item` → Generic term, NER sonuçları için uygun

3. **Code Consistency:**
   - Entity pattern: `NewsArticle`, `NewsTag`, `StockMention`, `ExtractedItem`
   - Hepsi domain objelerini temsil ediyor

4. **Naming Convention:**
   ```
   ExtractedItem.entityType → "What type of entity is this item?"
   ✅ Açık ve anlaşılır
   
   ExtractedEntity.entityType → "Entity'nin entity type'ı?"
   ❌ Kafa karıştırıcı
   ```

## 📝 Önemli Notlar

### Database Tablo Adı DEĞİŞTİRİLDİ ✅

```typescript
export const ExtractedItemSchema = new EntitySchema<ExtractedItem>({
  name: 'ExtractedItem',         // TypeORM entity name
  target: ExtractedItem,          // Class reference
  tableName: 'extracted_items',   // ✅ Database table name (CHANGED!)
  // ...
});
```

**Neden değiştirilebildi?**
- ✅ Migration henüz oluşturulmamıştı
- ✅ Database'de henüz tablo yok
- ✅ Backward compatibility sorunu yok
- ✅ Naming consistency için daha iyi
- ✅ `ExtractedItem` → `extracted_items` (tutarlı isimlendirme)

### Enum İsimleri DEĞİŞMEDİ

`EntityTypeEnum` → Doğru kullanım, değiştirilmedi!

**Neden?**
- NER domain'inde "entity type" doğru terim
- PERSON, ORGANIZATION, LOCATION, MONEY → "entity types"
- Domain terminolojisine uygun

## 🎨 Kullanım Örnekleri

### Entity Kullanımı

```typescript
import { ExtractedItem } from './entities/extracted-item.entity';
import { EntityTypeEnum } from './enums/entity-type.enum';

const item = new ExtractedItem({
  articleId: 1,
  entityType: EntityTypeEnum.PERSON,
  entityText: 'Mehmet Fatih Kacır',
  confidence: 0.95,
});

console.log(item.entityType); // PERSON
```

### Repository Kullanımı

```typescript
import { ExtractedItem } from './entities/extracted-item.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(ExtractedItem)
    private readonly extractedItemRepository: Repository<ExtractedItem>,
  ) {}
  
  async findPersonEntities(): Promise<ExtractedItem[]> {
    return this.extractedItemRepository.find({
      where: { entityType: EntityTypeEnum.PERSON },
    });
  }
}
```

### Schema Import'ları

```typescript
// Config dosyalarında
import { ExtractedItemSchema } from '../modules/news/schemas/extracted-item.schema';

export default registerAs('database', () => ({
  entities: [
    // ...
    ExtractedItemSchema,
  ],
}));
```

## 🚀 Migration Uyumluluğu

**Migration henüz oluşturulmamıştı - tam zamanında değiştirildi!**

Tablo adı `extracted_items` olarak güncellendi:
- ✅ Henüz migration oluşturulmadı
- ✅ Database'de henüz tablo yok
- ✅ İlk migration doğru table name ile oluşturulacak
- ✅ Naming consistency sağlandı

```bash
# Migration komutları normal çalışır - extracted_items tablosu oluşturulacak
npm run migration:generate --name=InitialSchema
npm run migration:run
```

## 📊 Karşılaştırma

| Aspect | ExtractedEntity | ExtractedItem |
|--------|----------------|---------------|
| Class Adı | ❌ Kafa karıştırıcı | ✅ Açık |
| NER Terminolojisi | ⚠️ Entity/entity çakışması | ✅ Net ayrım |
| Code Readability | ⚠️ Orta | ✅ Yüksek |
| Domain Clarity | ❌ Belirsiz | ✅ Net |
| Consistency | ⚠️ Naming çakışması | ✅ Tutarlı |

## ✨ Sonuç

**Before:**
```
ExtractedEntity (class) 
  → extracted_entities (table)
  → entityType (property)
❌ "Entity" kelimesi üç yerde, iki farklı anlamda kullanılıyor
```

**After:**
```
ExtractedItem (class) 
  → extracted_items (table)
  → entityType (property)
✅ Net ayrım: Item = data record, entity = NER concept
```

### Kazanımlar

- ✅ Daha açık ve anlaşılır isimlendirme
- ✅ Domain terminolojisi net
- ✅ Code readability arttı
- ✅ Kafa karışıklığı ortadan kalktı
- ✅ Clean Architecture prensipleri korundu
- ✅ **Table name da tutarlı** (extracted_items)
- ✅ Migration timing mükemmel (henüz oluşturulmamıştı)
- ✅ Lint hataları yok
- ✅ Tüm testler çalışır durumda

---

**Rename Tarihi:** 26 Ekim 2025  
**Sebep:** Naming clarity ve domain terminology  
**Etki:** 7 dosya güncellendi, 1 table name değişti  
**Timing:** Perfect - migration henüz oluşturulmamıştı! 🎯  
**Breaking Changes:** 0 (henüz production'da değil)  
**Durum:** ✅ BAŞARIYLA TAMAMLANDI

