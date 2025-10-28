import { Query, Body, ParseIntPipe, Post, Get } from '@nestjs/common';
import { CrudController } from '../../../common/decorators/crud-controller.decorator';
import { SaveEndpoint, GetEndpoint, GetListEndpoint } from '../../../common/decorators/endpoint.decorator';
import { BaseController } from '../../../common/base/base-controller';
import { PredictionEngineService } from '../business/services/prediction-engine.service';
import { DailyReportService } from '../business/services/daily-report.service';
import { RetrospectiveLearningService } from '../business/services/retrospective-learning.service';
import { PatternRecognitionService } from '../business/services/pattern-recognition.service';
import { PredictionRuleRepository } from '../data/repositories/prediction-rule.repository';
import { DailyReportRepository } from '../data/repositories/daily-report.repository';
import { RetrospectiveAnalysisRepository } from '../data/repositories/retrospective-analysis.repository';
import { PatternRecognitionRepository } from '../data/repositories/pattern-recognition.repository';
import { CreatePredictionDto } from '../contracts/requests/create-prediction.dto';
import { PredictionResponseDto } from '../contracts/responses/prediction-response.dto';
import { DailyReportResponseDto } from '../contracts/responses/daily-report-response.dto';
import { RetrospectiveAnalysisResponseDto } from '../contracts/responses/retrospective-analysis-response.dto';
import { PredictionListResponseDto, DailyReportListResponseDto, RetrospectiveAnalysisListResponseDto } from '../contracts/responses/list-response.dto';
import { CriteriaDto } from '../../../common/dto/criteria.dto';

@CrudController('stock-prediction', 'StockPrediction')
export class StockPredictionController extends BaseController<any, CreatePredictionDto, CreatePredictionDto, PredictionResponseDto, PredictionListResponseDto> {
  constructor(
    private readonly predictionEngineService: PredictionEngineService,
    private readonly dailyReportService: DailyReportService,
    private readonly retrospectiveLearningService: RetrospectiveLearningService,
    private readonly patternRecognitionService: PatternRecognitionService,
    private readonly predictionRuleRepository: PredictionRuleRepository,
    private readonly dailyReportRepository: DailyReportRepository,
    private readonly retrospectiveAnalysisRepository: RetrospectiveAnalysisRepository,
    private readonly patternRecognitionRepository: PatternRecognitionRepository,
  ) {
    super(
      null as any, // No service for base CRUD operations
      null as any, // No repository for base CRUD operations
      PredictionResponseDto,
      PredictionListResponseDto,
      'StockPrediction',
      CreatePredictionDto,
    );
  }

  @Post('predictions/trigger')
  async triggerPrediction(@Body() dto: CreatePredictionDto): Promise<{ message: string }> {
    await this.predictionEngineService.predictStockImpact(dto.articleId);
    return { message: 'Prediction triggered successfully' };
  }

  @Get('predictions')
  async getPredictions(@Body() criteriaDto: CriteriaDto): Promise<PredictionListResponseDto> {
    // This would typically fetch predictions from the news reliability service
    // For now, return empty list as this is a complex query
    return new PredictionListResponseDto([], 0);
  }

  @Get('predictions/:id')
  async getPrediction(@Query('id', ParseIntPipe) id: number): Promise<PredictionResponseDto> {
    // This would fetch a specific prediction
    // For now, return a mock response
    return new PredictionResponseDto({
      id,
      articleId: 1,
      stockSymbol: 'AKBNK',
      predictedImpact: 'UP',
      predictedChangePercent: 5.5,
      predictionConfidence: 75,
      timeWindow: '1D',
      reasoning: 'AI analysis',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  @Get('reports/daily')
  async getDailyReports(@Body() criteriaDto: CriteriaDto): Promise<DailyReportListResponseDto> {
    const reports = await this.dailyReportRepository.findLatest(10);
    const responseItems = reports.map(report => new DailyReportResponseDto({
      id: report.id,
      reportDate: report.reportDate,
      totalArticles: report.totalArticles,
      totalPredictions: report.totalPredictions,
      averageAccuracy: report.averageAccuracy,
      topGainers: JSON.parse(report.topGainers || '[]'),
      topLosers: JSON.parse(report.topLosers || '[]'),
      insights: JSON.parse(report.insights || '[]'),
      recommendations: JSON.parse(report.recommendations || '[]'),
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    }));
    return new DailyReportListResponseDto(responseItems, reports.length);
  }

  @Get('reports/retrospective')
  async getRetrospectiveAnalyses(@Body() criteriaDto: CriteriaDto): Promise<RetrospectiveAnalysisListResponseDto> {
    const analyses = await this.retrospectiveAnalysisRepository.findSignificantMovements(5);
    const responseItems = analyses.map(analysis => new RetrospectiveAnalysisResponseDto({
      id: analysis.id,
      stockSymbol: analysis.stockSymbol,
      movementPercent: analysis.movementPercent,
      analysisDate: analysis.analysisDate,
      movementStartTime: analysis.movementStartTime,
      movementEndTime: analysis.movementEndTime,
      precedingNewsCount: analysis.precedingNewsCount,
      existingPredictionsCount: analysis.existingPredictionsCount,
      missedOpportunity: analysis.missedOpportunity,
      missedReasons: JSON.parse(analysis.missedReasons || '[]'),
      retrospectiveAccuracy: analysis.retrospectiveAccuracy,
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt,
    }));
    return new RetrospectiveAnalysisListResponseDto(responseItems, analyses.length);
  }

  @Get('patterns')
  async getPatterns(@Query('type') type?: string): Promise<any> {
    if (type) {
      const patterns = await this.patternRecognitionRepository.findByPatternType(type);
      return { patterns };
    } else {
      const patterns = await this.patternRecognitionRepository.findHighConfidencePatterns(70);
      return { patterns };
    }
  }

  @Post('analysis/retrospective')
  async triggerRetrospectiveAnalysis(): Promise<{ message: string }> {
    await this.retrospectiveLearningService.performRetrospectiveAnalysis();
    return { message: 'Retrospective analysis triggered successfully' };
  }

  @Post('analysis/daily-report')
  async triggerDailyReport(): Promise<{ message: string }> {
    await this.dailyReportService.generateDailyAnalysis();
    return { message: 'Daily report triggered successfully' };
  }

  @Get('rules')
  async getPredictionRules(@Query('type') type?: string): Promise<any> {
    if (type) {
      const rules = await this.predictionRuleRepository.findByRuleType(type as any);
      return { rules };
    } else {
      const rules = await this.predictionRuleRepository.findTopPerforming(10);
      return { rules };
    }
  }
}
