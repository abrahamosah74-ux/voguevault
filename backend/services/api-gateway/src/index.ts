// API Gateway - Main Entry Point
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import 'express-async-errors';
import { config } from '../../../config';
import { errorResponse } from '../../../shared/utils';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';

const app = express();
const PORT = config.server.port;

// ============ Middleware ============

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  })
);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging
app.use(morgan('combined'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Request ID Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  next();
});

// ============ Health Check ============
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// ============ API Routes ============
const apiRouter = express.Router();

// Auth Routes
apiRouter.use('/auth', authRoutes);

// User Routes
apiRouter.use('/users', userRoutes);

// Product Routes
apiRouter.use('/products', productRoutes);

// Order Routes
apiRouter.use('/orders', orderRoutes);

app.use('/api/v1', apiRouter);

// ============ 404 Handler ============
app.use((req: Request, res: Response) => {
  res.status(404).json(
    errorResponse('Route not found', 404, 'ROUTE_NOT_FOUND')
  );
});

// ============ Error Handler ============
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(statusCode).json(errorResponse(message, statusCode, code));
});

// ============ Server ============
const server = app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${config.server.nodeEnv}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: any;
    }
  }
}
