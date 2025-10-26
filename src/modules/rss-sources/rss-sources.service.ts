import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RssSource } from './entities/rss-source.entity';
import { CreateRssSourceDto } from './dto/create-rss-source.dto';
import { UpdateRssSourceDto } from './dto/update-rss-source.dto';
import { SourceCategoryEnum } from './enums/source-category.enum';

/**
 * Service for RSS Source operations
 * Handles business logic and validation for RSS feed sources
 */
@Injectable()
export class RssSourcesService {
  constructor(
    @InjectRepository(RssSource)
    private readonly rssSourceRepository: Repository<RssSource>,
  ) {}

  /**
   * Create a new RSS source
   */
  async create(createRssSourceDto: CreateRssSourceDto): Promise<RssSource> {
    // 1. Validation - Check for duplicate URL
    await this.validateUniqueUrl(createRssSourceDto.url);

    // 2. Business logic - Create entity
    const rssSource = new RssSource();
    Object.assign(rssSource, {
      ...createRssSourceDto,
      reliabilityScore: 50, // Default starting score
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Repository operation
    return await this.rssSourceRepository.save(rssSource);
  }

  /**
   * Find all RSS sources
   */
  async findAll(): Promise<RssSource[]> {
    return await this.rssSourceRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find one RSS source by ID
   */
  async findOne(id: number): Promise<RssSource> {
    const source = await this.rssSourceRepository.findOne({
      where: { id },
    });

    if (!source) {
      throw new NotFoundException(`RSS Source with ID ${id} not found`);
    }

    return source;
  }

  /**
   * Find active RSS sources by category
   */
  async findActiveSourcesByCategory(
    category: SourceCategoryEnum,
  ): Promise<RssSource[]> {
    return await this.rssSourceRepository.find({
      where: {
        category,
        isActive: true,
      },
      order: { reliabilityScore: 'DESC' },
    });
  }

  /**
   * Find all active RSS sources
   */
  async findActiveSources(): Promise<RssSource[]> {
    return await this.rssSourceRepository.find({
      where: { isActive: true },
      order: { reliabilityScore: 'DESC' },
    });
  }

  /**
   * Update an RSS source
   */
  async update(
    id: number,
    updateRssSourceDto: UpdateRssSourceDto,
  ): Promise<RssSource> {
    // 1. Check if source exists
    const source = await this.findOne(id);

    // 2. Validation - Check for duplicate URL if URL is being updated
    if (updateRssSourceDto.url && updateRssSourceDto.url !== source.url) {
      await this.validateUniqueUrl(updateRssSourceDto.url);
    }

    // 3. Update entity
    Object.assign(source, {
      ...updateRssSourceDto,
      updatedAt: new Date(),
    });

    // 4. Save
    return await this.rssSourceRepository.save(source);
  }

  /**
   * Update last fetch time
   */
  async updateLastFetchTime(id: number): Promise<void> {
    await this.rssSourceRepository.update(id, {
      lastFetchedAt: new Date(),
    });
  }

  /**
   * Update reliability score
   */
  async updateReliabilityScore(
    sourceId: number,
    score: number,
  ): Promise<void> {
    if (score < 0 || score > 100) {
      throw new BadRequestException('Reliability score must be between 0 and 100');
    }

    await this.rssSourceRepository.update(sourceId, {
      reliabilityScore: score,
    });
  }

  /**
   * Remove an RSS source
   */
  async remove(id: number): Promise<void> {
    const source = await this.findOne(id);
    await this.rssSourceRepository.remove(source);
  }

  /**
   * Private: Validate unique URL
   */
  private async validateUniqueUrl(url: string): Promise<void> {
    const existingSource = await this.rssSourceRepository.findOne({
      where: { url },
    });

    if (existingSource) {
      throw new ConflictException(`RSS source with URL "${url}" already exists`);
    }
  }
}

