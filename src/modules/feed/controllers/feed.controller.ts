import { CrudResource } from '../../../common/decorators/crud-resource.decorator';
import { BaseController } from '../../../common/base/base-controller';
import { Feed } from '../data/entities/feed.entity';
import { SaveFeedDto } from '../contracts/requests/save-feed.dto';
import { FeedResponseDto } from '../contracts/responses/feed-response.dto';
import { FeedListResponseDto } from '../contracts/responses/feed-list-response.dto';
import { FeedService } from '../business/services/feed.service';
import { FeedRepository } from '../data/repositories/feed.repository';

@CrudResource({path: 'feeds', entityName: 'Feed', entity: Feed, requestDto: SaveFeedDto, responseDto: FeedResponseDto, listResponseDto: FeedListResponseDto})
export class FeedController extends BaseController<Feed, SaveFeedDto, SaveFeedDto, FeedResponseDto, FeedListResponseDto> {
  constructor(
    private readonly feedService: FeedService,
    private readonly feedRepository: FeedRepository,
  ) {
    super({
      service: feedService,
      repository: feedRepository,
      responseClass: FeedResponseDto,
      listResponseClass: FeedListResponseDto,
      entityName: 'Feed',
      requestClass: SaveFeedDto,
    });
  }

}

