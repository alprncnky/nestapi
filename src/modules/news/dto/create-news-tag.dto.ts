import { BaseCreateDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';
import { TagTypeEnum } from '../enums/tag-type.enum';
import { CreateNewsTagMapping } from './mapping';

/**
 * DTO for creating a new news tag
 * Uses @AutoApplyDecorators for automatic validation from centralized mapping
 */
@AutoApplyDecorators(CreateNewsTagMapping)
export class CreateNewsTagDto extends BaseCreateDto {
  name: string;
  type: TagTypeEnum;
  description?: string;
}

