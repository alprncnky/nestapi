import { Body } from '@nestjs/common';
import { CrudController } from '../../common/decorators/crud-controller.decorator';
import { SaveEndpoint } from '../../common/decorators/endpoint.decorator';
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
  protected getRequestClass = () => SaveReliabilityTrackingDto;

  @SaveEndpoint(SaveReliabilityTrackingDto, ReliabilityTrackingResponseDto)
  async save(@Body() dto: SaveReliabilityTrackingDto): Promise<ReliabilityTrackingResponseDto> {
    return this.saveEntity(dto);
  }
}

