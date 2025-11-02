import {
  StringField,
  NumberField,
  EnumField,
} from '../../../../common/decorators/field.decorator';
import { FeedTypeEnum } from '../enums/feed-type.enum';

export const SaveFeedMapping = {
  id: () => NumberField('Feed ID (optional, for updates)', 1, false),
  url: () => StringField('Feed URL', 'https://www.borsagundem.com.tr/rss/sirket-haberleri', true, 10, 1000),
  title: () => StringField('Feed title', 'Sample News Title', true, 1, 500),
  text: () => StringField('Feed content/text', 'This is the full content of the feed item...', false, 0, 50000),
  source: () => StringField('Feed source name', 'Borsa Gündem', true, 1, 255),
  feedType: () => EnumField(FeedTypeEnum, 'Feed type (1=News, 2=Internet, 3=Forum, 4=Twitter)', FeedTypeEnum.NEWS, true),
};

