import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../../common/base/base-repository';
import { Feed } from '../entities/feed.entity';
import { FeedSchema } from '../schemas/feed.schema';
import { FeedTypeEnum } from '../../contracts/enums/feed-type.enum';

@Injectable()
export class FeedRepository extends BaseRepository<Feed> {
  constructor(@InjectRepository(FeedSchema) repository: Repository<Feed>) {
    super(repository);
  }

  /**
   * Find feed by URL
   */
  async findByUrl(url: string): Promise<Feed | null> {
    return await this.findOne({ url } as any);
  }

  /**
   * Find feeds by source name
   */
  async findBySource(source: string): Promise<Feed[]> {
    return await this.findBy({ source } as any, { order: { createdAt: 'DESC' } });
  }

  /**
   * Find feeds by type
   */
  async findByType(feedType: FeedTypeEnum): Promise<Feed[]> {
    return await this.findBy({ feedType } as any, { order: { createdAt: 'DESC' } });
  }

  /**
   * Find recent feeds (last N days)
   */
  async findRecent(days: number = 7): Promise<Feed[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return await this.repository
      .createQueryBuilder('feed')
      .where('feed.fetchedAt >= :date', { date })
      .orderBy('feed.fetchedAt', 'DESC')
      .getMany();
  }

  /**
   * Count feeds by type
   */
  async countByType(feedType: FeedTypeEnum): Promise<number> {
    return await this.count({ feedType } as any);
  }

  /**
   * Save multiple feeds in batch
   */
  async saveBatch(feeds: Feed[]): Promise<Feed[]> {
    return await this.repository.save(feeds);
  }
}

