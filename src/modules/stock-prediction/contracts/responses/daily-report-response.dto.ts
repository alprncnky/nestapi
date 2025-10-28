import { BaseResponseDto } from '../../../../common/base/base-dto';
import { AutoResponse } from '../../../../common/decorators/auto-response.decorator';
import { DailyReportResponseMapping } from './mapping';

@AutoResponse(DailyReportResponseMapping)
export class DailyReportResponseDto extends BaseResponseDto {
  reportDate: Date;
  totalArticles: number;
  totalPredictions: number;
  averageAccuracy: number;
  topGainers: any[];
  topLosers: any[];
  insights: string[];
  recommendations: string[];
}
