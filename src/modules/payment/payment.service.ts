import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Payment } from './entities/payment.entity';
import { PaymentStatusType } from './enums/payment-status.enum';
import { SavePaymentDto } from './dto/save-payment.dto';
import { IBaseService } from '../../common/interfaces/base-service.interface';

/**
 * Payment service - handles business logic for payments
 * 
 * In production, this would integrate with a real database (TypeORM/Prisma)
 * For now, using in-memory storage for demonstration
 */
@Injectable()
export class PaymentService implements IBaseService<Payment> {
  // In-memory storage (replace with TypeORM repository in production)
  private payments: Payment[] = [];
  private idCounter = 1;

  /**
   * Save a payment (create or update)
   * .NET-style upsert method
   */
  async save(savePaymentDto: SavePaymentDto): Promise<Payment> {
    const id = savePaymentDto.id;

    if (id) {
      // Update existing payment
      const payment = await this.findOne(id);

      // Validate status transition if status is being updated
      if (savePaymentDto.status) {
        this.validateStatusTransition(payment.status, savePaymentDto.status);
      }

      // Update payment
      const updatedPayment: Payment = {
        ...payment,
        ...savePaymentDto,
        status: savePaymentDto.status ?? payment.status,
        updatedAt: new Date(),
      };

      // Replace in array
      const index = this.payments.findIndex((p) => p.id === id);
      this.payments[index] = updatedPayment;

      return updatedPayment;
    } else {
      // Create new payment
      await this.validatePayment(savePaymentDto);

      const transactionId = this.generateTransactionId();
      
      const payment: Payment = {
        id: this.idCounter++,
        ...savePaymentDto,
        status: savePaymentDto.status ?? PaymentStatusType.PENDING,
        transactionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.payments.push(payment);

      return payment;
    }
  }

  /**
   * Find all payments
   */
  async findAll(): Promise<Payment[]> {
    return this.payments;
  }

  /**
   * Find one payment by ID
   */
  async findOne(id: number): Promise<Payment> {
    const payment = this.payments.find((p) => p.id === id);
    
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  /**
   * Find payments by status
   */
  async findByStatus(status: PaymentStatusType): Promise<Payment[]> {
    return this.payments.filter((p) => p.status === status);
  }

  /**
   * Find payments by customer email
   */
  async findByCustomerEmail(email: string): Promise<Payment[]> {
    return this.payments.filter((p) => p.customerEmail === email);
  }

  /**
   * Remove a payment
   */
  async remove(id: number): Promise<void> {
    const payment = await this.findOne(id);
    
    // Business rule: cannot delete completed or refunded payments
    if (payment.status === PaymentStatusType.COMPLETED || payment.status === PaymentStatusType.REFUNDED) {
      throw new BadRequestException(`Cannot delete ${payment.status} payments`);
    }

    const index = this.payments.findIndex((p) => p.id === id);
    this.payments.splice(index, 1);
  }

  /**
   * Process payment (custom business operation)
   */
  async processPayment(id: number): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatusType.PENDING) {
      throw new BadRequestException(`Payment with ID ${id} is not in pending status`);
    }

    // Simulate payment processing
    const success = Math.random() > 0.1; // 90% success rate

    const updatedPayment: Payment = {
      ...payment,
      status: success ? PaymentStatusType.COMPLETED : PaymentStatusType.FAILED,
      updatedAt: new Date(),
    };

    const index = this.payments.findIndex((p) => p.id === id);
    this.payments[index] = updatedPayment;

    return updatedPayment;
  }

  /**
   * Refund a payment (custom business operation)
   */
  async refundPayment(id: number): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatusType.COMPLETED) {
      throw new BadRequestException(`Can only refund completed payments`);
    }

    const updatedPayment: Payment = {
      ...payment,
      status: PaymentStatusType.REFUNDED,
      updatedAt: new Date(),
    };

    const index = this.payments.findIndex((p) => p.id === id);
    this.payments[index] = updatedPayment;

    return updatedPayment;
  }

  /**
   * Private validation methods
   */
  private async validatePayment(dto: SavePaymentDto): Promise<void> {
    // Validate amount
    if (dto.amount <= 0) {
      throw new BadRequestException('Payment amount must be positive');
    }

    // Validate currency
    const validCurrencies = ['USD', 'EUR', 'GBP'];
    if (!validCurrencies.includes(dto.currency.toUpperCase())) {
      throw new BadRequestException(`Invalid currency. Supported: ${validCurrencies.join(', ')}`);
    }
  }

  private validateStatusTransition(currentStatus: PaymentStatusType, newStatus: PaymentStatusType): void {
    const validTransitions: Record<PaymentStatusType, PaymentStatusType[]> = {
      [PaymentStatusType.PENDING]: [PaymentStatusType.COMPLETED, PaymentStatusType.FAILED],
      [PaymentStatusType.COMPLETED]: [PaymentStatusType.REFUNDED],
      [PaymentStatusType.FAILED]: [],
      [PaymentStatusType.REFUNDED]: [],
    };

    const allowedStatuses = validTransitions[currentStatus] || [];
    
    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

