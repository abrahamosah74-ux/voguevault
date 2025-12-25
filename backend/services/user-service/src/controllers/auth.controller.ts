// Auth Controller
import { Request, Response } from 'express';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  isValidEmail,
  isValidPassword,
  ApiError,
  successResponse,
} from '../../../shared/utils';

interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

class AuthController {
  // Register User
  async register(req: Request, res: Response) {
    try {
      const { email, password, first_name, last_name } = req.body as RegisterRequest;

      // Validate input
      if (!email || !password) {
        throw new ApiError(400, 'Email and password are required');
      }

      if (!isValidEmail(email)) {
        throw new ApiError(400, 'Invalid email format');
      }

      if (!isValidPassword(password)) {
        throw new ApiError(
          400,
          'Password must be at least 8 characters with uppercase, lowercase, and numbers'
        );
      }

      // Check if user exists (simplified - would connect to MongoDB)
      // const existingUser = await User.findOne({ email });
      // if (existingUser) {
      //   throw new ApiError(409, 'User already exists');
      // }

      // Hash password and create user (simplified)
      const hashedPassword = await hashPassword(password);

      // Create user in MongoDB (simplified)
      const user = {
        id: 'user_' + Date.now(),
        email,
        password_hash: hashedPassword,
        first_name,
        last_name,
        email_verified: false,
        loyalty_points: 0,
        loyalty_tier: 'bronze',
        preferences: {
          newsletter: true,
          sms_notifications: false,
          email_marketing: true,
          currency: 'USD',
          language: 'en',
        },
        stats: {
          total_orders: 0,
          total_spent: 0,
        },
        created_at: new Date(),
        updated_at: new Date(),
      };

      const accessToken = generateAccessToken(user.id, user.email);
      const refreshToken = generateRefreshToken(user.id, user.email);

      res.status(201).json(
        successResponse(
          {
            user: { id: user.id, email: user.email, first_name, last_name },
            access_token: accessToken,
            refresh_token: refreshToken,
          },
          'User registered successfully',
          201
        )
      );
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        statusCode,
      });
    }
  }

  // Login User
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body as LoginRequest;

      if (!email || !password) {
        throw new ApiError(400, 'Email and password are required');
      }

      // Find user by email (simplified - would connect to MongoDB)
      // const user = await User.findOne({ email });
      // if (!user) {
      //   throw new ApiError(401, 'Invalid credentials');
      // }

      // For demo, create mock user
      const user = {
        id: 'user_' + Date.now(),
        email,
        password_hash: await hashPassword(password),
      };

      // Verify password (simplified - would compare actual password)
      const isPasswordValid = await comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid credentials');
      }

      const accessToken = generateAccessToken(user.id, user.email);
      const refreshToken = generateRefreshToken(user.id, user.email);

      res.json(
        successResponse({
          user: { id: user.id, email: user.email },
          access_token: accessToken,
          refresh_token: refreshToken,
        })
      );
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        statusCode,
      });
    }
  }

  // Logout User
  async logout(req: Request, res: Response) {
    try {
      // In real implementation, would invalidate token in Redis/database
      res.json(successResponse(null, 'Logged out successfully'));
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        statusCode,
      });
    }
  }

  // Refresh Token
  async refreshToken(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        throw new ApiError(400, 'Refresh token is required');
      }

      // Verify refresh token (simplified)
      const newAccessToken = generateAccessToken('user_id', 'user@example.com');

      res.json(
        successResponse({
          access_token: newAccessToken,
        })
      );
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        statusCode,
      });
    }
  }

  // Verify Email
  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        throw new ApiError(400, 'Verification token is required');
      }

      // Verify token and mark email as verified (simplified)
      res.json(successResponse(null, 'Email verified successfully'));
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        statusCode,
      });
    }
  }

  // Forgot Password
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ApiError(400, 'Email is required');
      }

      // Send password reset email (simplified)
      res.json(
        successResponse(
          null,
          'Password reset email sent successfully'
        )
      );
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        statusCode,
      });
    }
  }

  // Reset Password
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        throw new ApiError(400, 'Token and password are required');
      }

      // Verify token and reset password (simplified)
      res.json(successResponse(null, 'Password reset successfully'));
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        statusCode,
      });
    }
  }
}

export default new AuthController();
