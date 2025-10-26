import { EntitySchema } from 'typeorm';
import { RssSource } from '../entities/rss-source.entity';
import { FeedTypeEnum } from '../enums/feed-type.enum';
import { SourceCategoryEnum } from '../enums/source-category.enum';

export const RssSourceSchema = new EntitySchema<RssSource>({
  name: 'RssSource',
  target: RssSource,
  tableName: 'rss_sources',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    name: {
      type: String,
      length: 255,
    },
    url: {
      type: String,
      unique: true,
    },
    feedType: {
      type: 'enum',
      enum: FeedTypeEnum,
      default: FeedTypeEnum.RSS2,
    },
    category: {
      type: 'enum',
      enum: SourceCategoryEnum,
    },
    country: {
      type: String,
      length: 10,
      default: 'TR',
    },
    reliabilityScore: {
      type: 'decimal',
      precision: 5,
      scale: 2,
      default: 50.0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    fetchInterval: {
      type: Number,
      default: 30,
      comment: 'Fetch interval in minutes',
    },
    lastFetchedAt: {
      type: 'timestamp',
      nullable: true,
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,
    },
  },
});

