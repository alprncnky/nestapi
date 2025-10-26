import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { NewsArticle } from './entities/news-article.entity';
import { CreateNewsArticleDto } from './dto/create-news-article.dto';
import { UpdateNewsArticleDto } from './dto/update-news-article.dto';
import { NewsCategoryEnum } from './enums/news-category.enum';
import { ImpactLevelEnum } from './enums/impact-level.enum';
import { NewsStatusEnum } from './enums/news-status.enum';

/**
 * Service for News Article operations
 * Handles business logic and validation for news articles
 */
@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsArticle)
    private readonly newsRepository: Repository<NewsArticle>,
  ) {}

  /**
   * Create a new news article
   */
  async create(createNewsArticleDto: CreateNewsArticleDto): Promise<NewsArticle> {
    // 1. Validation - Check for duplicate URL
    await this.validateUniqueUrl(createNewsArticleDto.url);
    await this.validateUniqueGuid(createNewsArticleDto.guid);

    // 2. Business logic - Create entity
    const article = new NewsArticle();
    Object.assign(article, {
      ...createNewsArticleDto,
      status: NewsStatusEnum.PENDING,
      scrapedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Repository operation
    return await this.newsRepository.save(article);
  }

  /**
   * Find all news articles
   */
  async findAll(): Promise<NewsArticle[]> {
    return await this.newsRepository.find({
      order: { publishedAt: 'DESC' },
      take: 100, // Limit to 100 most recent
    });
  }

  /**
   * Find one news article by ID
   */
  async findOne(id: number): Promise<NewsArticle> {
    const article = await this.newsRepository.findOne({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException(`News Article with ID ${id} not found`);
    }

    return article;
  }

  /**
   * Find articles by category
   */
  async findByCategory(category: NewsCategoryEnum): Promise<NewsArticle[]> {
    return await this.newsRepository.find({
      where: { mainCategory: category },
      order: { publishedAt: 'DESC' },
      take: 100,
    });
  }

  /**
   * Find articles by date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<NewsArticle[]> {
    return await this.newsRepository.find({
      where: {
        publishedAt: Between(startDate, endDate),
      },
      order: { publishedAt: 'DESC' },
    });
  }

  /**
   * Find articles by status
   */
  async findByStatus(status: NewsStatusEnum): Promise<NewsArticle[]> {
    return await this.newsRepository.find({
      where: { status },
      order: { scrapedAt: 'DESC' },
      take: 100,
    });
  }

  /**
   * Update a news article
   */
  async update(
    id: number,
    updateNewsArticleDto: UpdateNewsArticleDto,
  ): Promise<NewsArticle> {
    // 1. Check if article exists
    const article = await this.findOne(id);

    // 2. Update entity
    Object.assign(article, {
      ...updateNewsArticleDto,
      updatedAt: new Date(),
    });

    // 3. Save
    return await this.newsRepository.save(article);
  }

  /**
   * Update sentiment score
   */
  async updateSentiment(id: number, score: number): Promise<void> {
    if (score < -1 || score > 1) {
      throw new Error('Sentiment score must be between -1 and 1');
    }

    await this.newsRepository.update(id, {
      sentimentScore: score,
    });
  }

  /**
   * Update impact level
   */
  async updateImpactLevel(
    id: number,
    level: ImpactLevelEnum,
  ): Promise<void> {
    await this.newsRepository.update(id, {
      impactLevel: level,
    });
  }

  /**
   * Update processing status
   */
  async updateStatus(id: number, status: NewsStatusEnum): Promise<void> {
    await this.newsRepository.update(id, {
      status,
      updatedAt: new Date(),
    });
  }

  /**
   * Remove a news article
   */
  async remove(id: number): Promise<void> {
    const article = await this.findOne(id);
    await this.newsRepository.remove(article);
  }

  /**
   * Find article by URL (for duplicate detection)
   */
  async findByUrl(url: string): Promise<NewsArticle | null> {
    return await this.newsRepository.findOne({
      where: { url },
    });
  }

  /**
   * Find recent articles (for duplicate detection)
   */
  async findRecentArticles(hours: number): Promise<NewsArticle[]> {
    const date = new Date();
    date.setHours(date.getHours() - hours);

    return await this.newsRepository.find({
      where: {
        scrapedAt: MoreThan(date),
      },
      order: { scrapedAt: 'DESC' },
    });
  }

  /**
   * Check if URL is duplicate
   */
  async checkDuplicate(url: string): Promise<boolean> {
    const existing = await this.newsRepository.findOne({
      where: { url },
    });
    return !!existing;
  }

  /**
   * Private: Validate unique URL
   */
  private async validateUniqueUrl(url: string): Promise<void> {
    const existingArticle = await this.newsRepository.findOne({
      where: { url },
    });

    if (existingArticle) {
      throw new ConflictException(`Article with URL "${url}" already exists`);
    }
  }

  /**
   * Private: Validate unique GUID
   */
  private async validateUniqueGuid(guid: string): Promise<void> {
    const existingArticle = await this.newsRepository.findOne({
      where: { guid },
    });

    if (existingArticle) {
      throw new ConflictException(`Article with GUID "${guid}" already exists`);
    }
  }
}

