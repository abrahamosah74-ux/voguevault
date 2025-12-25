import { JwtPayload } from '../types';
export declare const generateAccessToken: (id: string, email: string) => string;
export declare const generateRefreshToken: (id: string, email: string) => string;
export declare const verifyAccessToken: (token: string) => JwtPayload | null;
export declare const verifyRefreshToken: (token: string) => JwtPayload | null;
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
export declare const isValidEmail: (email: string) => boolean;
export declare const isValidPhoneNumber: (phone: string) => boolean;
export declare const isValidPassword: (password: string) => boolean;
export declare const isValidUUID: (uuid: string) => boolean;
export declare const parsePagination: (page?: string | number, limit?: string | number) => {
    page: number;
    limit: number;
    offset: number;
};
export declare class ApiError extends Error {
    statusCode: number;
    message: string;
    code?: string | undefined;
    constructor(statusCode: number, message: string, code?: string | undefined);
}
export declare const successResponse: <T>(data: T, message?: string, statusCode?: number) => {
    success: boolean;
    statusCode: number;
    data: T;
    message: string;
    timestamp: Date;
};
export declare const errorResponse: (message: string, statusCode?: number, code?: string) => {
    success: boolean;
    statusCode: number;
    error: string;
    code: string | undefined;
    timestamp: Date;
};
export declare const generateOrderNumber: () => string;
export declare const generateSKU: (prefix: string) => string;
export declare const calculateDiscount: (originalPrice: number, discountedPrice: number) => {
    amount: number;
    percentage: number;
};
export declare const delay: (ms: number) => Promise<void>;
export declare const sanitizeObject: (obj: Record<string, any>) => Record<string, any>;
export declare const slugify: (text: string) => string;
export declare const addDays: (date: Date, days: number) => Date;
export declare const getDateRange: (startDate: Date, endDate: Date) => {
    start: Date;
    end: Date;
};
//# sourceMappingURL=index.d.ts.map