import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../../common/base/base-dto';
import { TagTypeEnum } from '../enums/tag-type.enum';

export class NewsTagResponseDto extends BaseResponseDto {
  @ApiProperty({ description: 'Tag name', example: 'Technology' })
  name: string;

  @ApiProperty({ description: 'Tag type', example: 'KEYWORD', enum: TagTypeEnum })
  type: string;

  @ApiProperty({ description: 'Tag description', example: 'Technology-related news', required: false })
  description?: string;

  @ApiProperty({ description: 'Number of times tag has been used', example: 150 })
  usageCount: number;
}

