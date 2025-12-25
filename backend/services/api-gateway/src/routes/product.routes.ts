// Product Routes
import { Router, Request, Response } from 'express';
import axios from 'axios';
import { config } from '../../../../config';
import { successResponse, errorResponse, parsePagination } from 'shared/utils';

const router = Router();
const PRODUCT_SERVICE_URL = config.services.productService.url;

// Get All Products
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page, limit, category, brand, minPrice, maxPrice, search, sort } = req.query;
    const pagination = parsePagination(page as string | number, limit as string | number);

    const response = await axios.get(`${PRODUCT_SERVICE_URL}/products`, {
      params: {
        ...pagination,
        category,
        brand,
        minPrice,
        maxPrice,
        search,
        sort,
      },
    });

    res.json(
      successResponse(response.data.data, 'Products retrieved')
    );
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Get Product by ID
router.get('/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const response = await axios.get(
      `${PRODUCT_SERVICE_URL}/products/${productId}`
    );

    res.json(successResponse(response.data.data, 'Product retrieved'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Get Product Variants
router.get('/:productId/variants', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const response = await axios.get(
      `${PRODUCT_SERVICE_URL}/products/${productId}/variants`
    );

    res.json(successResponse(response.data.data, 'Variants retrieved'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Get Categories
router.get('/categories/list', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/categories`);

    res.json(successResponse(response.data.data, 'Categories retrieved'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Get Category by ID
router.get('/categories/:categoryId', async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;

    const response = await axios.get(
      `${PRODUCT_SERVICE_URL}/categories/${categoryId}`
    );

    res.json(successResponse(response.data.data, 'Category retrieved'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Search Products
router.get('/search/query', async (req: Request, res: Response) => {
  try {
    const { q, page, limit } = req.query;
    const pagination = parsePagination(page as string | number, limit as string | number);

    const response = await axios.get(`${PRODUCT_SERVICE_URL}/search`, {
      params: {
        q,
        ...pagination,
      },
    });

    res.json(successResponse(response.data.data, 'Search results'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Get Featured Products
router.get('/featured/list', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(
      `${PRODUCT_SERVICE_URL}/products/featured`
    );

    res.json(successResponse(response.data.data, 'Featured products retrieved'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Get New Arrivals
router.get('/arrivals/new', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;

    const response = await axios.get(
      `${PRODUCT_SERVICE_URL}/products/new-arrivals`,
      {
        params: { limit },
      }
    );

    res.json(successResponse(response.data.data, 'New arrivals retrieved'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Get Bestsellers
router.get('/bestsellers/top', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;

    const response = await axios.get(
      `${PRODUCT_SERVICE_URL}/products/bestsellers`,
      {
        params: { limit },
      }
    );

    res.json(successResponse(response.data.data, 'Bestsellers retrieved'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

export default router;
