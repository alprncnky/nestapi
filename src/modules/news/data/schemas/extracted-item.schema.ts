import { EntitySchema } from 'typeorm';
import { ExtractedItem } from '../entities/extracted-item.entity';
import { EntityTypeEnum } from '../../contracts/enums/entity-type.enum';

export const ExtractedItemSchema = new EntitySchema<ExtractedItem>({
  name: 'ExtractedItem',
  target: ExtractedItem,
  tableName: 'extracted_items',
  columns: {
    id: { type: Number, primary: true, generated: true },
    articleId: { type: Number },
    entityType: { type: 'enum', enum: EntityTypeEnum },
    entityText: { type: String, length: 500 },
    normalizedValue: { type: String, length: 500, nullable: true },
    position: { type: Number, nullable: true, comment: 'Position in text' },
    confidence: { type: 'decimal', precision: 3, scale: 2, default: 1.0, comment: '0 to 1 confidence' },
    createdAt: { type: 'timestamp', createDate: true },
  },
  relations: {
    article: { type: 'many-to-one', target: 'NewsArticle', joinColumn: { name: 'articleId' }, onDelete: 'CASCADE' },
  },
  indices: [
    { columns: ['entityType'] },
  ],
});
