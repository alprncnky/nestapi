import { BaseListResponseDto } from '../../../../common/base/base-dto';
import { AutoListResponse } from '../../../../common/decorators/auto-response.decorator';
import { ReliabilityTrackingResponseDto } from './reliability-tracking-response.dto';

@AutoListResponse(ReliabilityTrackingResponseDto)
export class ReliabilityTrackingListResponseDto extends BaseListResponseDto<ReliabilityTrackingResponseDto> {}

