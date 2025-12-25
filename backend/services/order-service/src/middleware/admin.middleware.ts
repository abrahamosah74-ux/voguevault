import { Request, Response, NextFunction } from 'express';

export enum AdminPermission {
  // Dashboard
  VIEW_DASHBOARD = 'dashboard:view',
  
  // Orders
  VIEW_ORDERS = 'orders:view',
  EDIT_ORDERS = 'orders:edit',
  DELETE_ORDERS = 'orders:delete',
  EXPORT_ORDERS = 'orders:export',
  
  // Products
  VIEW_PRODUCTS = 'products:view',
  CREATE_PRODUCTS = 'products:create',
  EDIT_PRODUCTS = 'products:edit',
  DELETE_PRODUCTS = 'products:delete',
  MANAGE_INVENTORY = 'inventory:manage',
  
  // Customers
  VIEW_CUSTOMERS = 'customers:view',
  EDIT_CUSTOMERS = 'customers:edit',
  EXPORT_CUSTOMERS = 'customers:export',
  
  // Payments
  VIEW_PAYMENTS = 'payments:view',
  PROCESS_REFUNDS = 'payments:refund',
  VIEW_SETTLEMENTS = 'settlements:view',
  
  // Marketing
  MANAGE_PROMOTIONS = 'promotions:manage',
  MANAGE_CAMPAIGNS = 'campaigns:manage',
  
  // Analytics
  VIEW_ANALYTICS = 'analytics:view',
  EXPORT_REPORTS = 'reports:export',
  
  // Settings
  VIEW_SETTINGS = 'settings:view',
  EDIT_SETTINGS = 'settings:edit',
  MANAGE_ADMINS = 'admins:manage'
}

export const ADMIN_ROLES = {
  SUPER_ADMIN: Object.values(AdminPermission),
  MANAGER: [
    AdminPermission.VIEW_DASHBOARD,
    AdminPermission.VIEW_ORDERS,
    AdminPermission.EDIT_ORDERS,
    AdminPermission.EXPORT_ORDERS,
    AdminPermission.VIEW_PRODUCTS,
    AdminPermission.CREATE_PRODUCTS,
    AdminPermission.EDIT_PRODUCTS,
    AdminPermission.MANAGE_INVENTORY,
    AdminPermission.VIEW_CUSTOMERS,
    AdminPermission.EDIT_CUSTOMERS,
    AdminPermission.EXPORT_CUSTOMERS,
    AdminPermission.VIEW_PAYMENTS,
    AdminPermission.PROCESS_REFUNDS,
    AdminPermission.MANAGE_PROMOTIONS,
    AdminPermission.VIEW_ANALYTICS,
    AdminPermission.EXPORT_REPORTS
  ],
  CONTENT_MANAGER: [
    AdminPermission.VIEW_DASHBOARD,
    AdminPermission.VIEW_ORDERS,
    AdminPermission.VIEW_PRODUCTS,
    AdminPermission.CREATE_PRODUCTS,
    AdminPermission.EDIT_PRODUCTS,
    AdminPermission.MANAGE_INVENTORY
  ],
  CUSTOMER_SUPPORT: [
    AdminPermission.VIEW_DASHBOARD,
    AdminPermission.VIEW_ORDERS,
    AdminPermission.EDIT_ORDERS,
    AdminPermission.VIEW_CUSTOMERS,
    AdminPermission.EDIT_CUSTOMERS
  ]
};

export interface AdminUser {
  id: string;
  user_id: string;
  role: keyof typeof ADMIN_ROLES;
  permissions: AdminPermission[];
  is_active: boolean;
}

/**
 * Middleware to verify admin access
 */
export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // TODO: Fetch admin user from database
    const adminUser: AdminUser | null = null; // Would be fetched from DB

    if (!adminUser) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    if (!adminUser.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Admin account is inactive'
      });
    }

    // Attach admin info to request
    (req as any).admin = adminUser;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Admin verification failed'
    });
  }
};

/**
 * Middleware to verify specific permissions
 */
export const requirePermissions = (permissions: AdminPermission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const admin = (req as any).admin as AdminUser;

    if (!admin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const hasPermission = permissions.some(permission =>
      admin.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        required: permissions,
        granted: admin.permissions
      });
    }

    next();
  };
};

/**
 * Middleware to log admin actions
 */
export const auditLogMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const admin = (req as any).admin;
  const startTime = Date.now();

  // Capture response end to log it
  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - startTime;

    // TODO: Log to audit_logs table in database
    console.log('[AUDIT LOG]', {
      admin_id: admin?.id,
      action: `${req.method} ${req.path}`,
      entity_type: extractEntityType(req.path),
      status_code: res.statusCode,
      duration,
      timestamp: new Date()
    });

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Extract entity type from route path
 */
function extractEntityType(path: string): string {
  const match = path.match(/\/admin\/([a-z]+)/);
  return match ? match[1] : 'unknown';
}

export default adminMiddleware;
