import { StringField, NumberField, EmailField } from '../../../common/decorators/field.decorator';

/**
 * Field mappings for Payment DTOs
 * Each property maps to a field decorator with its validation rules
 */
export const CreatePaymentMapping = {
  amount: () => NumberField('Payment amount', 99.99, true, 0.01),
  currency: () => StringField('Payment currency', 'USD', true, 3, 3),
  customerEmail: () => EmailField('Customer email address', 'customer@example.com', true),
  customerName: () => StringField('Customer full name', 'John Doe', true),
  description: () => StringField('Payment description', 'Payment for order #1234', false),
};

export const UpdatePaymentMapping = {
  amount: () => NumberField('Payment amount', 99.99, false, 0.01),
  currency: () => StringField('Payment currency', 'USD', false, 3, 3),
  status: () => StringField('Payment status', 'completed', false),
  customerEmail: () => EmailField('Customer email address', 'customer@example.com', false),
  customerName: () => StringField('Customer full name', 'John Doe', false),
  description: () => StringField('Payment description', 'Payment for order #1234', false),
};

export const SavePaymentMapping = {
  id: () => NumberField('Payment ID (optional, for updates)', 1, false),
  amount: () => NumberField('Payment amount', 99.99, true, 0.01),
  currency: () => StringField('Payment currency', 'USD', true, 3, 3),
  customerEmail: () => EmailField('Customer email address', 'customer@example.com', true),
  customerName: () => StringField('Customer full name', 'John Doe', true),
  description: () => StringField('Payment description', 'Payment for order #1234', false),
  status: () => StringField('Payment status', 'completed', false),
};

