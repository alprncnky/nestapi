import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';
import { NewsArticle } from './news-article.entity';
import { NewsTag } from './news-tag.entity';
import { DetectionMethodEnum } from '../../contracts/enums/detection-method.enum';

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
