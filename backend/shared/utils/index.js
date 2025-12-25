"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDateRange = exports.addDays = exports.slugify = exports.sanitizeObject = exports.delay = exports.calculateDiscount = exports.generateSKU = exports.generateOrderNumber = exports.errorResponse = exports.successResponse = exports.ApiError = exports.parsePagination = exports.isValidUUID = exports.isValidPassword = exports.isValidPhoneNumber = exports.isValidEmail = exports.comparePassword = exports.hashPassword = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = require("../config");
const generateAccessToken = (id, email) => {
    return jsonwebtoken_1.default.sign({ id, email }, config_1.config.jwt.accessTokenSecret, {
        expiresIn: config_1.config.jwt.accessTokenExpiry,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (id, email) => {
    return jsonwebtoken_1.default.sign({ id, email }, config_1.config.jwt.refreshTokenSecret, {
        expiresIn: config_1.config.jwt.refreshTokenExpiry,
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, config_1.config.jwt.accessTokenSecret);
    }
    catch (error) {
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, config_1.config.jwt.refreshTokenSecret);
    }
    catch (error) {
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const hashPassword = async (password) => {
    const salt = await bcrypt_1.default.genSalt(10);
    return bcrypt_1.default.hash(password, salt);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    return bcrypt_1.default.compare(password, hash);
};
exports.comparePassword = comparePassword;
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
};
exports.isValidPhoneNumber = isValidPhoneNumber;
const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
};
exports.isValidPassword = isValidPassword;
const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};
exports.isValidUUID = isValidUUID;
const parsePagination = (page, limit) => {
    const pageNum = Math.max(1, parseInt(String(page) || '1', 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit) || '10', 10)));
    const offset = (pageNum - 1) * limitNum;
    return { page: pageNum, limit: limitNum, offset };
};
exports.parsePagination = parsePagination;
class ApiError extends Error {
    constructor(statusCode, message, code) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.code = code;
        this.name = 'ApiError';
    }
}
exports.ApiError = ApiError;
const successResponse = (data, message = 'Success', statusCode = 200) => {
    return {
        success: true,
        statusCode,
        data,
        message,
        timestamp: new Date(),
    };
};
exports.successResponse = successResponse;
const errorResponse = (message, statusCode = 500, code) => {
    return {
        success: false,
        statusCode,
        error: message,
        code,
        timestamp: new Date(),
    };
};
exports.errorResponse = errorResponse;
const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};
exports.generateOrderNumber = generateOrderNumber;
const generateSKU = (prefix) => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
    return `${prefix}-${timestamp}${random}`;
};
exports.generateSKU = generateSKU;
const calculateDiscount = (originalPrice, discountedPrice) => {
    const amount = originalPrice - discountedPrice;
    const percentage = (amount / originalPrice) * 100;
    return { amount, percentage: Math.round(percentage * 100) / 100 };
};
exports.calculateDiscount = calculateDiscount;
const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
exports.delay = delay;
const sanitizeObject = (obj) => {
    const sanitized = {};
    for (const key in obj) {
        if (obj[key] !== null &&
            obj[key] !== undefined &&
            obj[key] !== '' &&
            obj[key] !== false) {
            sanitized[key] = obj[key];
        }
    }
    return sanitized;
};
exports.sanitizeObject = sanitizeObject;
const slugify = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
exports.slugify = slugify;
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
exports.addDays = addDays;
const getDateRange = (startDate, endDate) => {
    return {
        start: new Date(startDate),
        end: new Date(endDate),
    };
};
exports.getDateRange = getDateRange;
//# sourceMappingURL=index.js.map