import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Import schemas for clean architecture
import { RssSourceSchema } from '../modules/rss-sources/data/schemas/rss-source.schema';
import { SourceReliabilityScoreSchema } from '../modules/rss-sources/data/schemas/source-reliability-score.schema';
import { NewsArticleSchema } from '../modules/news/data/schemas/news-article.schema';
import { NewsTagSchema } from '../modules/news/data/schemas/news-tag.schema';
import { NewsArticleTagSchema } from '../modules/news/data/schemas/news-article-tag.schema';
import { StockMentionSchema } from '../modules/news/data/schemas/stock-mention.schema';
import { ExtractedItemSchema } from '../modules/news/data/schemas/extracted-item.schema';
import { NewsReliabilityTrackingSchema } from '../modules/news-reliability/data/schemas/news-reliability-tracking.schema';

/**
 * Database configuration factory
 * Uses EntitySchema approach to keep domain entities clean (following Payment entity pattern)
 * Registers database configuration with type safety and validation
 */
export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'insdb',
    entities: [
      RssSourceSchema,
      SourceReliabilityScoreSchema,
      NewsArticleSchema,
      NewsTagSchema,
      NewsArticleTagSchema,
      StockMentionSchema,
      ExtractedItemSchema,
      NewsReliabilityTrackingSchema,
    ],
    synchronize: false, // ⚠️ DISABLED - Use migrations instead!
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.DB_SSL_MODE === 'true' ? { rejectUnauthorized: false } : false,
    migrationsRun: false, // Migrations are run manually via CLI
  }),
);

