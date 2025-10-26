import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Database configuration factory
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
    database: process.env.DB_NAME || 'postgres',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV === 'development', // ⚠️ Only in development!
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.DB_SSL_MODE === 'true' ? { rejectUnauthorized: false } : false,
    autoLoadEntities: true, // Automatically load entities from modules
  }),
);

