import { AutoEntity } from '../../../common/decorators/auto-entity.decorator';
import { TagTypeEnum } from '../enums/tag-type.enum';

/**
 * News Tag entity - Tags for categorizing news
 * TypeORM schema is defined in ./news-tag.schema.ts
 */
@AutoEntity()
export class NewsTag {
  id: number;
  name: string;
  tagType: TagTypeEnum;
  description: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  articleTags: any[];
}
