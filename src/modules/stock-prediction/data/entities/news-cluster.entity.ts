import { AutoEntity } from '../../../../common/decorators/auto-entity.decorator';

@AutoEntity()
export class NewsCluster {
  id: number;
  clusterType: string; // 'CONTENT_SIMILARITY', 'STOCK_MENTION', 'TIME_PROXIMITY'
  mainArticleId: number;
  articleIds: string; // JSON array of article IDs
  clusterScore: number; // 0-100 confidence score
  createdAt: Date;
  updatedAt: Date;
}
