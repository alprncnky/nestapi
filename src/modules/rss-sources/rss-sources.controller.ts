import { Controller, Get, Param, ParseEnumPipe, ParseIntPipe, Patch } from '@nestjs/common';
import { CrudController } from '../../common/decorators/crud-controller.decorator';
import { BaseController } from '../../common/base/base-controller';
import { RssSource } from './entities/rss-source.entity';
import { CreateRssSourceDto } from './dto/create-rss-source.dto';
import { UpdateRssSourceDto } from './dto/update-rss-source.dto';
import { RssSourceResponseDto } from './responses/rss-source-response.dto';
import { RssSourceListResponseDto } from './responses/rss-source-list-response.dto';
import { RssSourcesService } from './rss-sources.service';
import { SourceCategoryEnum } from './enums/source-category.enum';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

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
  @Get('active')
  @ApiOperation({ summary: 'Get all active RSS sources' })
  @ApiResponse({
    status: 200,
    description: 'List of active RSS sources',
    type: RssSourceListResponseDto,
  })
  async getActiveSources(): Promise<RssSourceListResponseDto> {
    const sources = await this.rssSourcesService.findActiveSources();
    return new RssSourceListResponseDto(
      sources.map((source) => new RssSourceResponseDto(source)),
      sources.length,
    );
  }

  /**
   * Get RSS sources by category
   * GET /rss-sources/category/:category
   */
  @Get('category/:category')
  @ApiOperation({ summary: 'Get RSS sources by category' })
  @ApiParam({
    name: 'category',
    enum: SourceCategoryEnum,
    description: 'Source category',
  })
  @ApiResponse({
    status: 200,
    description: 'List of RSS sources in the specified category',
    type: RssSourceListResponseDto,
  })
  async getByCategory(
    @Param('category', new ParseEnumPipe(SourceCategoryEnum))
    category: SourceCategoryEnum,
  ): Promise<RssSourceListResponseDto> {
    const sources =
      await this.rssSourcesService.findActiveSourcesByCategory(category);
    return new RssSourceListResponseDto(
      sources.map((source) => new RssSourceResponseDto(source)),
      sources.length,
    );
  }

  /**
   * Update reliability score for a source
   * PATCH /rss-sources/:id/reliability/:score
   */
  @Patch(':id/reliability/:score')
  @ApiOperation({ summary: 'Update reliability score for RSS source' })
  @ApiParam({ name: 'id', type: 'number', description: 'RSS Source ID' })
  @ApiParam({
    name: 'score',
    type: 'number',
    description: 'Reliability score (0-100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Reliability score updated successfully',
    type: RssSourceResponseDto,
  })
  async updateReliability(
    @Param('id', ParseIntPipe) id: number,
    @Param('score', ParseIntPipe) score: number,
  ): Promise<RssSourceResponseDto> {
    await this.rssSourcesService.updateReliabilityScore(id, score);
    const source = await this.rssSourcesService.findOne(id);
    return new RssSourceResponseDto(source);
  }
}

