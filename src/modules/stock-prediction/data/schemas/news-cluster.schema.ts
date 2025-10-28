import { EntitySchema } from 'typeorm';
import { NewsCluster } from '../entities/news-cluster.entity';

export const NewsClusterSchema = new EntitySchema<NewsCluster>({
  name: 'NewsCluster',
  target: NewsCluster,
  tableName: 'news_clusters',
  columns: {
    id: { type: Number, primary: true, generated: true },
    clusterType: { type: String, length: 50 },
    mainArticleId: { type: Number },
    articleIds: { type: 'jsonb' },
    clusterScore: { type: 'decimal', precision: 5, scale: 2, default: 0 },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  indices: [
    { columns: ['mainArticleId'] },
    { columns: ['clusterType'] },
    { columns: ['clusterScore'] },
  ],
});
