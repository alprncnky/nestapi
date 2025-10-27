import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../../common/base/base-dto';
import { EntityTypeEnum } from '../enums/entity-type.enum';

export class ExtractedItemResponseDto extends BaseResponseDto {
  @ApiProperty({ description: 'Article ID', example: 1 })
  articleId: number;

  @ApiProperty({ description: 'Entity type', example: 'ORGANIZATION', enum: EntityTypeEnum })
  entityType: string;

  @ApiProperty({ description: 'Entity text as found in article', example: 'Apple Inc.' })
  entityText: string;

  @ApiProperty({ description: 'Normalized entity value', example: 'AAPL', required: false })
  normalizedValue?: string;

  @ApiProperty({ description: 'Position in text', example: 150, required: false })
  position?: number;

  @ApiProperty({ description: 'AI confidence score (0-1)', example: 0.95 })
  confidence: number;
}

