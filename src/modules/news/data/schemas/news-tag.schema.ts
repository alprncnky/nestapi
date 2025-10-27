import { EntitySchema } from 'typeorm';
import { NewsTag } from '../entities/news-tag.entity';
import { TagTypeEnum } from '../../contracts/enums/tag-type.enum';

export const NewsTagSchema = new EntitySchema<NewsTag>({
  name: 'NewsTag',
  target: NewsTag,
  tableName: 'news_tags',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String, length: 100, unique: true },
    tagType: { type: 'enum', enum: TagTypeEnum },
    description: { type: 'text', nullable: true },
    usageCount: { type: Number, default: 0, comment: 'Number of times this tag has been used' },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    articleTags: { type: 'one-to-many', target: 'NewsArticleTag', inverseSide: 'tag' },
  },
  indices: [
    { columns: ['name'] },
  ],
});
