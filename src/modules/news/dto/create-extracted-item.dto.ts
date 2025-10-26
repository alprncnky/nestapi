import { BaseCreateDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';
import { EntityTypeEnum } from '../enums/entity-type.enum';
import { CreateExtractedItemMapping } from './mapping';

/**
 * DTO for creating a new extracted item (NER result)
 * Uses @AutoApplyDecorators for automatic validation from centralized mapping
 */
@AutoApplyDecorators(CreateExtractedItemMapping)
export class CreateExtractedItemDto extends BaseCreateDto {
  articleId: number;
  entityType: EntityTypeEnum;
  entityText: string;
  normalizedValue?: string;
  position?: number;
  confidence?: number;
}

