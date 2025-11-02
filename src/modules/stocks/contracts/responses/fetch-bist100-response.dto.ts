import { AutoResponse } from '../../../../common/decorators/auto-response.decorator';
import { FetchBist100ResponseMapping } from './mapping';

@AutoResponse(FetchBist100ResponseMapping)
export class FetchBist100ResponseDto {
  message: string;
  saved: number;
  errors: number;

  constructor(partial?: Partial<FetchBist100ResponseDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}

