import { ResponseFieldConfig } from '../../../common/decorators/auto-response.decorator';
import { NewsCategoryEnum } from '../enums/news-category.enum';
import { ImpactLevelEnum } from '../enums/impact-level.enum';
import { NewsStatusEnum } from '../enums/news-status.enum';
import { TagTypeEnum } from '../enums/tag-type.enum';
import { SentimentEnum } from '../enums/sentiment.enum';
import { EntityTypeEnum } from '../enums/entity-type.enum';

/**
 * Response field mappings for News responses
 * Centralized Swagger documentation configuration
 */

export const NewsArticleResponseMapping: Record<string, ResponseFieldConfig> = {
  sourceId: {
    description: 'RSS source ID',
    example: 1,
    required: true,
    type: Number,
  },
  title: {
    description: 'Article title',
    example: 'Breaking: Major Market Movement',
    required: true,
    type: String,
  },
  url: {
    description: 'Article URL',
    example: 'https://example.com/news/123',
    required: true,
    type: String,
  },
  guid: {
    description: 'Article GUID',
    example: 'unique-guid-123',
    required: true,
    type: String,
  },
  summary: {
    description: 'Article summary',
    example: 'Brief summary of the news',
    required: false,
    type: String,
  },
  content: {
    description: 'Full article content',
    example: 'Full content of the article...',
    required: false,
    type: String,
  },
  publishedAt: {
    description: 'Publication date',
    example: '2024-01-01T00:00:00Z',
    required: true,
    type: Date,
  },
  imageUrl: {
    description: 'Article image URL',
    example: 'https://example.com/image.jpg',
    required: false,
    type: String,
  },
  category: {
    description: 'News category',
    example: 'COMPANY_NEWS',
    required: false,
    enum: NewsCategoryEnum,
  },
  sentimentScore: {
    description: 'Sentiment score (-1 to 1)',
    example: 0.75,
    required: false,
    type: Number,
  },
  impactLevel: {
    description: 'Impact level',
    example: 'HIGH',
    required: false,
    enum: ImpactLevelEnum,
  },
  status: {
    description: 'Processing status',
    example: 'PROCESSED',
    required: true,
    enum: NewsStatusEnum,
  },
};

export const NewsTagResponseMapping: Record<string, ResponseFieldConfig> = {
  name: {
    description: 'Tag name',
    example: 'Technology',
    required: true,
    type: String,
  },
  type: {
    description: 'Tag type',
    example: 'KEYWORD',
    required: true,
    enum: TagTypeEnum,
  },
  description: {
    description: 'Tag description',
    example: 'Technology-related news',
    required: false,
    type: String,
  },
  usageCount: {
    description: 'Number of times tag has been used',
    example: 150,
    required: true,
    type: Number,
  },
};

export const StockMentionResponseMapping: Record<string, ResponseFieldConfig> = {
  articleId: {
    description: 'Article ID',
    example: 1,
    required: true,
    type: Number,
  },
  stockSymbol: {
    description: 'Stock symbol',
    example: 'AAPL',
    required: true,
    type: String,
  },
  stockName: {
    description: 'Company name',
    example: 'Apple Inc.',
    required: false,
    type: String,
  },
  mentionCount: {
    description: 'Number of mentions in article',
    example: 3,
    required: true,
    type: Number,
  },
  context: {
    description: 'Context of mention',
    example: 'Apple announced a new product...',
    required: false,
    type: String,
  },
  sentiment: {
    description: 'Sentiment towards stock',
    example: 'POSITIVE',
    required: false,
    enum: SentimentEnum,
  },
  sentimentScore: {
    description: 'Sentiment score (-1 to 1)',
    example: 0.8,
    required: false,
    type: Number,
  },
};

export const ExtractedItemResponseMapping: Record<string, ResponseFieldConfig> = {
  articleId: {
    description: 'Article ID',
    example: 1,
    required: true,
    type: Number,
  },
  entityType: {
    description: 'Entity type',
    example: 'ORGANIZATION',
    required: true,
    enum: EntityTypeEnum,
  },
  entityText: {
    description: 'Entity text as found in article',
    example: 'Apple Inc.',
    required: true,
    type: String,
  },
  normalizedValue: {
    description: 'Normalized entity value',
    example: 'AAPL',
    required: false,
    type: String,
  },
  position: {
    description: 'Position in text',
    example: 150,
    required: false,
    type: Number,
  },
  confidence: {
    description: 'AI confidence score (0-1)',
    example: 0.95,
    required: true,
    type: Number,
  },
};

