import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../../common/base/base-dto';
import { NewsCategoryEnum } from '../enums/news-category.enum';
import { ImpactLevelEnum } from '../enums/impact-level.enum';
import { NewsStatusEnum } from '../enums/news-status.enum';

/**
 * Response DTO for News Article
 * Auto-mapping provided by BaseResponseDto constructor
 */
export class NewsArticleResponseDto extends BaseResponseDto {
  @ApiProperty({ description: 'RSS source ID', example: 1 })
  sourceId: number;

  @ApiProperty({ description: 'Article title', example: 'Breaking: Major Market Movement' })
  title: string;

  @ApiProperty({ description: 'Article URL', example: 'https://example.com/news/123' })
  url: string;

  @ApiProperty({ description: 'Article GUID', example: 'unique-guid-123' })
  guid: string;

  @ApiProperty({ description: 'Article summary', example: 'Brief summary of the news', required: false })
  summary?: string;

  @ApiProperty({ description: 'Full article content', example: 'Full content of the article...', required: false })
  content?: string;

  @ApiProperty({ description: 'Publication date', example: '2024-01-01T00:00:00Z' })
  publishedAt: Date;

  @ApiProperty({ description: 'Article image URL', example: 'https://example.com/image.jpg', required: false })
  imageUrl?: string;

  @ApiProperty({ description: 'News category', example: 'COMPANY_NEWS', enum: NewsCategoryEnum, required: false })
  category?: string;

  @ApiProperty({ description: 'Sentiment score (-1 to 1)', example: 0.75, required: false })
  sentimentScore?: number;

  @ApiProperty({ description: 'Impact level', example: 'HIGH', enum: ImpactLevelEnum, required: false })
  impactLevel?: string;

  @ApiProperty({ description: 'Processing status', example: 'PROCESSED', enum: NewsStatusEnum })
  status: string;
}

