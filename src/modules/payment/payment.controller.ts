import { Body } from '@nestjs/common';
import { CrudController } from '../../common/decorators/crud-controller.decorator';
import { BaseController } from '../../common/base/base-controller';
import { SaveEndpoint } from '../../common/decorators/endpoint.decorator';
import { PaymentService } from './payment.service';
import { Payment } from './entities/payment.entity';
import { SavePaymentDto } from './dto/save-payment.dto';
import { PaymentResponseDto } from './responses/payment-response.dto';
import { PaymentListResponseDto } from './responses/payment-list-response.dto';

/**
 * Payment controller - handles HTTP requests for payment operations
 * 
 * Extends BaseController for standard CRUD operations
 * Implements additional custom endpoints for payment-specific operations
 */
@CrudController('payments', 'Payment')
export class PaymentController extends BaseController<
  Payment,
  SavePaymentDto,
  SavePaymentDto,
  PaymentResponseDto,
  PaymentListResponseDto
> {
  constructor(private readonly paymentService: PaymentService) {
    super(
      paymentService,
      undefined,
      PaymentResponseDto,
      PaymentListResponseDto,
      'Payment',
      SavePaymentDto,
    );
  }

  @SaveEndpoint(SavePaymentDto, PaymentResponseDto)
  async save(@Body() dto: SavePaymentDto): Promise<PaymentResponseDto> {
    return this.saveEntity(dto);
  }
}

