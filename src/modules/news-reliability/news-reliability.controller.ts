import { Controller, Get, Param, ParseIntPipe, Patch, Body } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CrudController } from '../../common/decorators/crud-controller.decorator';
import { BaseController } from '../../common/base/base-controller';
import { NewsReliabilityTracking } from './entities/news-reliability-tracking.entity';
import { CreateReliabilityTrackingDto } from './dto/create-reliability-tracking.dto';
import { UpdateReliabilityTrackingDto } from './dto/update-reliability-tracking.dto';
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
  CreateReliabilityTrackingDto,
  UpdateReliabilityTrackingDto,
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
  @Get('pending')
  @ApiOperation({ summary: 'Get pending predictions awaiting evaluation' })
  @ApiResponse({
    status: 200,
    description: 'List of pending predictions',
    type: ReliabilityTrackingListResponseDto,
  })
  async getPendingPredictions(): Promise<ReliabilityTrackingListResponseDto> {
    const predictions = await this.newsReliabilityService.getPendingPredictions();
    return new ReliabilityTrackingListResponseDto(
      predictions.map((p) => new ReliabilityTrackingResponseDto(p)),
      predictions.length,
    );
  }

  /**
   * Get reliability tracking by article
   * GET /reliability/article/:articleId
   */
  @Get('article/:articleId')
  @ApiOperation({ summary: 'Get reliability tracking records for a specific article' })
  @ApiParam({ name: 'articleId', type: 'number', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'List of tracking records for the article',
    type: ReliabilityTrackingListResponseDto,
  })
  async getByArticle(
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<ReliabilityTrackingListResponseDto> {
    const records = await this.newsReliabilityService.findByArticle(articleId);
    return new ReliabilityTrackingListResponseDto(
      records.map((r) => new ReliabilityTrackingResponseDto(r)),
      records.length,
    );
  }

  /**
   * Get reliability tracking by stock
   * GET /reliability/stock/:symbol
   */
  @Get('stock/:symbol')
  @ApiOperation({ summary: 'Get reliability tracking records for a specific stock' })
  @ApiParam({ name: 'symbol', type: 'string', description: 'Stock symbol' })
  @ApiResponse({
    status: 200,
    description: 'List of tracking records for the stock',
    type: ReliabilityTrackingListResponseDto,
  })
  async getByStock(
    @Param('symbol') symbol: string,
  ): Promise<ReliabilityTrackingListResponseDto> {
    const records = await this.newsReliabilityService.findByStock(symbol);
    return new ReliabilityTrackingListResponseDto(
      records.map((r) => new ReliabilityTrackingResponseDto(r)),
      records.length,
    );
  }

  /**
   * Get accuracy report for a source
   * GET /reliability/source/:sourceId/accuracy
   */
  @Get('source/:sourceId/accuracy')
  @ApiOperation({ summary: 'Get accuracy report for a news source' })
  @ApiParam({ name: 'sourceId', type: 'number', description: 'Source ID' })
  @ApiResponse({
    status: 200,
    description: 'Accuracy report for the source',
  })
  async getSourceAccuracy(
    @Param('sourceId', ParseIntPipe) sourceId: number,
  ): Promise<{
    totalPredictions: number;
    correctDirectionPredictions: number;
    averageAccuracy: number;
  }> {
    return await this.newsReliabilityService.getSourceAccuracyReport(sourceId);
  }
}

