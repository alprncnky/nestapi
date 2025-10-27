import { Body, Param, ParseIntPipe, Query, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CrudController } from '../../common/decorators/crud-controller.decorator';
import { BaseController } from '../../common/base/base-controller';
import {
  GetByStatusEndpoint,
} from '../../common/decorators/endpoint.decorator';
import { PaymentService } from './payment.service';
import { Payment } from './entities/payment.entity';
import { PaymentStatusType } from './enums/payment-status.enum';
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
    super(paymentService);
  }

  /**
   * Implement abstract methods from BaseController
   */
  protected getResponseClass = () => PaymentResponseDto;
  protected getListResponseClass = () => PaymentListResponseDto;
  protected getEntityName = () => 'Payment';

  /**
   * Custom business endpoints
   */

  @Post(':id/process')
  @ApiOperation({ summary: 'Process a pending payment' })
  @ApiParam({ name: 'id', type: 'number', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully', type: PaymentResponseDto })
  @ApiResponse({ status: 400, description: 'Payment cannot be processed' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async processPayment(@Param('id', ParseIntPipe) id: number): Promise<PaymentResponseDto> {
    return new PaymentResponseDto(await this.paymentService.processPayment(id));
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund a completed payment' })
  @ApiParam({ name: 'id', type: 'number', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully', type: PaymentResponseDto })
  @ApiResponse({ status: 400, description: 'Payment cannot be refunded' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async refundPayment(@Param('id', ParseIntPipe) id: number): Promise<PaymentResponseDto> {
    return new PaymentResponseDto(await this.paymentService.refundPayment(id));
  }

  @GetByStatusEndpoint('Payment', PaymentListResponseDto, PaymentStatusType)
  async findByStatus(@Param('status') status: PaymentStatusType): Promise<PaymentListResponseDto> {
    const payments = await this.paymentService.findByStatus(status);
    return new PaymentListResponseDto(payments.map((payment) => new PaymentResponseDto(payment)), payments.length);
  }
}

