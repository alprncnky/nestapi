import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { RssSource } from '../entities/rss-source.entity';
import { CreateRssSourceDto } from '../dto/create-rss-source.dto';
import { UpdateRssSourceDto } from '../dto/update-rss-source.dto';
import { SourceCategoryEnum } from '../enums/source-category.enum';
import { RssSourceRepository } from '../repositories/rss-source.repository';

@Injectable()
export class RssSourcesService {
  constructor(private readonly rssSourceRepository: RssSourceRepository) {}

  async create(createRssSourceDto: CreateRssSourceDto): Promise<RssSource> {
    await this.validateUniqueUrl(createRssSourceDto.url);

    const rssSource = new RssSource();
    Object.assign(rssSource, {
      ...createRssSourceDto,
      reliabilityScore: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.rssSourceRepository.save(rssSource);
  }

  async findAll(): Promise<RssSource[]> {
    return await this.rssSourceRepository.findAll();
  }

  async findOne(id: number): Promise<RssSource> {
    const source = await this.rssSourceRepository.findById(id);
    if (!source) {
      throw new NotFoundException(`RSS Source with ID ${id} not found`);
    }
    return source;
  }

  async findActiveSourcesByCategory(category: SourceCategoryEnum): Promise<RssSource[]> {
    return await this.rssSourceRepository.findActiveByCategory(category);
  }

  async findActiveSources(): Promise<RssSource[]> {
    return await this.rssSourceRepository.findActive();
  }

  async update(id: number, updateRssSourceDto: UpdateRssSourceDto): Promise<RssSource> {
    const source = await this.findOne(id);

    if (updateRssSourceDto.url && updateRssSourceDto.url !== source.url) {
      await this.validateUniqueUrl(updateRssSourceDto.url);
    }

    Object.assign(source, { ...updateRssSourceDto, updatedAt: new Date() });
    return await this.rssSourceRepository.save(source);
  }

  async updateLastFetchTime(id: number): Promise<void> {
    await this.rssSourceRepository.updateLastFetchTime(id, new Date());
  }

  async updateReliabilityScore(sourceId: number, score: number): Promise<void> {
    if (score < 0 || score > 100) {
      throw new BadRequestException('Reliability score must be between 0 and 100');
    }
    await this.rssSourceRepository.updateReliabilityScore(sourceId, score);
  }

  async remove(id: number): Promise<void> {
    const source = await this.findOne(id);
    await this.rssSourceRepository.remove(source);
  }

  private async validateUniqueUrl(url: string): Promise<void> {
    const existingSource = await this.rssSourceRepository.findByUrl(url);
    if (existingSource) {
      throw new ConflictException(`RSS source with URL "${url}" already exists`);
    }
  }
}

