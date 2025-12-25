// Authentication Middleware
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../../shared/utils';
import { errorResponse } from '../../../shared/utils';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json(errorResponse('No token provided', 401, 'NO_TOKEN'));
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    if (!payload) {
      return res
        .status(401)
        .json(errorResponse('Invalid or expired token', 401, 'INVALID_TOKEN'));
    }

    req.user = payload;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(
        errorResponse('Authentication failed', 401, 'AUTH_FAILED')
      );
  }
};

// Optional Auth Middleware
export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);

      if (payload) {
        req.user = payload;
      }
    }

    next();
  } catch (error) {
    // Continue even if auth fails
    next();
  }
};
