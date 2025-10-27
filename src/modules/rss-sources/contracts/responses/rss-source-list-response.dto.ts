import { BaseListResponseDto } from '../../../../common/base/base-dto';
import { RssSourceResponseDto } from './rss-source-response.dto';

/**
 * Response DTO for list of RSS Sources
 * Extends BaseListResponseDto with RssSourceResponseDto type
 * Automatically provides items[] and total count
 */
export class RssSourceListResponseDto extends BaseListResponseDto<RssSourceResponseDto> {}

