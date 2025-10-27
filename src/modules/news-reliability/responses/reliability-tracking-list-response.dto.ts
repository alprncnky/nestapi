import { BaseListResponseDto } from '../../../common/base/base-dto';
import { AutoListResponse } from '../../../common/decorators/auto-response.decorator';
import { ReliabilityTrackingResponseDto } from './reliability-tracking-response.dto';

/**
 * Response DTO for list of Reliability Tracking records
 * Uses @AutoListResponse for proper Swagger schema generation
 */
@AutoListResponse(ReliabilityTrackingResponseDto)
export class ReliabilityTrackingListResponseDto extends BaseListResponseDto<ReliabilityTrackingResponseDto> {}

