import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Body,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CrudController } from '../../common/decorators/crud-controller.decorator';
import { BaseController } from '../../common/base/base-controller';
import { NewsArticle } from './entities/news-article.entity';
import { CreateNewsArticleDto } from './dto/create-news-article.dto';
import { UpdateNewsArticleDto } from './dto/update-news-article.dto';
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
  CreateNewsArticleDto,
  UpdateNewsArticleDto,
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

  /**
   * Get news articles by category
   * GET /news/category/:category
   */
  @Get('category/:category')
  @ApiOperation({ summary: 'Get news articles by category' })
  @ApiParam({
    name: 'category',
    enum: NewsCategoryEnum,
    description: 'News category',
  })
  @ApiResponse({
    status: 200,
    description: 'List of news articles in the specified category',
    type: NewsArticleListResponseDto,
  })
  async getByCategory(
    @Param('category', new ParseEnumPipe(NewsCategoryEnum))
    category: NewsCategoryEnum,
  ): Promise<NewsArticleListResponseDto> {
    const articles = await this.newsService.findByCategory(category);
    return new NewsArticleListResponseDto(
      articles.map((article) => new NewsArticleResponseDto(article)),
      articles.length,
    );
  }

  /**
   * Get news articles by status
   * GET /news/status/:status
   */
  @Get('status/:status')
  @ApiOperation({ summary: 'Get news articles by processing status' })
  @ApiParam({
    name: 'status',
    enum: NewsStatusEnum,
    description: 'Processing status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of news articles with the specified status',
    type: NewsArticleListResponseDto,
  })
  async getByStatus(
    @Param('status', new ParseEnumPipe(NewsStatusEnum))
    status: NewsStatusEnum,
  ): Promise<NewsArticleListResponseDto> {
    const articles = await this.newsService.findByStatus(status);
    return new NewsArticleListResponseDto(
      articles.map((article) => new NewsArticleResponseDto(article)),
      articles.length,
    );
  }

  /**
   * Get tags for a specific article
   * GET /news/:id/tags
   */
  @Get(':id/tags')
  @ApiOperation({ summary: 'Get tags for a specific news article' })
  @ApiParam({ name: 'id', type: 'number', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'List of tags for the article',
    type: NewsTagListResponseDto,
  })
  async getArticleTags(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NewsTagListResponseDto> {
    // Verify article exists
    await this.newsService.findOne(id);

    // For now, return empty list - tags will be populated by NLP processing
    return new NewsTagListResponseDto([], 0);
  }

  /**
   * Get stock mentions for a specific article
   * GET /news/:id/stocks
   */
  @Get(':id/stocks')
  @ApiOperation({ summary: 'Get stock mentions for a specific news article' })
  @ApiParam({ name: 'id', type: 'number', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'List of stock mentions in the article',
    type: StockMentionListResponseDto,
  })
  async getArticleStocks(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StockMentionListResponseDto> {
    const mentions = await this.stockMentionsService.findByArticle(id);
    return new StockMentionListResponseDto(
      mentions.map((mention) => new StockMentionResponseDto(mention)),
      mentions.length,
    );
  }

  /**
   * Get extracted entities for a specific article
   * GET /news/:id/entities
   */
  @Get(':id/entities')
  @ApiOperation({
    summary: 'Get extracted entities (NER results) for a specific news article',
  })
  @ApiParam({ name: 'id', type: 'number', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'List of extracted entities from the article',
    type: ExtractedItemListResponseDto,
  })
  async getExtractedEntities(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ExtractedItemListResponseDto> {
    const items = await this.extractedItemsService.findByArticle(id);
    return new ExtractedItemListResponseDto(
      items.map((item) => new ExtractedItemResponseDto(item)),
      items.length,
    );
  }

  /**
   * Update sentiment score for an article
   * PATCH /news/:id/sentiment
   */
  @Patch(':id/sentiment')
  @ApiOperation({ summary: 'Update sentiment score for a news article' })
  @ApiParam({ name: 'id', type: 'number', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'Sentiment updated successfully',
    type: NewsArticleResponseDto,
  })
  async updateSentiment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { sentimentScore: number },
  ): Promise<NewsArticleResponseDto> {
    await this.newsService.updateSentiment(id, dto.sentimentScore);
    const article = await this.newsService.findOne(id);
    return new NewsArticleResponseDto(article);
  }
}

