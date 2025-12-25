// Product Service - Main Entry Point
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'express-async-errors';
import config from '../../config';
import { errorResponse } from '../../shared/utils';
import productController from './controllers/product.controller';
import categoryController from './controllers/category.controller';

const app = express();
const PORT = config.server.port;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'product-service',
    timestamp: new Date(),
  });
});

// Routes
const apiRouter = express.Router();

// Product Routes
apiRouter.get('/products', productController.getAllProducts);
apiRouter.get('/products/:productId', productController.getProductById);
apiRouter.post('/products', productController.createProduct);
apiRouter.put('/products/:productId', productController.updateProduct);
apiRouter.delete('/products/:productId', productController.deleteProduct);
apiRouter.get('/products/:productId/variants', productController.getVariants);
apiRouter.post('/products/:productId/variants', productController.createVariant);
apiRouter.get('/products/featured', productController.getFeaturedProducts);
apiRouter.get('/products/new-arrivals', productController.getNewArrivals);
apiRouter.get('/products/bestsellers', productController.getBestsellers);

// Category Routes
apiRouter.get('/categories', categoryController.getAllCategories);
apiRouter.get('/categories/:categoryId', categoryController.getCategoryById);
apiRouter.post('/categories', categoryController.createCategory);
apiRouter.put('/categories/:categoryId', categoryController.updateCategory);
apiRouter.delete('/categories/:categoryId', categoryController.deleteCategory);

// Search Route
apiRouter.get('/search', productController.searchProducts);

app.use('/api/v1', apiRouter);

// Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Product Service Error]', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json(errorResponse(message, statusCode));
});

// Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Product Service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Product Service closed');
    process.exit(0);
  });
});

export default app;
