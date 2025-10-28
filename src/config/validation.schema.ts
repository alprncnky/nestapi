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

  // BIST100 API Configuration
  BIST_API_URL: Joi.string()
    .uri()
    .required()
    .description('BIST100 API endpoint URL'),
  
  BIST_API_HOST: Joi.string()
    .required()
    .description('BIST100 API host header'),
  
  BIST_API_KEY: Joi.string()
    .required()
    .description('BIST100 API key'),

  // OpenAI Configuration
  OPENAI_API_KEY: Joi.string()
    .required()
    .description('OpenAI API key for AI predictions'),
  
  OPENAI_MODEL: Joi.string()
    .default('gpt-4o-mini')
    .description('OpenAI model to use for predictions'),

  // Prediction System Configuration
  PREDICTION_CONFIDENCE_THRESHOLD: Joi.number()
    .default(70)
    .min(0)
    .max(100)
    .description('Minimum confidence threshold for predictions'),
  
  LEARNING_SYSTEM_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable learning system for continuous improvement'),
  
  DAILY_REPORT_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable daily report generation'),
});

