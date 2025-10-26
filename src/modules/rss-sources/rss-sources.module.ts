import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RssSourceSchema } from './schemas/rss-source.schema';
import { SourceReliabilityScoreSchema } from './schemas/source-reliability-score.schema';
import { RssSourcesController } from './rss-sources.controller';
import { RssSourcesService } from './rss-sources.service';

/**
 * RSS Sources Module
 * Handles RSS feed source management
 * 
 * Features:
 * - CRUD operations for RSS sources
 * - Source reliability tracking
 * - Category-based filtering
 * - Active source management
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      RssSourceSchema,
      SourceReliabilityScoreSchema,
    ]),
  ],
  controllers: [RssSourcesController],
  providers: [RssSourcesService],
  exports: [RssSourcesService], // Export for use in other modules (RSS Parser, etc.)
})
export class RssSourcesModule {}

