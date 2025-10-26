import { Param, ParseEnumPipe, ParseIntPipe, Body, NotFoundException } from '@nestjs/common';
import { CrudController } from '../../../common/decorators/crud-controller.decorator';
import { CreateEndpoint, GetActiveEndpoint, GetByCategoryEndpoint, UpdateFieldEndpoint } from '../../../common/decorators/endpoint.decorator';
import { BaseController } from '../../../common/base/base-controller';
import { RssSource } from '../entities/rss-source.entity';
import { CreateRssSourceDto } from '../dto/create-rss-source.dto';
import { UpdateRssSourceDto } from '../dto/update-rss-source.dto';
import { RssSourceResponseDto } from '../responses/rss-source-response.dto';
import { RssSourceListResponseDto } from '../responses/rss-source-list-response.dto';
import { RssSourcesService } from '../services/rss-sources.service';
import { RssSourceRepository } from '../repositories/rss-source.repository';
import { SourceCategoryEnum } from '../enums/source-category.enum';

@CrudController('rss-sources', 'RssSource')
export class RssSourcesController extends BaseController<RssSource, CreateRssSourceDto, UpdateRssSourceDto, RssSourceResponseDto, RssSourceListResponseDto> {
  constructor(
    private readonly rssSourcesService: RssSourcesService,
    private readonly rssSourceRepository: RssSourceRepository,
  ) {
    super(rssSourcesService, rssSourceRepository);
  }

  protected getResponseClass = () => RssSourceResponseDto;
  protected getListResponseClass = () => RssSourceListResponseDto;
  protected getEntityName = () => 'RssSource';

  @CreateEndpoint('RssSource', RssSourceResponseDto)
  create(@Body() createRssSourceDto: CreateRssSourceDto) {
    return this.createEntity(createRssSourceDto);
  }

  @GetActiveEndpoint('RssSource', RssSourceListResponseDto)
  async getActiveSources(): Promise<RssSourceListResponseDto> {
    const sources = await this.rssSourceRepository.findActive();
    return new RssSourceListResponseDto(sources.map((source) => new RssSourceResponseDto(source)), sources.length);
  }

  @GetByCategoryEndpoint('RssSource', RssSourceListResponseDto, SourceCategoryEnum)
  async getByCategory(@Param('category', new ParseEnumPipe(SourceCategoryEnum)) category: SourceCategoryEnum): Promise<RssSourceListResponseDto> {
    const sources = await this.rssSourceRepository.findActiveByCategory(category);
    return new RssSourceListResponseDto(sources.map((source) => new RssSourceResponseDto(source)), sources.length);
  }

  @UpdateFieldEndpoint('RssSource', 'reliability', RssSourceResponseDto)
  async updateReliability(@Param('id', ParseIntPipe) id: number, @Param('reliability', ParseIntPipe) score: number): Promise<RssSourceResponseDto> {
    await this.rssSourcesService.updateReliabilityScore(id, score);
    const source = await this.rssSourceRepository.findById(id);
    if (!source) {
      throw new NotFoundException(`RSS Source with ID ${id} not found`);
    }
    return new RssSourceResponseDto(source);
  }
}

