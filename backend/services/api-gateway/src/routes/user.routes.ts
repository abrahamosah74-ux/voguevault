// User Routes
import { Router, Request, Response } from 'express';
import axios from 'axios';
import config from '../../../config';
import { successResponse, errorResponse } from '../../../shared/utils';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const USER_SERVICE_URL = config.services.userService.url;

// Get Current User
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    const response = await axios.get(`${USER_SERVICE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json(successResponse(response.data.data, 'User retrieved'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Get User by ID
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const response = await axios.get(`${USER_SERVICE_URL}/users/${userId}`);

    res.json(successResponse(response.data.data, 'User retrieved'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Update User Profile
router.put('/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    const response = await axios.put(
      `${USER_SERVICE_URL}/users/${userId}`,
      req.body,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    res.json(successResponse(response.data.data, 'User updated'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Get User Addresses
router.get('/:userId/addresses', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const response = await axios.get(
      `${USER_SERVICE_URL}/users/${userId}/addresses`
    );

    res.json(successResponse(response.data.data, 'Addresses retrieved'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Add User Address
router.post('/:userId/addresses', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    const response = await axios.post(
      `${USER_SERVICE_URL}/users/${userId}/addresses`,
      req.body,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    res
      .status(201)
      .json(successResponse(response.data.data, 'Address added', 201));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Update User Address
router.put(
  '/:userId/addresses/:addressId',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { userId, addressId } = req.params;
      const token = req.headers.authorization?.split(' ')[1];

      const response = await axios.put(
        `${USER_SERVICE_URL}/users/${userId}/addresses/${addressId}`,
        req.body,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      res.json(successResponse(response.data.data, 'Address updated'));
    } catch (error: any) {
      const statusCode = error.response?.status || error.statusCode || 500;
      const message = error.response?.data?.message || error.message;
      res.status(statusCode).json(errorResponse(message, statusCode));
    }
  }
);

// Delete User Address
router.delete(
  '/:userId/addresses/:addressId',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { userId, addressId } = req.params;
      const token = req.headers.authorization?.split(' ')[1];

      await axios.delete(
        `${USER_SERVICE_URL}/users/${userId}/addresses/${addressId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      res.json(successResponse(null, 'Address deleted'));
    } catch (error: any) {
      const statusCode = error.response?.status || error.statusCode || 500;
      const message = error.response?.data?.message || error.message;
      res.status(statusCode).json(errorResponse(message, statusCode));
    }
  }
);

// Get User Cart
router.get('/:userId/cart', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const response = await axios.get(`${USER_SERVICE_URL}/users/${userId}/cart`);

    res.json(successResponse(response.data.data, 'Cart retrieved'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Get User Wishlist
router.get('/:userId/wishlist', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const response = await axios.get(
      `${USER_SERVICE_URL}/users/${userId}/wishlist`
    );

    res.json(successResponse(response.data.data, 'Wishlist retrieved'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

export default router;
