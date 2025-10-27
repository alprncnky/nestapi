import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../../common/base/base-repository';
import { NewsArticle } from '../entities/news-article.entity';
import { NewsStatusEnum } from '../../contracts/enums/news-status.enum';
import { NewsCategoryEnum } from '../../contracts/enums/news-category.enum';

@Injectable()
export class NewsArticleRepository extends BaseRepository<NewsArticle> {
  constructor(@InjectRepository(NewsArticle) repository: Repository<NewsArticle>) {
    super(repository);
  }

  async findByUrl(url: string): Promise<NewsArticle | null> {
    return await this.findOne({ url } as any);
  }

  async findByGuid(guid: string): Promise<NewsArticle | null> {
    return await this.findOne({ guid } as any);
  }

  async findByStatus(status: NewsStatusEnum): Promise<NewsArticle[]> {
    return await this.findBy({ status } as any, { order: { publishedAt: 'DESC' } });
  }

  async findByCategory(category: NewsCategoryEnum): Promise<NewsArticle[]> {
    return await this.findBy({ mainCategory: category } as any, { order: { publishedAt: 'DESC' } });
  }

  async findRecent(limit: number = 100): Promise<NewsArticle[]> {
    return await this.repository.find({
      order: { publishedAt: 'DESC' },
      take: limit,
    });
  }

  async findBySourceId(sourceId: number): Promise<NewsArticle[]> {
    return await this.findBy({ sourceId } as any, { order: { publishedAt: 'DESC' } });
  }

  async countByStatus(status: NewsStatusEnum): Promise<number> {
    return await this.count({ status } as any);
  }

  async countByCategory(category: NewsCategoryEnum): Promise<number> {
    return await this.count({ mainCategory: category } as any);
  }
}
