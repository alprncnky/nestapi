import { Query, Body, ParseIntPipe } from '@nestjs/common';
import { CrudController } from '../../../common/decorators/crud-controller.decorator';
import { SaveEndpoint, GetEndpoint, GetListEndpoint, DeleteEndpoint } from '../../../common/decorators/endpoint.decorator';
import { BaseController } from '../../../common/base/base-controller';
import { Feed } from '../data/entities/feed.entity';
import { SaveFeedDto } from '../contracts/requests/save-feed.dto';
import { FeedResponseDto } from '../contracts/responses/feed-response.dto';
import { FeedListResponseDto } from '../contracts/responses/feed-list-response.dto';
import { FeedService } from '../business/services/feed.service';
import { FeedRepository } from '../data/repositories/feed.repository';
import { CriteriaDto } from '../../../common/dto/criteria.dto';

@CrudController('feeds', 'Feed')
export class FeedController extends BaseController<Feed, SaveFeedDto, SaveFeedDto, FeedResponseDto, FeedListResponseDto> {
  constructor(
    private readonly feedService: FeedService,
    private readonly feedRepository: FeedRepository,
  ) {
    super(feedService, feedRepository, FeedResponseDto, FeedListResponseDto, 'Feed', SaveFeedDto);
  }

  @SaveEndpoint(SaveFeedDto, FeedResponseDto)
  async save(@Body() dto: SaveFeedDto): Promise<FeedResponseDto> {
    return super.save(dto);
  }

  @GetEndpoint('Feed', FeedResponseDto)
  async get(@Query('id', ParseIntPipe) id: number): Promise<FeedResponseDto> {
    return super.get(id);
  }

  @GetListEndpoint('Feed', CriteriaDto, FeedListResponseDto)
  async getList(@Body() criteriaDto: CriteriaDto): Promise<FeedListResponseDto> {
    return super.getList(criteriaDto);
  }

  @DeleteEndpoint('Feed')
  async delete(@Query('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return super.delete(id);
  }
}

