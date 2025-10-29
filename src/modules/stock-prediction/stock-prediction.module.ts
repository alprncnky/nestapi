import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PredictionRuleSchema } from './data/schemas/prediction-rule.schema';
import { DailyReportSchema } from './data/schemas/daily-report.schema';
import { NewsClusterSchema } from './data/schemas/news-cluster.schema';
import { RetrospectiveAnalysisSchema } from './data/schemas/retrospective-analysis.schema';
import { PatternRecognitionSchema } from './data/schemas/pattern-recognition.schema';
import { StockPredictionController } from './controllers/stock-prediction.controller';
import { PredictionEngineService } from './business/services/prediction-engine.service';
import { ActualImpactTrackerService } from './business/services/actual-impact-tracker.service';
import { LearningSystemService } from './business/services/learning-system.service';
import { RetrospectiveLearningService } from './business/services/retrospective-learning.service';
import { NewsClusteringService } from './business/services/news-clustering.service';
import { PatternRecognitionService } from './business/services/pattern-recognition.service';
import { DailyReportService } from './business/services/daily-report.service';
import { PredictionRuleRepository } from './data/repositories/prediction-rule.repository';
import { DailyReportRepository } from './data/repositories/daily-report.repository';
import { NewsClusterRepository } from './data/repositories/news-cluster.repository';
import { RetrospectiveAnalysisRepository } from './data/repositories/retrospective-analysis.repository';
import { PatternRecognitionRepository } from './data/repositories/pattern-recognition.repository';
import { PredictionProcessorSchedule } from './business/orchestration/schedules/prediction-processor.schedule';
import { ActualImpactTrackerSchedule } from './business/orchestration/schedules/actual-impact-tracker.schedule';
import { RetrospectiveLearningSchedule } from './business/orchestration/schedules/retrospective-learning.schedule';
import { DailyLearningReportSchedule } from './business/orchestration/schedules/daily-learning-report.schedule';
import { NewsClusteringSchedule } from './business/orchestration/schedules/news-clustering.schedule';
import { DailyAnalysisSchedule } from './business/orchestration/schedules/daily-analysis.schedule';
import { OpenAIService } from './business/services/openai.service';
import { BaseSchedulerService } from '../../common/services/base-scheduler.service';
import { NewsModule } from '../news/news.module';
import { StockPricesModule } from '../stock-prices/stock-prices.module';
import { NewsReliabilityModule } from '../news-reliability/news-reliability.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PredictionRuleSchema,
      DailyReportSchema,
      NewsClusterSchema,
      RetrospectiveAnalysisSchema,
      PatternRecognitionSchema,
    ]),
    forwardRef(() => NewsModule),
    StockPricesModule,
    NewsReliabilityModule,
  ],
  controllers: [
    StockPredictionController,
  ],
  providers: [
    // Services
    PredictionEngineService,
    ActualImpactTrackerService,
    LearningSystemService,
    RetrospectiveLearningService,
    NewsClusteringService,
    PatternRecognitionService,
    DailyReportService,
    OpenAIService,
    
    // Repositories
    PredictionRuleRepository,
    DailyReportRepository,
    NewsClusterRepository,
    RetrospectiveAnalysisRepository,
    PatternRecognitionRepository,
    
    // Schedules
    PredictionProcessorSchedule,
    ActualImpactTrackerSchedule,
    RetrospectiveLearningSchedule,
    DailyLearningReportSchedule,
    NewsClusteringSchedule,
    DailyAnalysisSchedule,
  ],
  exports: [
    // Services for other modules
    PredictionEngineService,
    ActualImpactTrackerService,
    LearningSystemService,
    RetrospectiveLearningService,
    NewsClusteringService,
    PatternRecognitionService,
    DailyReportService,
    OpenAIService,
    
    // Repositories for other modules
    PredictionRuleRepository,
    DailyReportRepository,
    NewsClusterRepository,
    RetrospectiveAnalysisRepository,
    PatternRecognitionRepository,
  ],
})
export class StockPredictionModule implements OnModuleInit {
  constructor(
    private readonly baseScheduler: BaseSchedulerService,
    private readonly predictionProcessorSchedule: PredictionProcessorSchedule,
    private readonly actualImpactTrackerSchedule: ActualImpactTrackerSchedule,
    private readonly retrospectiveLearningSchedule: RetrospectiveLearningSchedule,
    private readonly dailyLearningReportSchedule: DailyLearningReportSchedule,
    private readonly newsClusteringSchedule: NewsClusteringSchedule,
    private readonly dailyAnalysisSchedule: DailyAnalysisSchedule,
  ) {}

  /**
   * Register module schedules on initialization
   */
  async onModuleInit() {
    // Register all schedules with base scheduler
    this.baseScheduler.registerTask(this.predictionProcessorSchedule);
    this.baseScheduler.registerTask(this.actualImpactTrackerSchedule);
    this.baseScheduler.registerTask(this.retrospectiveLearningSchedule);
    this.baseScheduler.registerTask(this.dailyLearningReportSchedule);
    this.baseScheduler.registerTask(this.newsClusteringSchedule);
    this.baseScheduler.registerTask(this.dailyAnalysisSchedule);
  }
}
