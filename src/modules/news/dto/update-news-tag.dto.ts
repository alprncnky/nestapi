import { BaseUpdateDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';
import { TagTypeEnum } from '../enums/tag-type.enum';
import { UpdateNewsTagMapping } from './mapping';

/**
 * DTO for updating an existing news tag
 * Uses @AutoApplyDecorators for automatic validation from centralized mapping
 */
@AutoApplyDecorators(UpdateNewsTagMapping)
export class UpdateNewsTagDto extends BaseUpdateDto {
  name?: string;
  type?: TagTypeEnum;
  description?: string;
}

