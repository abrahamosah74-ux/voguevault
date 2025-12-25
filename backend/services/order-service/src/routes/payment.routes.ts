import { Router, Request, Response, NextFunction } from 'express';
import { PaystackService } from '../../shared/services/paystack.service';
import { PaymentWorkflowService } from '../../shared/services/payment-workflow.service';
import { successResponse, errorResponse } from '../../shared/utils';
import { authMiddleware } from './middleware/auth.middleware';

const router = Router();

// Initialize services
const paystackService = new PaystackService({
  secretKey: process.env.PAYSTACK_SECRET_KEY || '',
  publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
  baseUrl: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co',
  webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || '',
  timeout: 30000,
  retryAttempts: 3
});

const paymentWorkflow = new PaymentWorkflowService(paystackService);

/**
 * POST /api/v1/payments/initialize
 * Initialize a payment for an order
 */
router.post('/initialize', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { order_id } = req.body;
    const userId = (req as any).user?.id;

    if (!order_id) {
      return res.status(400).json(errorResponse('Order ID is required', 400));
    }

    // TODO: Fetch order from database
    const order = {
      id: order_id,
      order_number: 'ORD-20250101-001',
      user_id: userId,
      total_amount: 50000,
      currency: 'NGN',
      status: 'pending'
    };

    // TODO: Fetch customer from database
    const customer = {
      id: userId,
      email: 'customer@example.com',
      first_name: 'John',
      last_name: 'Doe'
    };

    const result = await paymentWorkflow.initiatePayment(order, customer, {
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`
    });

    return res.status(200).json(
      successResponse(result, 'Payment initialized successfully')
    );
  } catch (error) {
    return res.status(500).json(
      errorResponse(error instanceof Error ? error.message : 'Payment initialization failed', 500)
    );
  }
});

/**
 * GET /api/v1/payments/verify/:reference
 * Verify a payment
 */
router.get('/verify/:reference', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json(errorResponse('Payment reference is required', 400));
    }

    const result = await paymentWorkflow.handleSuccessfulPayment(reference);

    return res.status(200).json(
      successResponse(result, 'Payment verified successfully')
    );
  } catch (error) {
    return res.status(400).json(
      errorResponse(error instanceof Error ? error.message : 'Payment verification failed', 400)
    );
  }
});

/**
 * POST /api/v1/payments/webhook
 * Handle Paystack webhook events
 */
router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const payload = req.body;

    if (!signature) {
      return res.status(400).json(errorResponse('Webhook signature is missing', 400));
    }

    // Verify webhook signature
    const isValid = paystackService.verifyWebhookSignature(JSON.stringify(payload), signature);
    if (!isValid) {
      return res.status(401).json(errorResponse('Invalid webhook signature', 401));
    }

    // Process webhook event
    await paymentWorkflow.handleWebhookEvent({
      event: payload.event,
      data: payload.data
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json(
      errorResponse('Webhook processing failed', 500)
    );
  }
});

/**
 * POST /api/v1/payments/:paymentId/refund
 * Request a refund for a payment
 */
router.post('/:paymentId/refund', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;
    const userId = (req as any).user?.id;

    if (!paymentId) {
      return res.status(400).json(errorResponse('Payment ID is required', 400));
    }

    if (!amount || amount <= 0) {
      return res.status(400).json(errorResponse('Valid amount is required', 400));
    }

    if (!reason) {
      return res.status(400).json(errorResponse('Refund reason is required', 400));
    }

    const result = await paymentWorkflow.processRefund(
      paymentId,
      amount,
      reason,
      userId
    );

    return res.status(200).json(
      successResponse(result, 'Refund processed successfully')
    );
  } catch (error) {
    return res.status(400).json(
      errorResponse(error instanceof Error ? error.message : 'Refund processing failed', 400)
    );
  }
});

/**
 * GET /api/v1/payments/:paymentId
 * Get payment details
 */
router.get('/:paymentId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json(errorResponse('Payment ID is required', 400));
    }

    // TODO: Fetch payment from database
    const payment = {
      id: paymentId,
      order_id: 'order-123',
      amount: 50000,
      status: 'captured',
      payment_method: 'paystack_card',
      created_at: new Date(),
      updated_at: new Date()
    };

    return res.status(200).json(successResponse(payment));
  } catch (error) {
    return res.status(500).json(
      errorResponse('Failed to fetch payment', 500)
    );
  }
});

/**
 * GET /api/v1/payments/orders/:orderId
 * Get payments for an order
 */
router.get('/orders/:orderId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json(errorResponse('Order ID is required', 400));
    }

    // TODO: Fetch payments from database
    const payments = [
      {
        id: 'pay-1',
        order_id: orderId,
        amount: 50000,
        status: 'captured',
        created_at: new Date()
      }
    ];

    return res.status(200).json(successResponse(payments));
  } catch (error) {
    return res.status(500).json(
      errorResponse('Failed to fetch payments', 500)
    );
  }
});

/**
 * POST /api/v1/payments/charge-saved-card
 * Charge a saved card for a customer
 */
router.post('/charge-saved-card', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization_code, amount, order_id } = req.body;
    const userId = (req as any).user?.id;

    if (!authorization_code) {
      return res.status(400).json(errorResponse('Authorization code is required', 400));
    }

    if (!amount || amount <= 0) {
      return res.status(400).json(errorResponse('Valid amount is required', 400));
    }

    const reference = `charge_${userId}_${Date.now()}`;

    const result = await paymentWorkflow.chargeAuthorization(
      userId,
      authorization_code,
      amount,
      reference,
      { order_id }
    );

    return res.status(200).json(
      successResponse(result, 'Card charged successfully')
    );
  } catch (error) {
    return res.status(400).json(
      errorResponse(error instanceof Error ? error.message : 'Card charge failed', 400)
    );
  }
});

/**
 * GET /api/v1/payments/customer/payment-methods
 * Get saved payment methods for customer
 */
router.get('/customer/payment-methods', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;

    const methods = await paymentWorkflow.getCustomerPaymentMethods(userId);

    return res.status(200).json(successResponse(methods));
  } catch (error) {
    return res.status(500).json(
      errorResponse('Failed to fetch payment methods', 500)
    );
  }
});

/**
 * POST /api/v1/payments/customer/payment-methods/:methodId/set-default
 * Set default payment method
 */
router.post('/customer/payment-methods/:methodId/set-default', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { methodId } = req.params;
    const userId = (req as any).user?.id;

    if (!methodId) {
      return res.status(400).json(errorResponse('Payment method ID is required', 400));
    }

    await paymentWorkflow.setDefaultPaymentMethod(userId, methodId);

    return res.status(200).json(
      successResponse({}, 'Default payment method updated')
    );
  } catch (error) {
    return res.status(400).json(
      errorResponse(error instanceof Error ? error.message : 'Update failed', 400)
    );
  }
});

export default router;
