import { Param, ParseIntPipe } from '@nestjs/common';
import { CrudController } from '../../common/decorators/crud-controller.decorator';
import {
  GetPendingEndpoint,
  GetRelatedEndpoint,
  GetByFieldEndpoint,
  GetReportEndpoint,
} from '../../common/decorators/endpoint.decorator';
import { BaseController } from '../../common/base/base-controller';
import { NewsReliabilityTracking } from './entities/news-reliability-tracking.entity';
import { SaveReliabilityTrackingDto } from './dto/save-reliability-tracking.dto';
import { ReliabilityTrackingResponseDto } from './responses/reliability-tracking-response.dto';
import { ReliabilityTrackingListResponseDto } from './responses/reliability-tracking-list-response.dto';
import { NewsReliabilityService } from './news-reliability.service';

/**
 * Controller for News Reliability Tracking endpoints
 * Handles prediction tracking and accuracy measurement
 */
@CrudController('reliability', 'ReliabilityTracking')
export class NewsReliabilityController extends BaseController<
  NewsReliabilityTracking,
  SaveReliabilityTrackingDto,
  SaveReliabilityTrackingDto,
  ReliabilityTrackingResponseDto,
  ReliabilityTrackingListResponseDto
> {
  constructor(
    private readonly newsReliabilityService: NewsReliabilityService,
  ) {
    super(newsReliabilityService);
  }

  // Implement abstract methods
  protected getResponseClass = () => ReliabilityTrackingResponseDto;
  protected getListResponseClass = () => ReliabilityTrackingListResponseDto;
  protected getEntityName = () => 'ReliabilityTracking';

  /**
   * Get pending predictions (not yet evaluated)
   * GET /reliability/pending
   */
  @GetPendingEndpoint('Prediction', ReliabilityTrackingListResponseDto)
  async getPendingPredictions(): Promise<ReliabilityTrackingListResponseDto> {
    const predictions = await this.newsReliabilityService.getPendingPredictions();
    return new ReliabilityTrackingListResponseDto(predictions.map((p) => new ReliabilityTrackingResponseDto(p)), predictions.length);
  }

  /**
   * Get reliability tracking by article
   * GET /reliability/article/:articleId
   */
  @GetByFieldEndpoint('ReliabilityTracking', 'article', ReliabilityTrackingListResponseDto)
  async getByArticle(@Param('article', ParseIntPipe) articleId: number): Promise<ReliabilityTrackingListResponseDto> {
    const records = await this.newsReliabilityService.findByArticle(articleId);
    return new ReliabilityTrackingListResponseDto(records.map((r) => new ReliabilityTrackingResponseDto(r)), records.length);
  }

  /**
   * Get reliability tracking by stock
   * GET /reliability/stock/:symbol
   */
  @GetByFieldEndpoint('ReliabilityTracking', 'stock', ReliabilityTrackingListResponseDto)
  async getByStock(@Param('stock') symbol: string): Promise<ReliabilityTrackingListResponseDto> {
    const records = await this.newsReliabilityService.findByStock(symbol);
    return new ReliabilityTrackingListResponseDto(records.map((r) => new ReliabilityTrackingResponseDto(r)), records.length);
  }

  /**
   * Get accuracy report for a source
   * GET /reliability/source/:sourceId/accuracy
   */
  @GetReportEndpoint('Source', 'accuracy', true)
  async getSourceAccuracy(@Param('id', ParseIntPipe) sourceId: number): Promise<{ totalPredictions: number; correctDirectionPredictions: number; averageAccuracy: number }> {
    return await this.newsReliabilityService.getSourceAccuracyReport(sourceId);
  }
}

