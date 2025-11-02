import { ResponseFieldConfig } from '../../../../common/interfaces/response-field-config.interface';
import { FeedTypeEnum } from '../enums/feed-type.enum';

export const FeedResponseMapping: Record<string, ResponseFieldConfig> = {
  url: { description: 'Feed URL', example: 'https://www.borsagundem.com.tr/rss/sirket-haberleri', required: true, type: String },
  title: { description: 'Feed title', example: 'Sample News Title', required: true, type: String },
  text: { description: 'Feed content/text', example: 'This is the full content of the feed item...', required: false, type: String },
  source: { description: 'Feed source name', example: 'Borsa Gündem', required: true, type: String },
  feedType: { description: 'Feed type (1=News, 2=Internet, 3=Forum, 4=Twitter)', example: FeedTypeEnum.NEWS, required: true, enum: FeedTypeEnum },
  fetchedAt: { description: 'Timestamp when feed was fetched', example: '2025-11-02T10:30:00Z', required: true, type: Date },
};

