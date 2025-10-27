import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../../common/base/base-repository';
import { RssSource } from '../entities/rss-source.entity';
import { SourceCategoryEnum } from '../../contracts/enums/source-category.enum';

@Injectable()
export class RssSourceRepository extends BaseRepository<RssSource> {
  constructor(@InjectRepository(RssSource) repository: Repository<RssSource>) {
    super(repository);
  }

  async findByUrl(url: string): Promise<RssSource | null> {
    return await this.findOne({ url } as any);
  }

  async findActive(): Promise<RssSource[]> {
    return await this.findBy({ isActive: true } as any, { order: { reliabilityScore: 'DESC' } });
  }

  async findActiveByCategory(category: SourceCategoryEnum): Promise<RssSource[]> {
    return await this.findBy({ category, isActive: true } as any, { order: { reliabilityScore: 'DESC' } });
  }

  async countActive(): Promise<number> {
    return await this.count({ isActive: true } as any);
  }
}

