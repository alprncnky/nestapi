import { EntitySchema } from 'typeorm';
import { Feed } from '../entities/feed.entity';
import { FeedTypeEnum } from '../../contracts/enums/feed-type.enum';

export const FeedSchema = new EntitySchema<Feed>({
  name: 'Feed',
  target: Feed,
  tableName: 'feeds',
  columns: {
    id: { type: Number, primary: true, generated: true },
    url: { type: String, length: 1000 },
    title: { type: String, length: 500 },
    text: { type: 'text', nullable: true },
    source: { type: String, length: 255 },
    feedType: { type: 'int' },
    fetchedAt: { type: 'timestamp' },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  indices: [
    { name: 'idx_feed_url', columns: ['url'] },
    { name: 'idx_feed_source', columns: ['source'] },
    { name: 'idx_feed_type', columns: ['feedType'] },
    { name: 'idx_feed_fetched_at', columns: ['fetchedAt'] },
    { name: 'idx_feed_created_at', columns: ['createdAt'] },
  ],
});

