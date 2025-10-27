import { CrudController } from '../../common/decorators/crud-controller.decorator';
import { SaveEndpoint } from '../../common/decorators/endpoint.decorator';
import { BaseController } from '../../common/base/base-controller';
import { NewsArticle } from './entities/news-article.entity';
import { SaveNewsArticleDto } from './dto/save-news-article.dto';
import { NewsArticleResponseDto } from './responses/news-article-response.dto';
import { NewsArticleListResponseDto } from './responses/news-article-list-response.dto';
import { NewsService } from './news.service';

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
  ) {
    super(
      newsService,
      undefined,
      NewsArticleResponseDto,
      NewsArticleListResponseDto,
      'NewsArticle',
      SaveNewsArticleDto,
    );
  }

  @SaveEndpoint(SaveNewsArticleDto, NewsArticleResponseDto)
  async save(dto: SaveNewsArticleDto): Promise<NewsArticleResponseDto> {
    return super.save(dto);
  }
}

