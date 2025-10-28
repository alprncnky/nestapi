import { BaseListResponseDto } from '../../../../common/base/base-dto';
import { PredictionResponseDto } from './prediction-response.dto';
import { DailyReportResponseDto } from './daily-report-response.dto';
import { RetrospectiveAnalysisResponseDto } from './retrospective-analysis-response.dto';

export class PredictionListResponseDto extends BaseListResponseDto<PredictionResponseDto> {}

export class DailyReportListResponseDto extends BaseListResponseDto<DailyReportResponseDto> {}

export class RetrospectiveAnalysisListResponseDto extends BaseListResponseDto<RetrospectiveAnalysisResponseDto> {}
