import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RssSource } from '../entities/rss-source.entity';
import { SourceCategoryEnum } from '../enums/source-category.enum';

@Injectable()
export class RssSourceRepository {
  constructor(@InjectRepository(RssSource) private readonly repository: Repository<RssSource>) {}

  async findAll(): Promise<RssSource[]> {
    return await this.repository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: number): Promise<RssSource | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByUrl(url: string): Promise<RssSource | null> {
    return await this.repository.findOne({ where: { url } });
  }

  async findActive(): Promise<RssSource[]> {
    return await this.repository.find({
      where: { isActive: true },
      order: { reliabilityScore: 'DESC' },
    });
  }

  async findActiveByCategory(category: SourceCategoryEnum): Promise<RssSource[]> {
    return await this.repository.find({
      where: { category, isActive: true },
      order: { reliabilityScore: 'DESC' },
    });
  }

  async save(source: RssSource): Promise<RssSource> {
    return await this.repository.save(source);
  }

  async updateLastFetchTime(id: number, timestamp: Date): Promise<void> {
    await this.repository.update(id, { lastFetchedAt: timestamp });
  }

  async updateReliabilityScore(id: number, score: number): Promise<void> {
    await this.repository.update(id, { reliabilityScore: score });
  }

  async remove(source: RssSource): Promise<void> {
    await this.repository.remove(source);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async countActive(): Promise<number> {
    return await this.repository.count({ where: { isActive: true } });
  }
}

