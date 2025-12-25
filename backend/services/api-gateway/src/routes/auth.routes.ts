// Authentication Routes
import { Router, Request, Response } from 'express';
import axios from 'axios';
import { config } from '../../../../config';
import { successResponse, errorResponse, ApiError } from 'shared/utils';

const router = Router();
const USER_SERVICE_URL = config.services.userService.url;

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const response = await axios.post(`${USER_SERVICE_URL}/auth/register`, {
      email,
      password,
      first_name,
      last_name,
    });

    res
      .status(201)
      .json(successResponse(response.data.data, 'User registered successfully', 201));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const response = await axios.post(`${USER_SERVICE_URL}/auth/login`, {
      email,
      password,
    });

    res.json(successResponse(response.data.data, 'Login successful'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Refresh Token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw new ApiError(400, 'Refresh token is required');
    }

    const response = await axios.post(`${USER_SERVICE_URL}/auth/refresh`, {
      refresh_token,
    });

    res.json(successResponse(response.data.data, 'Token refreshed'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ApiError(400, 'Token is required');
    }

    const response = await axios.post(
      `${USER_SERVICE_URL}/auth/logout`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    res.json(successResponse(response.data.data, 'Logout successful'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Verify Email
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new ApiError(400, 'Verification token is required');
    }

    const response = await axios.post(`${USER_SERVICE_URL}/auth/verify-email`, {
      token,
    });

    res.json(successResponse(response.data.data, 'Email verified successfully'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Forgot Password
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, 'Email is required');
    }

    const response = await axios.post(`${USER_SERVICE_URL}/auth/forgot-password`, {
      email,
    });

    res.json(successResponse(response.data.data, 'Password reset email sent'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

// Reset Password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new ApiError(400, 'Token and password are required');
    }

    const response = await axios.post(`${USER_SERVICE_URL}/auth/reset-password`, {
      token,
      password,
    });

    res.json(successResponse(response.data.data, 'Password reset successfully'));
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message = error.response?.data?.message || error.message;
    res.status(statusCode).json(errorResponse(message, statusCode));
  }
});

export default router;
