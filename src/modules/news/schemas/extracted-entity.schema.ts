import { EntitySchema } from 'typeorm';
import { ExtractedEntity } from '../entities/extracted-entity.entity';
import { EntityTypeEnum } from '../enums/entity-type.enum';

export const ExtractedEntitySchema = new EntitySchema<ExtractedEntity>({
  name: 'ExtractedEntity',
  target: ExtractedEntity,
  tableName: 'extracted_entities',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    articleId: {
      type: Number,
    },
    entityType: {
      type: 'enum',
      enum: EntityTypeEnum,
    },
    entityText: {
      type: String,
      length: 500,
    },
    normalizedValue: {
      type: String,
      length: 500,
      nullable: true,
    },
    position: {
      type: Number,
      nullable: true,
      comment: 'Position in text',
    },
    confidence: {
      type: 'decimal',
      precision: 3,
      scale: 2,
      default: 1.0,
      comment: '0 to 1 confidence',
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
  },
  relations: {
    article: {
      type: 'many-to-one',
      target: 'NewsArticle',
      joinColumn: {
        name: 'articleId',
      },
      onDelete: 'CASCADE',
    },
  },
  indices: [
    {
      columns: ['entityType'],
    },
  ],
});

