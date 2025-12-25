// User Service - Main Entry Point
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'express-async-errors';
import config from '../../config';
import { errorResponse } from '../../shared/utils';
import authController from './controllers/auth.controller';
import userController from './controllers/user.controller';

const app = express();
const PORT = config.server.port;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'user-service',
    timestamp: new Date(),
  });
});

// Routes
const apiRouter = express.Router();

// Auth Routes
apiRouter.post('/auth/register', authController.register);
apiRouter.post('/auth/login', authController.login);
apiRouter.post('/auth/logout', authController.logout);
apiRouter.post('/auth/refresh', authController.refreshToken);
apiRouter.post('/auth/verify-email', authController.verifyEmail);
apiRouter.post('/auth/forgot-password', authController.forgotPassword);
apiRouter.post('/auth/reset-password', authController.resetPassword);

// User Routes
apiRouter.get('/users/me', userController.getCurrentUser);
apiRouter.get('/users/:userId', userController.getUserById);
apiRouter.put('/users/:userId', userController.updateUser);
apiRouter.get('/users/:userId/addresses', userController.getAddresses);
apiRouter.post('/users/:userId/addresses', userController.addAddress);
apiRouter.put('/users/:userId/addresses/:addressId', userController.updateAddress);
apiRouter.delete('/users/:userId/addresses/:addressId', userController.deleteAddress);
apiRouter.get('/users/:userId/cart', userController.getCart);
apiRouter.post('/users/:userId/cart', userController.updateCart);
apiRouter.get('/users/:userId/wishlist', userController.getWishlist);
apiRouter.post('/users/:userId/wishlist', userController.addToWishlist);
apiRouter.delete('/users/:userId/wishlist/:productId', userController.removeFromWishlist);

app.use('/api/v1', apiRouter);

// Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[User Service Error]', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json(errorResponse(message, statusCode));
});

// Server
const server = app.listen(PORT, () => {
  console.log(`🚀 User Service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('User Service closed');
    process.exit(0);
  });
});

export default app;
