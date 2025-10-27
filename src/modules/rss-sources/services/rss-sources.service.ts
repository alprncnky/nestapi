import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { RssSource } from '../entities/rss-source.entity';
import { SaveRssSourceDto } from '../dto/save-rss-source.dto';
import { RssSourceRepository } from '../repositories/rss-source.repository';

@Injectable()
export class RssSourcesService {
  constructor(private readonly rssSourceRepository: RssSourceRepository) {}

  async save(saveRssSourceDto: SaveRssSourceDto): Promise<RssSource> {
    const id = saveRssSourceDto.id;

    if (id) {
      // Update existing RSS source
      const source = await this.rssSourceRepository.findById(id);
      if (!source) {
        throw new NotFoundException(`RSS Source with ID ${id} not found`);
      }

      // Validate URL uniqueness if changed
      if (saveRssSourceDto.url && saveRssSourceDto.url !== source.url) {
        await this.validateUniqueUrl(saveRssSourceDto.url, id);
      }

      Object.assign(source, { ...saveRssSourceDto, updatedAt: new Date() });
      return await this.rssSourceRepository.save(source);
    } else {
      // Create new RSS source
      await this.validateUniqueUrl(saveRssSourceDto.url);

      const rssSource = new RssSource();
      Object.assign(rssSource, {
        ...saveRssSourceDto,
        reliabilityScore: saveRssSourceDto.reliabilityScore ?? 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return await this.rssSourceRepository.save(rssSource);
    }
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

  private async validateUniqueUrl(url: string, excludeId?: number): Promise<void> {
    const existingSource = await this.rssSourceRepository.findByUrl(url);
    if (existingSource && existingSource.id !== excludeId) {
      throw new ConflictException(`RSS source with URL "${url}" already exists`);
    }
  }
}

