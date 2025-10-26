import * as Joi from 'joi';

/**
 * Environment variables validation schema
 * Validates all required environment variables on application startup
 * Provides strong type safety and fail-fast behavior
 */
export const validationSchema = Joi.object({
  // Application Configuration
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .description('Application environment'),
  
  PORT: Joi.number()
    .default(3000)
    .description('Application port'),

  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info')
    .description('Logging level'),

  // Database Configuration
  DB_HOST: Joi.string()
    .required()
    .description('Database host'),
  
  DB_PORT: Joi.number()
    .required()
    .description('Database port'),
  
  DB_USERNAME: Joi.string()
    .required()
    .description('Database username'),
  
  DB_PASSWORD: Joi.string()
    .required()
    .allow('')
    .description('Database password'),
  
  DB_NAME: Joi.string()
    .required()
    .description('Database name'),
  
  DB_SSL_MODE: Joi.boolean()
    .default(false)
    .description('Database SSL mode'),
});

