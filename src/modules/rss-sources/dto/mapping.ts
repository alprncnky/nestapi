import {
  StringField,
  NumberField,
  EnumField,
  BooleanField,
} from '../../../common/decorators/field.decorator';
import { FeedTypeEnum } from '../enums/feed-type.enum';
import { SourceCategoryEnum } from '../enums/source-category.enum';

/**
 * Field mappings for RSS Source DTOs
 * Centralized validation and Swagger documentation configuration
 */

export const CreateRssSourceMapping = {
  name: () =>
    StringField(
      'RSS source name',
      'Bloomberg HT',
      true,
      3,
      255,
    ),
  url: () =>
    StringField(
      'RSS feed URL',
      'https://www.bloomberght.com/rss',
      true,
      10,
      500,
    ),
  feedType: () =>
    EnumField(
      FeedTypeEnum,
      'RSS feed type',
      FeedTypeEnum.RSS2,
      true,
    ),
  category: () =>
    EnumField(
      SourceCategoryEnum,
      'Source category',
      SourceCategoryEnum.COMPANY_NEWS,
      true,
    ),
  country: () =>
    StringField(
      'Country code (ISO 3166-1 alpha-2)',
      'TR',
      true,
      2,
      10,
    ),
  fetchInterval: () =>
    NumberField(
      'Fetch interval in minutes',
      60,
      true,
      5,
      1440,
    ),
  isActive: () =>
    BooleanField(
      'Is source active',
      true,
      false,
    ),
};

export const UpdateRssSourceMapping = {
  name: () =>
    StringField(
      'RSS source name',
      'Bloomberg HT',
      false,
      3,
      255,
    ),
  url: () =>
    StringField(
      'RSS feed URL',
      'https://www.bloomberght.com/rss',
      false,
      10,
      500,
    ),
  feedType: () =>
    EnumField(
      FeedTypeEnum,
      'RSS feed type',
      FeedTypeEnum.RSS2,
      false,
    ),
  category: () =>
    EnumField(
      SourceCategoryEnum,
      'Source category',
      SourceCategoryEnum.COMPANY_NEWS,
      false,
    ),
  country: () =>
    StringField(
      'Country code (ISO 3166-1 alpha-2)',
      'TR',
      false,
      2,
      10,
    ),
  fetchInterval: () =>
    NumberField(
      'Fetch interval in minutes',
      60,
      false,
      5,
      1440,
    ),
  isActive: () =>
    BooleanField(
      'Is source active',
      true,
      false,
    ),
  reliabilityScore: () =>
    NumberField(
      'Source reliability score (0-100)',
      75.5,
      false,
      0,
      100,
    ),
};

