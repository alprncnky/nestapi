import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../../common/base/base-dto';
import { SentimentEnum } from '../enums/sentiment.enum';

export class StockMentionResponseDto extends BaseResponseDto {
  @ApiProperty({ description: 'Article ID', example: 1 })
  articleId: number;

  @ApiProperty({ description: 'Stock symbol', example: 'AAPL' })
  stockSymbol: string;

  @ApiProperty({ description: 'Company name', example: 'Apple Inc.', required: false })
  stockName?: string;

  @ApiProperty({ description: 'Number of mentions in article', example: 3 })
  mentionCount: number;

  @ApiProperty({ description: 'Context of mention', example: 'Apple announced a new product...', required: false })
  context?: string;

  @ApiProperty({ description: 'Sentiment towards stock', example: 'POSITIVE', enum: SentimentEnum, required: false })
  sentiment?: string;

  @ApiProperty({ description: 'Sentiment score (-1 to 1)', example: 0.8, required: false })
  sentimentScore?: number;
}

