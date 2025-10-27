import { BaseDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';
import { PaymentStatusType } from '../enums/payment-status.enum';
import { SavePaymentMapping } from './mapping';

/**
 * DTO for saving (create or update) a payment
 * Uses @AutoApplyDecorators for automatic validation from centralized mapping
 * If id is provided, performs update; otherwise performs create
 * .NET-style upsert DTO
 */
@AutoApplyDecorators(SavePaymentMapping)
export class SavePaymentDto extends BaseDto {
  id?: number;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  description?: string;
  status?: PaymentStatusType;
}

