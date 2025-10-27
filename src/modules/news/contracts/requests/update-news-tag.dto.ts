import { BaseUpdateDto } from '../../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../../common/decorators/auto-apply.decorator';
import { TagTypeEnum } from '../enums/tag-type.enum';
import { UpdateNewsTagMapping } from './mapping';

@AutoApplyDecorators(UpdateNewsTagMapping)
export class UpdateNewsTagDto extends BaseUpdateDto {
  name?: string;
  type?: TagTypeEnum;
  description?: string;
}

