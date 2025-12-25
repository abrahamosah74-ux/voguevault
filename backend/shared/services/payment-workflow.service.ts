import { PaystackService, PaymentStatus, PaymentMethod } from './paystack.service';
import crypto from 'crypto';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total_amount: number;
  currency: string;
  status: string;
}

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  payment_reference: string;
  amount: number;
  status: PaymentStatus;
  created_at: string;
}

export interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    customer: {
      email: string;
      customer_code: string;
    };
    authorization: {
      authorization_code: string;
      last4: string;
      card_type: string;
      bank: string;
    };
    [key: string]: any;
  };
}

export interface PaymentInitiationResult {
  payment_id: string;
  authorization_url: string;
  reference: string;
  expires_at: Date;
}

export interface RefundResult {
  success: boolean;
  refund_id: string;
  refund_reference: string;
  amount_refunded: number;
}

export class PaymentWorkflowService {
  private paystack: PaystackService;
  private database: any; // Inject database service

  constructor(paystackService: PaystackService, database?: any) {
    this.paystack = paystackService;
    this.database = database;
  }

  /**
   * Initiate payment for an order
   */
  async initiatePayment(order: Order, customer: User, options?: {
    channels?: string[];
    callback_url?: string;
  }): Promise<PaymentInitiationResult> {
    try {
      // Generate unique payment reference
      const paymentReference = `${order.order_number}_${Date.now()}`;

      // Create payment record in database
      const payment = await this.createPaymentRecord({
        order_id: order.id,
        payment_reference: paymentReference,
        amount: order.total_amount,
        currency: order.currency,
        payment_method: PaymentMethod.PAYSTACK_CARD,
        status: PaymentStatus.PENDING
      });

      // Initialize Paystack transaction
      const paystackResponse = await this.paystack.initializeTransaction({
        email: customer.email,
        amount: order.total_amount,
        reference: paymentReference,
        currency: order.currency || 'NGN',
        callback_url: options?.callback_url || `${process.env.APP_URL}/payment/callback`,
        metadata: {
          order_id: order.id,
          customer_id: customer.id,
          customer_name: `${customer.first_name} ${customer.last_name}`.trim(),
          order_number: order.order_number
        },
        channels: options?.channels || ['card', 'bank_transfer', 'ussd', 'qr']
      });

      // Update payment with Paystack details
      await this.updatePaymentWithPaystackData(payment.id, paystackResponse);

      return {
        payment_id: payment.id,
        authorization_url: paystackResponse.authorization_url,
        reference: paymentReference,
        expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      };
    } catch (error) {
      throw new Error(`Payment initiation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle successful payment
   */
  async handleSuccessfulPayment(reference: string): Promise<{
    success: boolean;
    order_id: string;
    payment_id: string;
  }> {
    try {
      // Verify transaction with Paystack
      const verification = await this.paystack.verifyTransaction(reference);

      if (verification.status !== 'success') {
        throw new Error(`Payment verification failed: ${verification.status}`);
      }

      // Find payment by reference
      const payment = await this.getPaymentByReference(reference);
      if (!payment) {
        throw new Error(`Payment not found for reference: ${reference}`);
      }

      // Update payment status to captured
      await this.updatePaymentStatus(payment.id, PaymentStatus.CAPTURED, {
        paystack_transaction_id: verification.reference,
        paystack_authorization_code: verification.authorization?.authorization_code,
        paystack_customer_code: verification.customer?.customer_code,
        channel: verification.channel,
        card_last4: verification.authorization?.last4,
        card_type: verification.authorization?.card_type,
        card_bank: verification.authorization?.bank,
        paystack_ip_address: verification.ip_address,
        gateway_response: verification.gateway_response,
        raw_response: verification
      });

      // Update order status to paid
      await this.markOrderAsPaid(payment.order_id);

      // Send confirmation email
      await this.sendPaymentConfirmation(payment.order_id);

      // Create customer payment method record if saving card
      if (verification.authorization?.authorization_code) {
        await this.createCustomerPaymentMethod({
          customer_id: payment.customer_id,
          paystack_authorization_code: verification.authorization.authorization_code,
          paystack_customer_code: verification.customer?.customer_code,
          card_last4: verification.authorization?.last4,
          card_type: verification.authorization?.card_type,
          channel: verification.channel
        });
      }

      return {
        success: true,
        order_id: payment.order_id,
        payment_id: payment.id
      };
    } catch (error) {
      throw new Error(`Payment handling failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle failed payment
   */
  async handleFailedPayment(reference: string, error?: string): Promise<void> {
    try {
      const payment = await this.getPaymentByReference(reference);
      if (!payment) {
        throw new Error(`Payment not found for reference: ${reference}`);
      }

      // Update payment status to failed
      await this.updatePaymentStatus(payment.id, PaymentStatus.FAILED, {
        failure_reason: error || 'Payment declined'
      });

      // Send failure email
      await this.sendPaymentFailureNotification(payment.order_id);
    } catch (err) {
      console.error('Failed to handle payment failure:', err);
    }
  }

  /**
   * Process refund
   */
  async processRefund(
    paymentId: string,
    amount: number,
    reason: string,
    processedBy: string
  ): Promise<RefundResult> {
    try {
      // Get payment details
      const payment = await this.getPayment(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Validate refund
      if (payment.status !== PaymentStatus.CAPTURED) {
        throw new Error('Only captured payments can be refunded');
      }

      const refundableAmount = payment.amount - (payment.refunded_amount || 0);
      if (amount > refundableAmount) {
        throw new Error(`Refund amount exceeds available balance (${refundableAmount})`);
      }

      // Generate refund reference
      const refundReference = `REF_${paymentId}_${Date.now()}`;

      // Create refund record
      const refund = await this.createRefundRecord({
        payment_id: paymentId,
        refund_reference: refundReference,
        amount,
        reason,
        processed_by: processedBy,
        status: 'pending'
      });

      try {
        // Process refund through Paystack
        const paystackRefund = await this.paystack.refundTransaction(
          payment.paystack_transaction_id,
          amount
        );

        // Update refund status to processed
        await this.updateRefundStatus(refund.id, 'processed', {
          paystack_refund_id: paystackRefund.data.refund_id
        });

        // Update payment refunded amount
        await this.updatePaymentRefundedAmount(
          paymentId,
          (payment.refunded_amount || 0) + amount
        );

        // Update payment status if fully refunded
        const newRefundedAmount = (payment.refunded_amount || 0) + amount;
        if (newRefundedAmount >= payment.amount) {
          await this.updatePaymentStatus(paymentId, PaymentStatus.REFUNDED);
          await this.markOrderAsRefunded(payment.order_id);
        } else {
          await this.updatePaymentStatus(paymentId, PaymentStatus.PARTIALLY_REFUNDED);
        }

        // Send refund confirmation
        await this.sendRefundNotification(payment.order_id, amount);

        return {
          success: true,
          refund_id: refund.id,
          refund_reference: refundReference,
          amount_refunded: amount
        };
      } catch (error) {
        // Update refund status to failed
        await this.updateRefundStatus(refund.id, 'failed', {
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    } catch (error) {
      throw new Error(`Refund processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle Paystack webhook event
   */
  async handleWebhookEvent(event: PaystackWebhookEvent): Promise<void> {
    try {
      switch (event.event) {
        case 'charge.success':
          await this.handleSuccessfulPayment(event.data.reference);
          break;

        case 'charge.failed':
          await this.handleFailedPayment(event.data.reference, event.data.gateway_response);
          break;

        case 'refund.processed':
          await this.handleRefundWebhook(event.data);
          break;

        case 'refund.failed':
          await this.handleRefundFailureWebhook(event.data);
          break;

        case 'transfer.success':
          await this.handleTransferSuccess(event.data);
          break;

        default:
          console.log(`Unhandled webhook event: ${event.event}`);
      }

      // Log webhook event
      await this.logWebhookEvent(event);
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  /**
   * Charge saved card
   */
  async chargeAuthorization(
    customerId: string,
    authorizationCode: string,
    amount: number,
    reference: string,
    metadata?: Record<string, any>
  ): Promise<{
    success: boolean;
    transaction_id: string;
    amount: number;
  }> {
    try {
      // Get customer email
      const customer = await this.getCustomer(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Charge authorization code
      const verification = await this.paystack.chargeAuthorization({
        authorization_code: authorizationCode,
        email: customer.email,
        amount: amount * 100, // Convert to kobo
        reference,
        metadata
      });

      if (verification.status !== 'success') {
        throw new Error('Authorization charge failed');
      }

      return {
        success: true,
        transaction_id: verification.reference,
        amount: verification.amount / 100
      };
    } catch (error) {
      throw new Error(`Authorization charge failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get saved payment methods for customer
   */
  async getCustomerPaymentMethods(customerId: string): Promise<Array<{
    id: string;
    card_last4: string;
    card_type: string;
    is_default: boolean;
    paystack_authorization_code: string;
  }>> {
    try {
      return await this.database?.getCustomerPaymentMethods?.(customerId) || [];
    } catch (error) {
      throw new Error(`Failed to fetch payment methods: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
    try {
      await this.database?.setDefaultPaymentMethod?.(customerId, paymentMethodId);
    } catch (error) {
      throw new Error(`Failed to set default payment method: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private async createPaymentRecord(data: any): Promise<PaymentRecord> {
    return this.database?.createPayment?.(data) || {
      id: crypto.randomUUID(),
      order_id: data.order_id,
      payment_reference: data.payment_reference,
      amount: data.amount,
      status: data.status,
      created_at: new Date().toISOString()
    };
  }

  private async updatePaymentWithPaystackData(paymentId: string, data: any): Promise<void> {
    await this.database?.updatePayment?.(paymentId, {
      paystack_access_code: data.access_code,
      metadata: data
    });
  }

  private async updatePaymentStatus(paymentId: string, status: PaymentStatus, metadata?: any): Promise<void> {
    await this.database?.updatePayment?.(paymentId, {
      status,
      ...metadata,
      updated_at: new Date()
    });
  }

  private async updatePaymentRefundedAmount(paymentId: string, amount: number): Promise<void> {
    await this.database?.updatePayment?.(paymentId, {
      refunded_amount: amount,
      updated_at: new Date()
    });
  }

  private async getPayment(paymentId: string): Promise<any> {
    return this.database?.getPayment?.(paymentId);
  }

  private async getPaymentByReference(reference: string): Promise<any> {
    return this.database?.getPaymentByReference?.(reference);
  }

  private async markOrderAsPaid(orderId: string): Promise<void> {
    await this.database?.updateOrder?.(orderId, {
      payment_status: 'paid',
      paid_at: new Date(),
      status: 'confirmed'
    });
  }

  private async markOrderAsRefunded(orderId: string): Promise<void> {
    await this.database?.updateOrder?.(orderId, {
      payment_status: 'refunded',
      status: 'refunded'
    });
  }

  private async createRefundRecord(data: any): Promise<any> {
    return this.database?.createRefund?.(data) || {
      id: crypto.randomUUID(),
      ...data
    };
  }

  private async updateRefundStatus(refundId: string, status: string, metadata?: any): Promise<void> {
    await this.database?.updateRefund?.(refundId, {
      status,
      ...metadata,
      updated_at: new Date()
    });
  }

  private async createCustomerPaymentMethod(data: any): Promise<void> {
    await this.database?.createCustomerPaymentMethod?.(data);
  }

  private async getCustomer(customerId: string): Promise<any> {
    return this.database?.getCustomer?.(customerId);
  }

  private async sendPaymentConfirmation(orderId: string): Promise<void> {
    console.log(`[Email] Sending payment confirmation for order ${orderId}`);
    // Implement email service
  }

  private async sendPaymentFailureNotification(orderId: string): Promise<void> {
    console.log(`[Email] Sending payment failure notification for order ${orderId}`);
    // Implement email service
  }

  private async sendRefundNotification(orderId: string, amount: number): Promise<void> {
    console.log(`[Email] Sending refund notification for order ${orderId} - Amount: ${amount}`);
    // Implement email service
  }

  private async handleRefundWebhook(data: any): Promise<void> {
    console.log('[Webhook] Refund processed:', data);
    // Handle refund processing logic
  }

  private async handleRefundFailureWebhook(data: any): Promise<void> {
    console.log('[Webhook] Refund failed:', data);
    // Handle refund failure logic
  }

  private async handleTransferSuccess(data: any): Promise<void> {
    console.log('[Webhook] Transfer successful:', data);
    // Handle transfer logic
  }

  private async logWebhookEvent(event: PaystackWebhookEvent): Promise<void> {
    await this.database?.createWebhookLog?.({
      event_type: event.event,
      payload: event.data,
      processed: true,
      created_at: new Date()
    });
  }
}

export default PaymentWorkflowService;
