/**
 * Type-safe configuration interfaces
 * These interfaces provide compile-time type safety for configuration values
 */

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  sslMode: boolean;
}

/**
 * Application configuration interface
 */
export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
}

/**
 * Complete application configuration
 */
export interface Configuration {
  app: AppConfig;
  database: DatabaseConfig;
}

