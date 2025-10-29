import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../../common/base/base-repository';
import { NewsCluster } from '../entities/news-cluster.entity';
import { ClusterTypeEnum } from '../../contracts/enums/cluster-type.enum';

@Injectable()
export class NewsClusterRepository extends BaseRepository<NewsCluster> {
  constructor(@InjectRepository(NewsCluster) repository: Repository<NewsCluster>) {
    super(repository);
  }

  async findByArticleId(articleId: number): Promise<NewsCluster | null> {
    return await this.repository
      .createQueryBuilder('cluster')
      .where('cluster.articleIds @> :articleId', { articleId: JSON.stringify(articleId) })
      .getOne();
  }

  async findByClusterType(clusterType: ClusterTypeEnum): Promise<NewsCluster[]> {
    return await this.findBy({ clusterType } as any);
  }

  async findHighScoreClusters(minScore: number = 70): Promise<NewsCluster[]> {
    return await this.repository
      .createQueryBuilder('cluster')
      .where('cluster.clusterScore >= :minScore', { minScore })
      .orderBy('cluster.clusterScore', 'DESC')
      .getMany();
  }

  async findByMainArticleId(mainArticleId: number): Promise<NewsCluster[]> {
    return await this.findBy({ mainArticleId } as any);
  }

  async findRecentClusters(days: number = 7): Promise<NewsCluster[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await this.repository
      .createQueryBuilder('cluster')
      .where('cluster.createdAt >= :startDate', { startDate })
      .orderBy('cluster.createdAt', 'DESC')
      .getMany();
  }
}
