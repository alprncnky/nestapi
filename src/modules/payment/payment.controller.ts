import { Query, Body, ParseIntPipe } from '@nestjs/common';
import { CrudController } from '../../common/decorators/crud-controller.decorator';
import { SaveEndpoint, GetEndpoint, GetListEndpoint, DeleteEndpoint } from '../../common/decorators/endpoint.decorator';
import { BaseController } from '../../common/base/base-controller';
import { CriteriaDto } from '../../common/dto/criteria.dto';
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
    return super.save(dto);
  }

  @GetEndpoint('Payment', PaymentResponseDto)
  async get(@Query('id', ParseIntPipe) id: number): Promise<PaymentResponseDto> {
    return super.get(id);
  }

  @GetListEndpoint('Payment', CriteriaDto, PaymentListResponseDto)
  async getList(@Body() criteriaDto: CriteriaDto): Promise<PaymentListResponseDto> {
    return super.getList(criteriaDto);
  }

  @DeleteEndpoint('Payment')
  async delete(@Query('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return super.delete(id);
  }
}

