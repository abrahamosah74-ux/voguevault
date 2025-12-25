// Order Routes
import { Router, Request, Response } from 'express';
import axios from 'axios';
import config from '../../../config';
import { successResponse, errorResponse, parsePagination } from '../../../shared/utils';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const ORDER_SERVICE_URL = config.services.orderService.url;

// Create Order
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    const response = await axios.post(`${ORDER_SERVICE_URL}/orders`, req.body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res
      .status(201)
      .json(successResponse(response.data.data, 'Order created', 201));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Get All Orders (for admin/user)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { page, limit, status } = req.query;
    const token = req.headers.authorization?.split(' ')[1];
    const pagination = parsePagination(page, limit);

    const response = await axios.get(`${ORDER_SERVICE_URL}/orders`, {
      params: {
        ...pagination,
        status,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json(successResponse(response.data.data, 'Orders retrieved'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Get Order by ID
router.get('/:orderId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    const response = await axios.get(`${ORDER_SERVICE_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json(successResponse(response.data.data, 'Order retrieved'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Get User Orders
router.get('/user/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page, limit, status } = req.query;
    const token = req.headers.authorization?.split(' ')[1];
    const pagination = parsePagination(page, limit);

    const response = await axios.get(
      `${ORDER_SERVICE_URL}/orders/user/${userId}`,
      {
        params: {
          ...pagination,
          status,
        },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    res.json(successResponse(response.data.data, 'User orders retrieved'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Update Order
router.put('/:orderId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    const response = await axios.put(
      `${ORDER_SERVICE_URL}/orders/${orderId}`,
      req.body,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    res.json(successResponse(response.data.data, 'Order updated'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Cancel Order
router.post('/:orderId/cancel', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    const response = await axios.post(
      `${ORDER_SERVICE_URL}/orders/${orderId}/cancel`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    res.json(successResponse(response.data.data, 'Order cancelled'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Get Order Tracking
router.get('/:orderId/tracking', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const response = await axios.get(
      `${ORDER_SERVICE_URL}/orders/${orderId}/tracking`
    );

    res.json(successResponse(response.data.data, 'Tracking info retrieved'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Apply Coupon
router.post('/:orderId/coupon', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    const response = await axios.post(
      `${ORDER_SERVICE_URL}/orders/${orderId}/coupon`,
      req.body,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    res.json(successResponse(response.data.data, 'Coupon applied'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

export default router;
