import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';
import { NewsArticle } from './news-article.entity';
import { EntityTypeEnum } from '../../contracts/enums/entity-type.enum';

@AutoEntity()
export class ExtractedItem {
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

