import { BaseListResponseDto } from '../../../../common/base/base-dto';
import { AutoListResponse } from '../../../../common/decorators/auto-response.decorator';
import { RssSourceResponseDto } from './rss-source-response.dto';

@AutoListResponse(RssSourceResponseDto)
export class RssSourceListResponseDto extends BaseListResponseDto<RssSourceResponseDto> {}

