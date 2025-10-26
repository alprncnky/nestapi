import { AutoEntity } from '../../../common/decorators/auto-entity.decorator';
import { NewsArticle } from './news-article.entity';
import { EntityTypeEnum } from '../enums/entity-type.enum';

/**
 * Extracted Entity entity - Named entities extracted from news content via NER
 * TypeORM schema is defined in ./extracted-entity.schema.ts
 */
@AutoEntity()
export class ExtractedEntity {
  id: number;
  articleId: number;
  article: NewsArticle;
  entityType: EntityTypeEnum;
  entityText: string;
  normalizedValue: string;
  position: number;
  confidence: number;
  createdAt: Date;
}
