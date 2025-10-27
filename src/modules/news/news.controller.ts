import { Param, ParseEnumPipe, ParseIntPipe, Body } from '@nestjs/common';
import { CrudController } from '../../common/decorators/crud-controller.decorator';
import {
  GetByCategoryEndpoint,
  GetByStatusEndpoint,
  GetRelatedEndpoint,
  UpdateFieldEndpoint,
  SaveEndpoint,
} from '../../common/decorators/endpoint.decorator';
import { BaseController } from '../../common/base/base-controller';
import { NewsArticle } from './entities/news-article.entity';
import { SaveNewsArticleDto } from './dto/save-news-article.dto';
import { NewsArticleResponseDto } from './responses/news-article-response.dto';
import { NewsArticleListResponseDto } from './responses/news-article-list-response.dto';
import { NewsTagListResponseDto } from './responses/news-tag-list-response.dto';
import { StockMentionListResponseDto } from './responses/stock-mention-list-response.dto';
import { ExtractedItemListResponseDto } from './responses/extracted-item-list-response.dto';
import { NewsTagResponseDto } from './responses/news-tag-response.dto';
import { StockMentionResponseDto } from './responses/stock-mention-response.dto';
import { ExtractedItemResponseDto } from './responses/extracted-item-response.dto';
import { NewsService } from './news.service';
import { NewsTagsService } from './news-tags.service';
import { StockMentionsService } from './stock-mentions.service';
import { ExtractedItemsService } from './extracted-items.service';
import { NewsCategoryEnum } from './enums/news-category.enum';
import { NewsStatusEnum } from './enums/news-status.enum';

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
    private readonly newsTagsService: NewsTagsService,
    private readonly stockMentionsService: StockMentionsService,
    private readonly extractedItemsService: ExtractedItemsService,
  ) {
    super(newsService);
  }

  // Implement abstract methods
  protected getResponseClass = () => NewsArticleResponseDto;
  protected getListResponseClass = () => NewsArticleListResponseDto;
  protected getEntityName = () => 'NewsArticle';
  protected getRequestClass = () => SaveNewsArticleDto;

  // Override to apply Swagger decorators (necessary for API documentation)
  @SaveEndpoint('NewsArticle', SaveNewsArticleDto, NewsArticleResponseDto)
  async save(@Body() dto: SaveNewsArticleDto): Promise<NewsArticleResponseDto> {
    return this.saveEntity(dto);
  }

  /**
   * Get news articles by category
   * GET /news/category/:category
   */
  @GetByCategoryEndpoint('NewsArticle', NewsArticleListResponseDto, NewsCategoryEnum)
  async getByCategory(@Param('category', new ParseEnumPipe(NewsCategoryEnum)) category: NewsCategoryEnum): Promise<NewsArticleListResponseDto> {
    const articles = await this.newsService.findByCategory(category);
    return new NewsArticleListResponseDto(articles.map((article) => new NewsArticleResponseDto(article)), articles.length);
  }

  /**
   * Get news articles by status
   * GET /news/status/:status
   */
  @GetByStatusEndpoint('NewsArticle', NewsArticleListResponseDto, NewsStatusEnum)
  async getByStatus(@Param('status', new ParseEnumPipe(NewsStatusEnum)) status: NewsStatusEnum): Promise<NewsArticleListResponseDto> {
    const articles = await this.newsService.findByStatus(status);
    return new NewsArticleListResponseDto(articles.map((article) => new NewsArticleResponseDto(article)), articles.length);
  }

  /**
   * Get tags for a specific article
   * GET /news/:id/tags
   */
  @GetRelatedEndpoint('NewsArticle', 'tags', NewsTagListResponseDto)
  async getArticleTags(@Param('id', ParseIntPipe) id: number): Promise<NewsTagListResponseDto> {
    await this.newsService.findOne(id); // Verify article exists
    return new NewsTagListResponseDto([], 0); // Tags will be populated by NLP processing
  }

  /**
   * Get stock mentions for a specific article
   * GET /news/:id/stocks
   */
  @GetRelatedEndpoint('NewsArticle', 'stocks', StockMentionListResponseDto)
  async getArticleStocks(@Param('id', ParseIntPipe) id: number): Promise<StockMentionListResponseDto> {
    const mentions = await this.stockMentionsService.findByArticle(id);
    return new StockMentionListResponseDto(mentions.map((mention) => new StockMentionResponseDto(mention)), mentions.length);
  }

  /**
   * Get extracted entities for a specific article
   * GET /news/:id/entities
   */
  @GetRelatedEndpoint('NewsArticle', 'entities', ExtractedItemListResponseDto)
  async getExtractedEntities(@Param('id', ParseIntPipe) id: number): Promise<ExtractedItemListResponseDto> {
    const items = await this.extractedItemsService.findByArticle(id);
    return new ExtractedItemListResponseDto(items.map((item) => new ExtractedItemResponseDto(item)), items.length);
  }

  /**
   * Update sentiment score for an article
   * PATCH /news/:id/sentiment (expects body: { sentimentScore: number })
   */
  @UpdateFieldEndpoint('NewsArticle', 'sentiment', NewsArticleResponseDto)
  async updateSentiment(@Param('id', ParseIntPipe) id: number, @Body() dto: { sentimentScore: number }): Promise<NewsArticleResponseDto> {
    await this.newsService.updateSentiment(id, dto.sentimentScore);
    return new NewsArticleResponseDto(await this.newsService.findOne(id));
  }
}

