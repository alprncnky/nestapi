import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Import schemas
import { RssSourceSchema } from '../modules/rss-sources/data/schemas/rss-source.schema';
import { SourceReliabilityScoreSchema } from '../modules/rss-sources/data/schemas/source-reliability-score.schema';
import { NewsArticleSchema } from '../modules/news/data/schemas/news-article.schema';
import { NewsTagSchema } from '../modules/news/data/schemas/news-tag.schema';
import { NewsArticleTagSchema } from '../modules/news/data/schemas/news-article-tag.schema';
import { StockMentionSchema } from '../modules/news/data/schemas/stock-mention.schema';
import { ExtractedItemSchema } from '../modules/news/data/schemas/extracted-item.schema';
import { NewsReliabilityTrackingSchema } from '../modules/news-reliability/data/schemas/news-reliability-tracking.schema';

// Load environment variables
config();

/**
 * TypeORM DataSource configuration for migrations
 * Uses EntitySchema approach to keep domain entities clean
 * This configuration is separate from the NestJS module config
 * and is specifically used for CLI migration commands
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'insdb',
  
  // Use EntitySchema instead of decorated entities
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
  
  // Migration configuration
  migrations: [join(__dirname, '..', '..', 'database', 'migrations', '*{.ts,.js}')],
  migrationsTableName: 'migrations',
  migrationsRun: false, // Don't auto-run migrations on startup
  
  // Synchronize should be FALSE in production
  synchronize: false,
  
  // Logging
  logging: process.env.NODE_ENV === 'development',
  
  // SSL configuration
  ssl: process.env.DB_SSL_MODE === 'true' ? { rejectUnauthorized: false } : false,
};

// Create and export DataSource instance for TypeORM CLI
const dataSource = new DataSource(dataSourceOptions);

export default dataSource;

