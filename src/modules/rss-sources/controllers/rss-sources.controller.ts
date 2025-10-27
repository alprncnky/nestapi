import { Query, Body, ParseIntPipe } from '@nestjs/common';
import { CrudController } from '../../../common/decorators/crud-controller.decorator';
import { SaveEndpoint, GetEndpoint, GetListEndpoint, DeleteEndpoint } from '../../../common/decorators/endpoint.decorator';
import { BaseController } from '../../../common/base/base-controller';
import { CriteriaDto } from '../../../common/dto/criteria.dto';
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
    return super.save(dto);
  }

  @GetEndpoint('RssSource', RssSourceResponseDto)
  async get(@Query('id', ParseIntPipe) id: number): Promise<RssSourceResponseDto> {
    return super.get(id);
  }

  @GetListEndpoint('RssSource', CriteriaDto, RssSourceListResponseDto)
  async getList(@Body() criteriaDto: CriteriaDto): Promise<RssSourceListResponseDto> {
    return super.getList(criteriaDto);
  }

  @DeleteEndpoint('RssSource')
  async delete(@Query('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return super.delete(id);
  }
}

