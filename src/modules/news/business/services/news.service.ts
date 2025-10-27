import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { NewsArticle } from '../../data/entities/news-article.entity';
import { SaveNewsArticleDto } from '../../contracts/requests/save-news-article.dto';
import { NewsCategoryEnum } from '../../contracts/enums/news-category.enum';
import { ImpactLevelEnum } from '../../contracts/enums/impact-level.enum';
import { NewsStatusEnum } from '../../contracts/enums/news-status.enum';

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
   * Save a news article (create or update)
   * .NET-style upsert method
   */
  async save(saveNewsArticleDto: SaveNewsArticleDto): Promise<NewsArticle> {
    const id = saveNewsArticleDto.id;

    if (id) {
      // Update existing article
      const article = await this.findOne(id);

      // Validate URL and GUID uniqueness if changed
      if (saveNewsArticleDto.url && saveNewsArticleDto.url !== article.url) {
        await this.validateUniqueUrl(saveNewsArticleDto.url, id);
      }
      if (saveNewsArticleDto.guid && saveNewsArticleDto.guid !== article.guid) {
        await this.validateUniqueGuid(saveNewsArticleDto.guid, id);
      }

      Object.assign(article, {
        ...saveNewsArticleDto,
        updatedAt: new Date(),
      });

      return await this.newsRepository.save(article);
    } else {
      // Create new article
      await this.validateUniqueUrl(saveNewsArticleDto.url);
      await this.validateUniqueGuid(saveNewsArticleDto.guid);

      const article = new NewsArticle();
      Object.assign(article, {
        ...saveNewsArticleDto,
        status: saveNewsArticleDto.status ?? NewsStatusEnum.PENDING,
        scrapedAt: saveNewsArticleDto.scrapedAt ?? new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return await this.newsRepository.save(article);
    }
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
  private async validateUniqueUrl(url: string, excludeId?: number): Promise<void> {
    const existingArticle = await this.newsRepository.findOne({
      where: { url },
    });

    if (existingArticle && existingArticle.id !== excludeId) {
      throw new ConflictException(`Article with URL "${url}" already exists`);
    }
  }

  /**
   * Private: Validate unique GUID
   */
  private async validateUniqueGuid(guid: string, excludeId?: number): Promise<void> {
    const existingArticle = await this.newsRepository.findOne({
      where: { guid },
    });

    if (existingArticle && existingArticle.id !== excludeId) {
      throw new ConflictException(`Article with GUID "${guid}" already exists`);
    }
  }
}

