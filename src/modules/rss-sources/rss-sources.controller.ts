import { Param, ParseEnumPipe, ParseIntPipe } from '@nestjs/common';
import { CrudController } from '../../common/decorators/crud-controller.decorator';
import {
  GetActiveEndpoint,
  GetByCategoryEndpoint,
  UpdateFieldEndpoint,
} from '../../common/decorators/endpoint.decorator';
import { BaseController } from '../../common/base/base-controller';
import { RssSource } from './entities/rss-source.entity';
import { CreateRssSourceDto } from './dto/create-rss-source.dto';
import { UpdateRssSourceDto } from './dto/update-rss-source.dto';
import { RssSourceResponseDto } from './responses/rss-source-response.dto';
import { RssSourceListResponseDto } from './responses/rss-source-list-response.dto';
import { RssSourcesService } from './rss-sources.service';
import { SourceCategoryEnum } from './enums/source-category.enum';

/**
 * Controller for RSS Source endpoints
 * Extends BaseController for automatic CRUD operations
 * Provides additional custom endpoints for RSS source management
 */
@CrudController('rss-sources', 'RssSource')
export class RssSourcesController extends BaseController<
  RssSource,
  CreateRssSourceDto,
  UpdateRssSourceDto,
  RssSourceResponseDto,
  RssSourceListResponseDto
> {
  constructor(private readonly rssSourcesService: RssSourcesService) {
    super(rssSourcesService);
  }

  // Implement abstract methods
  protected getResponseClass = () => RssSourceResponseDto;
  protected getListResponseClass = () => RssSourceListResponseDto;
  protected getEntityName = () => 'RssSource';

  /**
   * Get all active RSS sources
   * GET /rss-sources/active
   */
  @GetActiveEndpoint('RssSource', RssSourceListResponseDto)
  async getActiveSources(): Promise<RssSourceListResponseDto> {
    const sources = await this.rssSourcesService.findActiveSources();
    return new RssSourceListResponseDto(sources.map((source) => new RssSourceResponseDto(source)), sources.length);
  }

  /**
   * Get RSS sources by category
   * GET /rss-sources/category/:category
   */
  @GetByCategoryEndpoint('RssSource', RssSourceListResponseDto, SourceCategoryEnum)
  async getByCategory(@Param('category', new ParseEnumPipe(SourceCategoryEnum)) category: SourceCategoryEnum): Promise<RssSourceListResponseDto> {
    const sources = await this.rssSourcesService.findActiveSourcesByCategory(category);
    return new RssSourceListResponseDto(sources.map((source) => new RssSourceResponseDto(source)), sources.length);
  }

  /**
   * Update reliability score for a source
   * PATCH /rss-sources/:id/reliability/:score
   */
  @UpdateFieldEndpoint('RssSource', 'reliability', RssSourceResponseDto)
  async updateReliability(@Param('id', ParseIntPipe) id: number, @Param('reliability', ParseIntPipe) score: number): Promise<RssSourceResponseDto> {
    await this.rssSourcesService.updateReliabilityScore(id, score);
    return new RssSourceResponseDto(await this.rssSourcesService.findOne(id));
  }
}

