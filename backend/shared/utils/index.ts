// Shared utility functions for VogueVault

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config';
import { JwtPayload } from '../types';

// ============ JWT Functions ============
export const generateAccessToken = (id: string, email: string): string => {
  return jwt.sign({ id, email }, config.jwt.accessTokenSecret, {
    expiresIn: config.jwt.accessTokenExpiry,
  });
};

export const generateRefreshToken = (id: string, email: string): string => {
  return jwt.sign({ id, email }, config.jwt.refreshTokenSecret, {
    expiresIn: config.jwt.refreshTokenExpiry,
  });
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, config.jwt.accessTokenSecret) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, config.jwt.refreshTokenSecret) as JwtPayload;
  } catch (error) {
    return null;
  }
};

// ============ Password Functions ============
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// ============ Validation Functions ============
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  // Basic validation - adjust regex as needed
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// ============ Pagination Functions ============
export const parsePagination = (
  page?: string | number,
  limit?: string | number
) => {
  const pageNum = Math.max(1, parseInt(String(page) || '1', 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(String(limit) || '10', 10)));
  const offset = (pageNum - 1) * limitNum;

  return { page: pageNum, limit: limitNum, offset };
};

// ============ Error Handling ============
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============ Response Formatting ============
export const successResponse = <T>(
  data: T,
  message: string = 'Success',
  statusCode: number = 200
) => {
  return {
    success: true,
    statusCode,
    data,
    message,
    timestamp: new Date(),
  };
};

export const errorResponse = (
  message: string,
  statusCode: number = 500,
  code?: string
) => {
  return {
    success: false,
    statusCode,
    error: message,
    code,
    timestamp: new Date(),
  };
};

// ============ Utility Functions ============
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

export const generateSKU = (prefix: string): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${prefix}-${timestamp}${random}`;
};

export const calculateDiscount = (
  originalPrice: number,
  discountedPrice: number
): { amount: number; percentage: number } => {
  const amount = originalPrice - discountedPrice;
  const percentage = (amount / originalPrice) * 100;
  return { amount, percentage: Math.round(percentage * 100) / 100 };
};

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  for (const key in obj) {
    if (
      obj[key] !== null &&
      obj[key] !== undefined &&
      obj[key] !== '' &&
      obj[key] !== false
    ) {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
};

// ============ Slugify ============
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ============ Date Functions ============
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getDateRange = (
  startDate: Date,
  endDate: Date
): { start: Date; end: Date } => {
  return {
    start: new Date(startDate),
    end: new Date(endDate),
  };
};
