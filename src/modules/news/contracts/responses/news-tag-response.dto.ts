import { BaseResponseDto } from '../../../../common/base/base-dto';
import { AutoResponse } from '../../../../common/decorators/auto-response.decorator';
import { NewsTagResponseMapping } from './mapping';

@AutoResponse(NewsTagResponseMapping)
export class NewsTagResponseDto extends BaseResponseDto {
  name: string;
  type: string;
  description?: string;
  usageCount: number;
}
