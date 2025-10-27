import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';
import { NewsArticle } from './news-article.entity';
import { NewsTag } from './news-tag.entity';
import { DetectionMethodEnum } from '../../contracts/enums/detection-method.enum';

/**
 * News Article Tag entity - Many-to-many relationship between articles and tags
 * TypeORM schema is defined in ./news-article-tag.schema.ts
 */
@AutoEntity()
export class NewsArticleTag {
  id: number;
  articleId: number;
  article: NewsArticle;
  tagId: number;
  tag: NewsTag;
  confidence: number;
  detectionMethod: DetectionMethodEnum;
  createdAt: Date;
}
