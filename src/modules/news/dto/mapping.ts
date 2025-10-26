import {
  StringField,
  NumberField,
  EnumField,
  BooleanField,
} from '../../../common/decorators/field.decorator';
import { NewsCategoryEnum } from '../enums/news-category.enum';
import { ImpactLevelEnum } from '../enums/impact-level.enum';
import { NewsStatusEnum } from '../enums/news-status.enum';
import { TagTypeEnum } from '../enums/tag-type.enum';
import { SentimentEnum } from '../enums/sentiment.enum';
import { EntityTypeEnum } from '../enums/entity-type.enum';

/**
 * Field mappings for News DTOs
 * Centralized validation and Swagger documentation configuration
 */

// News Article Mappings
export const CreateNewsArticleMapping = {
  sourceId: () =>
    NumberField('RSS source ID', 1, true, 1),
  title: () =>
    StringField('News article title', 'Breaking: Market Update', true, 3, 500),
  url: () =>
    StringField('Article URL', 'https://example.com/news/123', true, 10, 500),
  guid: () =>
    StringField('Article GUID', 'unique-guid-123', true, 3, 255),
  summary: () =>
    StringField('Article summary', 'Brief summary of the article', false, 10, 5000),
  content: () =>
    StringField('Full article content', 'Full content...', false, 10, 50000),
  publishedAt: () =>
    StringField('Publication date', '2024-01-01T00:00:00Z', true),
  imageUrl: () =>
    StringField('Image URL', 'https://example.com/image.jpg', false, 10, 500),
  category: () =>
    EnumField(NewsCategoryEnum, 'News category', NewsCategoryEnum.COMPANY_NEWS, false),
  impactLevel: () =>
    EnumField(ImpactLevelEnum, 'Impact level', ImpactLevelEnum.MEDIUM, false),
};

export const UpdateNewsArticleMapping = {
  title: () =>
    StringField('News article title', 'Breaking: Market Update', false, 3, 500),
  summary: () =>
    StringField('Article summary', 'Brief summary', false, 10, 5000),
  content: () =>
    StringField('Full article content', 'Full content...', false, 10, 50000),
  category: () =>
    EnumField(NewsCategoryEnum, 'News category', NewsCategoryEnum.COMPANY_NEWS, false),
  sentimentScore: () =>
    NumberField('Sentiment score (-1 to 1)', 0.5, false, -1, 1),
  impactLevel: () =>
    EnumField(ImpactLevelEnum, 'Impact level', ImpactLevelEnum.MEDIUM, false),
  status: () =>
    EnumField(NewsStatusEnum, 'Processing status', NewsStatusEnum.PROCESSED, false),
};

// News Tag Mappings
export const CreateNewsTagMapping = {
  name: () =>
    StringField('Tag name', 'Technology', true, 2, 100),
  type: () =>
    EnumField(TagTypeEnum, 'Tag type', TagTypeEnum.KEYWORD, true),
  description: () =>
    StringField('Tag description', 'Description of the tag', false, 5, 500),
};

export const UpdateNewsTagMapping = {
  name: () =>
    StringField('Tag name', 'Technology', false, 2, 100),
  type: () =>
    EnumField(TagTypeEnum, 'Tag type', TagTypeEnum.KEYWORD, false),
  description: () =>
    StringField('Tag description', 'Description of the tag', false, 5, 500),
};

// Stock Mention Mappings
export const CreateStockMentionMapping = {
  articleId: () =>
    NumberField('Article ID', 1, true, 1),
  stockSymbol: () =>
    StringField('Stock symbol', 'AAPL', true, 1, 10),
  stockName: () =>
    StringField('Company name', 'Apple Inc.', false, 2, 255),
  mentionCount: () =>
    NumberField('Number of mentions', 1, false, 1, 100),
  context: () =>
    StringField('Context of mention', 'Apple announced...', false, 5, 1000),
  sentiment: () =>
    EnumField(SentimentEnum, 'Sentiment', SentimentEnum.NEUTRAL, false),
  sentimentScore: () =>
    NumberField('Sentiment score (-1 to 1)', 0, false, -1, 1),
};

// Extracted Item Mappings
export const CreateExtractedItemMapping = {
  articleId: () =>
    NumberField('Article ID', 1, true, 1),
  entityType: () =>
    EnumField(EntityTypeEnum, 'Entity type', EntityTypeEnum.ORGANIZATION, true),
  entityText: () =>
    StringField('Entity text', 'Apple Inc.', true, 1, 500),
  normalizedValue: () =>
    StringField('Normalized value', 'AAPL', false, 1, 500),
  position: () =>
    NumberField('Position in text', 100, false, 0),
  confidence: () =>
    NumberField('Confidence score (0-1)', 0.95, false, 0, 1),
};

