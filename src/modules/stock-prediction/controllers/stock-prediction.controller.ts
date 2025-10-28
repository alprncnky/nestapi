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
import { NewsReliabilityService } from '../../news-reliability/business/services/news-reliability.service';
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
    private readonly newsReliabilityService: NewsReliabilityService,
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
    try {
      // Get all predictions from news reliability service
      const allPredictions = await this.newsReliabilityService.findAll();
      
      // Apply pagination
      const page = criteriaDto.page || 0;
      const pageSize = criteriaDto.pageSize || 10;
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      
      // Apply sorting
      let sortedPredictions = [...allPredictions];
      if (criteriaDto.sortField && criteriaDto.sortType) {
        sortedPredictions.sort((a, b) => {
          const aValue = this.getFieldValue(a, criteriaDto.sortField!);
          const bValue = this.getFieldValue(b, criteriaDto.sortField!);
          
          if (criteriaDto.sortType === 'ASC') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
          }
        });
      } else {
        // Default sort by creation date (newest first)
        sortedPredictions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      
      // Apply pagination
      const paginatedPredictions = sortedPredictions.slice(startIndex, endIndex);
      
      // Convert to response DTOs
      const responseItems = paginatedPredictions.map(prediction => new PredictionResponseDto({
        id: prediction.id,
        articleId: prediction.articleId,
        stockSymbol: prediction.stockSymbol,
        predictedImpact: prediction.predictedImpact || 'NEUTRAL',
        predictedChangePercent: prediction.predictedChangePercent || 0,
        predictionConfidence: prediction.predictionConfidence || 0,
        timeWindow: prediction.timeWindow || '1D',
        reasoning: 'AI analysis', // Default reasoning since not stored in entity
        actualImpact: prediction.actualImpact || undefined,
        actualChangePercent: prediction.actualChangePercent || undefined,
        predictionAccuracy: prediction.predictionAccuracy || undefined,
        createdAt: prediction.createdAt,
        updatedAt: prediction.updatedAt,
      }));
      
      return new PredictionListResponseDto(responseItems, allPredictions.length);
    } catch (error) {
      // Log error and return empty list
      console.error('Error fetching predictions:', error);
      return new PredictionListResponseDto([], 0);
    }
  }

  @Get('predictions/:id')
  async getPrediction(@Query('id', ParseIntPipe) id: number): Promise<PredictionResponseDto> {
    try {
      // Fetch specific prediction from news reliability service
      const prediction = await this.newsReliabilityService.findOne(id);
      
      // Convert to response DTO
      return new PredictionResponseDto({
        id: prediction.id,
        articleId: prediction.articleId,
        stockSymbol: prediction.stockSymbol,
        predictedImpact: prediction.predictedImpact || 'NEUTRAL',
        predictedChangePercent: prediction.predictedChangePercent || 0,
        predictionConfidence: prediction.predictionConfidence || 0,
        timeWindow: prediction.timeWindow || '1D',
        reasoning: 'AI analysis', // Default reasoning since not stored in entity
        actualImpact: prediction.actualImpact || undefined,
        actualChangePercent: prediction.actualChangePercent || undefined,
        predictionAccuracy: prediction.predictionAccuracy || undefined,
        createdAt: prediction.createdAt,
        updatedAt: prediction.updatedAt,
      });
    } catch (error) {
      // If prediction not found, return a default response
      console.error(`Error fetching prediction ${id}:`, error);
      return new PredictionResponseDto({
        id,
        articleId: 0,
        stockSymbol: 'UNKNOWN',
        predictedImpact: 'NEUTRAL',
        predictedChangePercent: 0,
        predictionConfidence: 0,
        timeWindow: '1D',
        reasoning: 'Prediction not found',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
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

  /**
   * Get predictions by stock symbol
   */
  @Get('predictions/stock/:symbol')
  async getPredictionsByStock(@Query('symbol') symbol: string): Promise<PredictionListResponseDto> {
    try {
      const predictions = await this.newsReliabilityService.findByStock(symbol);
      
      const responseItems = predictions.map(prediction => new PredictionResponseDto({
        id: prediction.id,
        articleId: prediction.articleId,
        stockSymbol: prediction.stockSymbol,
        predictedImpact: prediction.predictedImpact || 'NEUTRAL',
        predictedChangePercent: prediction.predictedChangePercent || 0,
        predictionConfidence: prediction.predictionConfidence || 0,
        timeWindow: prediction.timeWindow || '1D',
        reasoning: 'AI analysis',
        actualImpact: prediction.actualImpact || undefined,
        actualChangePercent: prediction.actualChangePercent || undefined,
        predictionAccuracy: prediction.predictionAccuracy || undefined,
        createdAt: prediction.createdAt,
        updatedAt: prediction.updatedAt,
      }));
      
      return new PredictionListResponseDto(responseItems, predictions.length);
    } catch (error) {
      console.error(`Error fetching predictions for stock ${symbol}:`, error);
      return new PredictionListResponseDto([], 0);
    }
  }

  /**
   * Get pending predictions (no actual impact recorded yet)
   */
  @Get('predictions/pending')
  async getPendingPredictions(): Promise<PredictionListResponseDto> {
    try {
      const pendingPredictions = await this.newsReliabilityService.getPendingPredictions();
      
      const responseItems = pendingPredictions.map(prediction => new PredictionResponseDto({
        id: prediction.id,
        articleId: prediction.articleId,
        stockSymbol: prediction.stockSymbol,
        predictedImpact: prediction.predictedImpact || 'NEUTRAL',
        predictedChangePercent: prediction.predictedChangePercent || 0,
        predictionConfidence: prediction.predictionConfidence || 0,
        timeWindow: prediction.timeWindow || '1D',
        reasoning: 'AI analysis',
        actualImpact: prediction.actualImpact || undefined,
        actualChangePercent: prediction.actualChangePercent || undefined,
        predictionAccuracy: prediction.predictionAccuracy || undefined,
        createdAt: prediction.createdAt,
        updatedAt: prediction.updatedAt,
      }));
      
      return new PredictionListResponseDto(responseItems, pendingPredictions.length);
    } catch (error) {
      console.error('Error fetching pending predictions:', error);
      return new PredictionListResponseDto([], 0);
    }
  }

  /**
   * Helper method to get field value for sorting
   */
  private getFieldValue(obj: any, field: string): any {
    const fields = field.split('.');
    let value = obj;
    
    for (const f of fields) {
      value = value?.[f];
    }
    
    // Handle different data types for proper sorting
    if (value instanceof Date) {
      return value.getTime();
    }
    
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    
    return value || 0;
  }
}
