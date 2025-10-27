import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsTag } from '../../data/entities/news-tag.entity';
import { NewsArticleTag } from '../../data/entities/news-article-tag.entity';
import { CreateNewsTagDto } from '../../contracts/requests/create-news-tag.dto';
import { UpdateNewsTagDto } from '../../contracts/requests/update-news-tag.dto';
import { TagTypeEnum } from '../../contracts/enums/tag-type.enum';

/**
 * Service for News Tag operations
 * Handles tag CRUD and article-tag associations
 */
@Injectable()
export class NewsTagsService {
  constructor(
    @InjectRepository(NewsTag)
    private readonly newsTagRepository: Repository<NewsTag>,
    @InjectRepository(NewsArticleTag)
    private readonly articleTagRepository: Repository<NewsArticleTag>,
  ) {}

  /**
   * Create a new tag
   */
  async create(createNewsTagDto: CreateNewsTagDto): Promise<NewsTag> {
    // Validate unique name
    await this.validateUniqueName(createNewsTagDto.name);

    const tag = new NewsTag();
    Object.assign(tag, {
      ...createNewsTagDto,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.newsTagRepository.save(tag);
  }

  /**
   * Find all tags
   */
  async findAll(): Promise<NewsTag[]> {
    return await this.newsTagRepository.find({
      order: { usageCount: 'DESC' },
    });
  }

  /**
   * Find one tag by ID
   */
  async findOne(id: number): Promise<NewsTag> {
    const tag = await this.newsTagRepository.findOne({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`News Tag with ID ${id} not found`);
    }

    return tag;
  }

  /**
   * Find tags by type
   */
  async findByType(type: TagTypeEnum): Promise<NewsTag[]> {
    return await this.newsTagRepository.find({
      where: { tagType: type },
      order: { usageCount: 'DESC' },
    });
  }

  /**
   * Find or create a tag by name and type
   */
  async findOrCreate(name: string, type: TagTypeEnum): Promise<NewsTag> {
    const existing = await this.newsTagRepository.findOne({
      where: { name },
    });

    if (existing) {
      return existing;
    }

    return await this.create({ name, type });
  }

  /**
   * Attach tags to an article
   */
  async attachTagsToArticle(
    articleId: number,
    tagIds: number[],
  ): Promise<void> {
    for (const tagId of tagIds) {
      // Check if association already exists
      const existing = await this.articleTagRepository.findOne({
        where: { articleId, tagId },
      });

      if (!existing) {
        const articleTag = new NewsArticleTag();
        Object.assign(articleTag, {
          articleId,
          tagId,
          confidence: 1.0,
          detectionMethod: 'AUTO',
          createdAt: new Date(),
        });

        await this.articleTagRepository.save(articleTag);
        await this.incrementUsageCount(tagId);
      }
    }
  }

  /**
   * Get popular tags
   */
  async getPopularTags(limit: number = 10): Promise<NewsTag[]> {
    return await this.newsTagRepository.find({
      order: { usageCount: 'DESC' },
      take: limit,
    });
  }

  /**
   * Increment usage count
   */
  async incrementUsageCount(tagId: number): Promise<void> {
    await this.newsTagRepository.increment(
      { id: tagId },
      'usageCount',
      1,
    );
  }

  /**
   * Update a tag
   */
  async update(
    id: number,
    updateNewsTagDto: UpdateNewsTagDto,
  ): Promise<NewsTag> {
    const tag = await this.findOne(id);

    // Validate unique name if name is being updated
    if (updateNewsTagDto.name && updateNewsTagDto.name !== tag.name) {
      await this.validateUniqueName(updateNewsTagDto.name);
    }

    Object.assign(tag, {
      ...updateNewsTagDto,
      updatedAt: new Date(),
    });

    return await this.newsTagRepository.save(tag);
  }

  /**
   * Remove a tag
   */
  async remove(id: number): Promise<void> {
    const tag = await this.findOne(id);
    await this.newsTagRepository.remove(tag);
  }

  /**
   * Private: Validate unique name
   */
  private async validateUniqueName(name: string): Promise<void> {
    const existing = await this.newsTagRepository.findOne({
      where: { name },
    });

    if (existing) {
      throw new ConflictException(`Tag with name "${name}" already exists`);
    }
  }
}

