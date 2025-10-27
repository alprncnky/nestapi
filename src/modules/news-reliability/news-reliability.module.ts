import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsReliabilityTrackingSchema } from './data/schemas/news-reliability-tracking.schema';
import { NewsReliabilityController } from './controllers/news-reliability.controller';
import { NewsReliabilityService } from './business/services/news-reliability.service';

/**
 * News Reliability Module
 * Handles prediction tracking and accuracy measurement
 * 
 * Features:
 * - Track predictions about news impact on stocks
 * - Record actual outcomes
 * - Calculate prediction accuracy
 * - Generate source reliability reports
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([NewsReliabilityTrackingSchema]),
  ],
  controllers: [NewsReliabilityController],
  providers: [NewsReliabilityService],
  exports: [NewsReliabilityService], // Export for use in other modules
})
export class NewsReliabilityModule {}
