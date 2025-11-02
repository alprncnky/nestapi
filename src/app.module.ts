import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalSchedulerModule } from './common/scheduler.module';
import { RssSourcesModule } from './modules/rss-sources/rss-sources.module';
import { StocksModule } from './modules/stocks/stocks.module';
import { JobExecutionHistoryModule } from './modules/job-execution-history/job-execution-history.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import databaseConfig from './config/database.config';
import { validationSchema } from './config/validation.schema';

@Module({
  imports: [
    // Global configuration module with environment validation
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere without importing
      // Load environment-specific .env file based on NODE_ENV
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      load: [databaseConfig], // Load database configuration
      cache: true, // Cache configuration for better performance
      validationSchema, // Validate environment variables on startup
      validationOptions: {
        abortEarly: false, // Show all validation errors, not just the first one
        allowUnknown: true, // Allow unknown environment variables
      },
    }),

    // Global scheduler module - provides BaseSchedulerService globally
    GlobalSchedulerModule,


    // TypeORM with async configuration using ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
    }),

    // Feature modules
    JobExecutionHistoryModule,
    SchedulerModule,
    RssSourcesModule,
    StocksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
