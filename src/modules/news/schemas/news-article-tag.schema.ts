import { EntitySchema } from 'typeorm';
import { NewsArticleTag } from '../entities/news-article-tag.entity';
import { DetectionMethodEnum } from '../enums/detection-method.enum';

export const NewsArticleTagSchema = new EntitySchema<NewsArticleTag>({
  name: 'NewsArticleTag',
  target: NewsArticleTag,
  tableName: 'news_article_tags',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    articleId: {
      type: Number,
    },
    tagId: {
      type: Number,
    },
    confidence: {
      type: 'decimal',
      precision: 3,
      scale: 2,
      default: 1.0,
      comment: '0 to 1 confidence',
    },
    detectionMethod: {
      type: 'enum',
      enum: DetectionMethodEnum,
      default: DetectionMethodEnum.AUTO,
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
    tag: {
      type: 'many-to-one',
      target: 'NewsTag',
      joinColumn: {
        name: 'tagId',
      },
    },
  },
  uniques: [
    {
      columns: ['articleId', 'tagId'],
    },
  ],
});

