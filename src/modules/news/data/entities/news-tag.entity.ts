import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';
import { TagTypeEnum } from '../../contracts/enums/tag-type.enum';

@AutoEntity()
export class NewsTag {
  id: number;
  name: string;
  tagType: TagTypeEnum;
  description: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  articleTags: any[];
}
