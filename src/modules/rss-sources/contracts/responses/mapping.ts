import { ResponseFieldConfig } from '../../../../common/decorators/auto-response.decorator';
import { FeedTypeEnum } from '../enums/feed-type.enum';
import { SourceCategoryEnum } from '../enums/source-category.enum';

/**
 * Response field mappings for RSS Source responses
 * Centralized Swagger documentation configuration
 */

export const RssSourceResponseMapping: Record<string, ResponseFieldConfig> = {
  name: {
    description: 'RSS source name',
    example: 'Bloomberg HT',
    required: true,
    type: String,
  },
  url: {
    description: 'RSS feed URL',
    example: 'https://www.bloomberght.com/rss',
    required: true,
    type: String,
  },
  feedType: {
    description: 'RSS feed type',
    example: 'RSS_2_0',
    required: true,
    enum: FeedTypeEnum,
  },
  category: {
    description: 'Source category',
    example: 'NEWS',
    required: true,
    enum: SourceCategoryEnum,
  },
  country: {
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'TR',
    required: true,
    type: String,
  },
  reliabilityScore: {
    description: 'Source reliability score (0-100)',
    example: 85.5,
    required: true,
    type: Number,
  },
  isActive: {
    description: 'Is source active',
    example: true,
    required: true,
    type: Boolean,
  },
  fetchInterval: {
    description: 'Fetch interval in minutes',
    example: 60,
    required: true,
    type: Number,
  },
  lastFetchedAt: {
    description: 'Last fetch timestamp',
    example: '2024-01-01T00:00:00Z',
    required: false,
    type: Date,
  },
};

