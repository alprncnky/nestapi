import { Query, Body, ParseIntPipe } from '@nestjs/common';
import { CrudController } from '../../../common/decorators/crud-controller.decorator';
import { SaveEndpoint, GetEndpoint, GetListEndpoint, DeleteEndpoint } from '../../../common/decorators/endpoint.decorator';
import { BaseController } from '../../../common/base/base-controller';
import { CriteriaDto } from '../../../common/dto/criteria.dto';
import { NewsArticle } from '../data/entities/news-article.entity';
import { SaveNewsArticleDto } from '../contracts/requests/save-news-article.dto';
import { NewsArticleResponseDto } from '../contracts/responses/news-article-response.dto';
import { NewsArticleListResponseDto } from '../contracts/responses/news-article-list-response.dto';
import { NewsService } from '../business/services/news.service';
import { NewsArticleRepository } from '../data/repositories/news-article.repository';

/**
 * Controller for News Article endpoints
 * Extends BaseController for automatic CRUD operations
 * Provides additional custom endpoints for news management
 */
@CrudController('news', 'NewsArticle')
export class NewsController extends BaseController<
  NewsArticle,
  SaveNewsArticleDto,
  SaveNewsArticleDto,
  NewsArticleResponseDto,
  NewsArticleListResponseDto
> {
  constructor(
    private readonly newsService: NewsService,
    private readonly newsArticleRepository: NewsArticleRepository,
  ) {
    super(
      newsService,
      newsArticleRepository,
      NewsArticleResponseDto,
      NewsArticleListResponseDto,
      'NewsArticle',
      SaveNewsArticleDto,
    );
  }

  @SaveEndpoint(SaveNewsArticleDto, NewsArticleResponseDto)
  async save(@Body() dto: SaveNewsArticleDto): Promise<NewsArticleResponseDto> {
    return super.save(dto);
  }

  @GetEndpoint('NewsArticle', NewsArticleResponseDto)
  async get(@Query('id', ParseIntPipe) id: number): Promise<NewsArticleResponseDto> {
    return super.get(id);
  }

  @GetListEndpoint('NewsArticle', CriteriaDto, NewsArticleListResponseDto)
  async getList(@Body() criteriaDto: CriteriaDto): Promise<NewsArticleListResponseDto> {
    return super.getList(criteriaDto);
  }

  @DeleteEndpoint('NewsArticle')
  async delete(@Query('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return super.delete(id);
  }
}

