import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Import schemas
import { StockSchema } from '../modules/stocks/data/schemas/stock.schema';
import { JobExecutionHistorySchema } from '../modules/job-execution-history/data/schemas/job-execution-history.schema';

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
    StockSchema,
    JobExecutionHistorySchema,
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

