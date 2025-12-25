// Order Service - Main Entry Point
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'express-async-errors';
import config from '../../config';
import { errorResponse } from '../../shared/utils';
import orderController from './controllers/order.controller';
import paymentController from './controllers/payment.controller';

const app = express();
const PORT = config.server.port;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'order-service',
    timestamp: new Date(),
  });
});

// Routes
const apiRouter = express.Router();

// Order Routes
apiRouter.post('/orders', orderController.createOrder);
apiRouter.get('/orders', orderController.getAllOrders);
apiRouter.get('/orders/:orderId', orderController.getOrderById);
apiRouter.get('/orders/user/:userId', orderController.getUserOrders);
apiRouter.put('/orders/:orderId', orderController.updateOrder);
apiRouter.post('/orders/:orderId/cancel', orderController.cancelOrder);
apiRouter.get('/orders/:orderId/tracking', orderController.getTracking);
apiRouter.post('/orders/:orderId/coupon', orderController.applyCoupon);

// Payment Routes
apiRouter.post('/payments/create-payment-intent', paymentController.createPaymentIntent);
apiRouter.post('/payments/confirm', paymentController.confirmPayment);
apiRouter.post('/payments/webhook', paymentController.handleWebhook);

app.use('/api/v1', apiRouter);

// Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Order Service Error]', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json(errorResponse(message, statusCode));
});

// Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Order Service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Order Service closed');
    process.exit(0);
  });
});

export default app;
