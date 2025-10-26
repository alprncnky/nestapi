import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { RssSource } from '../entities/rss-source.entity';
import { CreateRssSourceDto } from '../dto/create-rss-source.dto';
import { UpdateRssSourceDto } from '../dto/update-rss-source.dto';
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

  async update(id: number, updateRssSourceDto: UpdateRssSourceDto): Promise<RssSource> {
    const source = await this.rssSourceRepository.findById(id);
    if (!source) {
      throw new NotFoundException(`RSS Source with ID ${id} not found`);
    }

    if (updateRssSourceDto.url && updateRssSourceDto.url !== source.url) {
      await this.validateUniqueUrl(updateRssSourceDto.url);
    }

    Object.assign(source, { ...updateRssSourceDto, updatedAt: new Date() });
    return await this.rssSourceRepository.save(source);
  }

  async updateLastFetchTime(id: number): Promise<void> {
    await this.rssSourceRepository.update(id, { lastFetchedAt: new Date() } as any);
  }

  async updateReliabilityScore(sourceId: number, score: number): Promise<void> {
    if (score < 0 || score > 100) {
      throw new BadRequestException('Reliability score must be between 0 and 100');
    }
    await this.rssSourceRepository.update(sourceId, { reliabilityScore: score } as any);
  }

  async remove(id: number): Promise<void> {
    const source = await this.rssSourceRepository.findById(id);
    if (!source) {
      throw new NotFoundException(`RSS Source with ID ${id} not found`);
    }
    await this.rssSourceRepository.remove(source);
  }

  private async validateUniqueUrl(url: string): Promise<void> {
    const existingSource = await this.rssSourceRepository.findByUrl(url);
    if (existingSource) {
      throw new ConflictException(`RSS source with URL "${url}" already exists`);
    }
  }
}

