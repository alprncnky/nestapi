import { Query, Body, ParseIntPipe } from '@nestjs/common';
import { CrudController } from '../../common/decorators/crud-controller.decorator';
import { SaveEndpoint, GetEndpoint, GetListEndpoint, DeleteEndpoint } from '../../common/decorators/endpoint.decorator';
import { BaseController } from '../../common/base/base-controller';
import { CriteriaDto } from '../../common/dto/criteria.dto';
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
    super(
      newsReliabilityService,
      undefined,
      ReliabilityTrackingResponseDto,
      ReliabilityTrackingListResponseDto,
      'ReliabilityTracking',
      SaveReliabilityTrackingDto,
    );
  }

  @SaveEndpoint(SaveReliabilityTrackingDto, ReliabilityTrackingResponseDto)
  async save(@Body() dto: SaveReliabilityTrackingDto): Promise<ReliabilityTrackingResponseDto> {
    return super.save(dto);
  }

  @GetEndpoint('ReliabilityTracking', ReliabilityTrackingResponseDto)
  async get(@Query('id', ParseIntPipe) id: number): Promise<ReliabilityTrackingResponseDto> {
    return super.get(id);
  }

  @GetListEndpoint('ReliabilityTracking', CriteriaDto, ReliabilityTrackingListResponseDto)
  async getList(@Body() criteriaDto: CriteriaDto): Promise<ReliabilityTrackingListResponseDto> {
    return super.getList(criteriaDto);
  }

  @DeleteEndpoint('ReliabilityTracking')
  async delete(@Query('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return super.delete(id);
  }
}

