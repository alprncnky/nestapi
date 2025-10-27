import { Body } from '@nestjs/common';
import { CrudController } from '../../../common/decorators/crud-controller.decorator';
import { SaveEndpoint } from '../../../common/decorators/endpoint.decorator';
import { BaseController } from '../../../common/base/base-controller';
import { RssSource } from '../entities/rss-source.entity';
import { SaveRssSourceDto } from '../dto/save-rss-source.dto';
import { RssSourceResponseDto } from '../responses/rss-source-response.dto';
import { RssSourceListResponseDto } from '../responses/rss-source-list-response.dto';
import { RssSourcesService } from '../services/rss-sources.service';
import { RssSourceRepository } from '../repositories/rss-source.repository';

@CrudController('rss-sources', 'RssSource')
export class RssSourcesController extends BaseController<RssSource, SaveRssSourceDto, SaveRssSourceDto, RssSourceResponseDto, RssSourceListResponseDto> {
  constructor(
    private readonly rssSourcesService: RssSourcesService,
    private readonly rssSourceRepository: RssSourceRepository,
  ) {
    super(
      rssSourcesService,
      rssSourceRepository,
      RssSourceResponseDto,
      RssSourceListResponseDto,
      'RssSource',
      SaveRssSourceDto,
    );
  }

  @SaveEndpoint(SaveRssSourceDto, RssSourceResponseDto)
  async save(@Body() dto: SaveRssSourceDto): Promise<RssSourceResponseDto> {
    return this.saveEntity(dto);
  }
}

