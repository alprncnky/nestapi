import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Import schemas for clean architecture
import { RssSourceSchema } from '../modules/rss-sources/data/schemas/rss-source.schema';
import { StockSchema } from '../modules/stocks/data/schemas/stock.schema';
import { JobExecutionHistorySchema } from '../modules/job-execution-history/data/schemas/job-execution-history.schema';

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
      StockSchema,
      JobExecutionHistorySchema,
    ],
    synchronize: false, // ⚠️ DISABLED - Use migrations instead!
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.DB_SSL_MODE === 'true' ? { rejectUnauthorized: false } : false,
    migrationsRun: false, // Migrations are run manually via CLI
  }),
);

