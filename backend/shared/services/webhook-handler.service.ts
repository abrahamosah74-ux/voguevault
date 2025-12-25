import crypto from 'crypto';

export interface WebhookEvent {
  event: string;
  data: Record<string, any>;
  timestamp?: string;
}

export interface WebhookLog {
  id: string;
  event_type: string;
  paystack_event_id?: string;
  payment_id?: string;
  payload: Record<string, any>;
  processed: boolean;
  processing_error?: string;
  created_at: string;
}

export class WebhookHandlerService {
  private database: any; // Inject database service
  private eventHandlers: Map<string, Function> = new Map();

  constructor(database?: any) {
    this.database = database;
    this.registerDefaultHandlers();
  }

  /**
   * Register default event handlers
   */
  private registerDefaultHandlers(): void {
    // Charge events
    this.on('charge.success', this.handleChargeSuccess.bind(this));
    this.on('charge.failed', this.handleChargeFailed.bind(this));
    this.on('charge.refunded', this.handleChargeRefunded.bind(this));

    // Transfer events
    this.on('transfer.success', this.handleTransferSuccess.bind(this));
    this.on('transfer.failed', this.handleTransferFailed.bind(this));

    // Refund events
    this.on('refund.created', this.handleRefundCreated.bind(this));
    this.on('refund.processed', this.handleRefundProcessed.bind(this));
    this.on('refund.failed', this.handleRefundFailed.bind(this));

    // Subscription events
    this.on('subscription.create', this.handleSubscriptionCreate.bind(this));
    this.on('subscription.disable', this.handleSubscriptionDisable.bind(this));

    // Invoice events
    this.on('invoice.create', this.handleInvoiceCreate.bind(this));
    this.on('invoice.payment_failed', this.handleInvoicePaymentFailed.bind(this));
    this.on('invoice.update', this.handleInvoiceUpdate.bind(this));

    // Customer events
    this.on('customer.create', this.handleCustomerCreate.bind(this));
    this.on('customer.update', this.handleCustomerUpdate.bind(this));
  }

  /**
   * Register a custom event handler
   */
  on(eventType: string, handler: Function): void {
    this.eventHandlers.set(eventType, handler);
  }

  /**
   * Process webhook event
   */
  async processEvent(event: WebhookEvent): Promise<{
    success: boolean;
    event_id?: string;
    error?: string;
  }> {
    try {
      // Log the webhook event
      const logId = await this.logEvent(event);

      // Find handler for this event type
      const handler = this.eventHandlers.get(event.event);

      if (!handler) {
        console.warn(`No handler registered for event: ${event.event}`);
        return {
          success: true,
          event_id: logId
        };
      }

      // Execute handler
      await handler(event.data);

      // Mark webhook as processed
      await this.markEventAsProcessed(logId);

      return {
        success: true,
        event_id: logId
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log error
      if (this.database?.createWebhookLog) {
        await this.database.createWebhookLog({
          event_type: event.event,
          payload: event.data,
          processed: false,
          processing_error: errorMessage,
          created_at: new Date()
        });
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string | object, signature: string, secret: string): boolean {
    const hash = crypto
      .createHmac('sha512', secret)
      .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }

  /**
   * Retry failed webhook
   */
  async retryEvent(logId: string, maxRetries: number = 3): Promise<boolean> {
    try {
      // Fetch the log
      const log = await this.database?.getWebhookLog?.(logId);

      if (!log || log.processed) {
        return false;
      }

      // Check retry count
      const retryCount = log.retry_count || 0;
      if (retryCount >= maxRetries) {
        throw new Error(`Max retries (${maxRetries}) exceeded`);
      }

      // Re-process event
      const event: WebhookEvent = {
        event: log.event_type,
        data: log.payload
      };

      const result = await this.processEvent(event);

      // Update retry count
      if (!result.success) {
        await this.database?.updateWebhookLog?.(logId, {
          retry_count: retryCount + 1,
          last_retry_at: new Date()
        });
      }

      return result.success;
    } catch (error) {
      console.error('Retry failed:', error);
      return false;
    }
  }

  // Event Handlers

  private async handleChargeSuccess(data: any): Promise<void> {
    console.log('[Webhook] Charge successful:', data.reference);

    // Update payment status to captured
    await this.database?.updatePayment?.(
      { paystack_transaction_id: data.id },
      {
        status: 'captured',
        paystack_authorization_code: data.authorization?.authorization_code,
        paystack_customer_code: data.customer?.customer_code,
        paid_at: new Date()
      }
    );

    // Update order status
    if (data.metadata?.order_id) {
      await this.database?.updateOrder?.(data.metadata.order_id, {
        payment_status: 'paid',
        status: 'confirmed',
        paid_at: new Date()
      });
    }

    // Emit event for other services
    console.log('[Event] Payment confirmed:', { orderId: data.metadata?.order_id });
  }

  private async handleChargeFailed(data: any): Promise<void> {
    console.log('[Webhook] Charge failed:', data.reference);

    // Update payment status
    await this.database?.updatePayment?.(
      { paystack_transaction_id: data.id },
      {
        status: 'failed',
        gateway_response: data.gateway_response
      }
    );

    // Emit event
    console.log('[Event] Payment failed:', data.reference);
  }

  private async handleChargeRefunded(data: any): Promise<void> {
    console.log('[Webhook] Charge refunded:', data.reference);

    // Update payment status
    await this.database?.updatePayment?.(
      { paystack_transaction_id: data.id },
      {
        status: 'refunded',
        refunded_amount: data.amount / 100
      }
    );
  }

  private async handleTransferSuccess(data: any): Promise<void> {
    console.log('[Webhook] Transfer successful:', data.reference);

    // Update settlement record
    await this.database?.updateSettlement?.(
      { paystack_transfer_id: data.id },
      {
        status: 'completed',
        completed_at: new Date()
      }
    );
  }

  private async handleTransferFailed(data: any): Promise<void> {
    console.log('[Webhook] Transfer failed:', data.reference);

    // Update settlement record
    await this.database?.updateSettlement?.(
      { paystack_transfer_id: data.id },
      {
        status: 'failed',
        failure_reason: data.reason
      }
    );
  }

  private async handleRefundCreated(data: any): Promise<void> {
    console.log('[Webhook] Refund created:', data.reference);

    // Create refund record if not exists
    const refund = await this.database?.getRefund?.({ paystack_refund_id: data.id });
    if (!refund) {
      await this.database?.createRefund?.({
        paystack_refund_id: data.id,
        amount: data.amount / 100,
        status: 'pending',
        reference: data.reference
      });
    }
  }

  private async handleRefundProcessed(data: any): Promise<void> {
    console.log('[Webhook] Refund processed:', data.reference);

    // Update refund status
    await this.database?.updateRefund?.(
      { paystack_refund_id: data.id },
      {
        status: 'completed',
        completed_at: new Date()
      }
    );
  }

  private async handleRefundFailed(data: any): Promise<void> {
    console.log('[Webhook] Refund failed:', data.reference);

    // Update refund status
    await this.database?.updateRefund?.(
      { paystack_refund_id: data.id },
      {
        status: 'failed',
        failure_reason: data.reason
      }
    );
  }

  private async handleSubscriptionCreate(data: any): Promise<void> {
    console.log('[Webhook] Subscription created:', data.subscription_code);

    // Create subscription record
    await this.database?.createSubscription?.({
      paystack_subscription_code: data.subscription_code,
      customer_code: data.customer?.customer_code,
      plan_code: data.plan?.plan_code,
      amount: data.amount / 100,
      status: 'active',
      created_at: new Date()
    });
  }

  private async handleSubscriptionDisable(data: any): Promise<void> {
    console.log('[Webhook] Subscription disabled:', data.subscription_code);

    // Update subscription status
    await this.database?.updateSubscription?.(
      { paystack_subscription_code: data.subscription_code },
      {
        status: 'inactive',
        disabled_at: new Date()
      }
    );
  }

  private async handleInvoiceCreate(data: any): Promise<void> {
    console.log('[Webhook] Invoice created:', data.invoice_code);

    // Create invoice record
    await this.database?.createInvoice?.({
      paystack_invoice_code: data.invoice_code,
      customer_code: data.customer?.customer_code,
      amount: data.amount / 100,
      status: 'pending',
      due_date: data.due_date,
      created_at: new Date()
    });
  }

  private async handleInvoicePaymentFailed(data: any): Promise<void> {
    console.log('[Webhook] Invoice payment failed:', data.invoice_code);

    // Update invoice status
    await this.database?.updateInvoice?.(
      { paystack_invoice_code: data.invoice_code },
      {
        status: 'failed',
        failed_at: new Date()
      }
    );
  }

  private async handleInvoiceUpdate(data: any): Promise<void> {
    console.log('[Webhook] Invoice updated:', data.invoice_code);

    // Update invoice
    await this.database?.updateInvoice?.(
      { paystack_invoice_code: data.invoice_code },
      {
        status: data.status,
        updated_at: new Date()
      }
    );
  }

  private async handleCustomerCreate(data: any): Promise<void> {
    console.log('[Webhook] Customer created:', data.customer_code);

    // Store customer code in payment methods
    await this.database?.updateUser?.(
      { email: data.email },
      {
        paystack_customer_code: data.customer_code
      }
    );
  }

  private async handleCustomerUpdate(data: any): Promise<void> {
    console.log('[Webhook] Customer updated:', data.customer_code);

    // Update customer info
    await this.database?.updateUser?.(
      { paystack_customer_code: data.customer_code },
      {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name
      }
    );
  }

  // Helper methods

  private async logEvent(event: WebhookEvent): Promise<string> {
    const eventId = crypto.randomUUID();

    if (this.database?.createWebhookLog) {
      await this.database.createWebhookLog({
        id: eventId,
        event_type: event.event,
        payload: event.data,
        processed: false,
        created_at: new Date()
      });
    }

    return eventId;
  }

  private async markEventAsProcessed(logId: string): Promise<void> {
    if (this.database?.updateWebhookLog) {
      await this.database.updateWebhookLog(logId, {
        processed: true,
        processed_at: new Date()
      });
    }
  }
}

export default WebhookHandlerService;
