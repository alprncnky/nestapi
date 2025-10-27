import { BaseCreateDto } from '../../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../../common/decorators/auto-apply.decorator';
import { SentimentEnum } from '../enums/sentiment.enum';
import { CreateStockMentionMapping } from './mapping';

@AutoApplyDecorators(CreateStockMentionMapping)
export class CreateStockMentionDto extends BaseCreateDto {
  articleId: number;
  stockSymbol: string;
  stockName?: string;
  mentionCount?: number;
  context?: string;
  sentiment?: SentimentEnum;
  sentimentScore?: number;
}

