import { Pool, Client } from 'pg';

export class DatabaseService {
  private pool: Pool;

  constructor(connectionString?: string) {
    const config = connectionString ? { connectionString } : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'voguevault',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    };

    this.pool = new Pool(config);
  }

  /**
   * Execute a query
   */
  async query(sql: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result;
    } finally {
      client.release();
    }
  }

  /**
   * Get a single row
   */
  async getOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const result = await this.query(sql, params);
    return result.rows[0] || null;
  }

  /**
   * Get multiple rows
   */
  async getMany<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const result = await this.query(sql, params);
    return result.rows;
  }

  /**
   * Insert a row
   */
  async insert<T = any>(table: string, data: Record<string, any>): Promise<T | null> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(',');

    const sql = `
      INSERT INTO ${table} (${columns.join(',')})
      VALUES (${placeholders})
      RETURNING *
    `;

    return await this.getOne<T>(sql, values);
  }

  /**
   * Update rows
   */
  async update<T = any>(table: string, data: Record<string, any>, where: Record<string, any>): Promise<T[]> {
    const setColumns = Object.keys(data).map((col, i) => `${col} = $${i + 1}`).join(',');
    const whereColumns = Object.keys(where).map((col, i) => `${col} = $${Object.keys(data).length + i + 1}`).join(' AND ');
    const values = [...Object.values(data), ...Object.values(where)];

    const sql = `
      UPDATE ${table}
      SET ${setColumns}
      WHERE ${whereColumns}
      RETURNING *
    `;

    return await this.getMany<T>(sql, values);
  }

  /**
   * Delete rows
   */
  async delete(table: string, where: Record<string, any>): Promise<number> {
    const whereColumns = Object.keys(where).map((col, i) => `${col} = $${i + 1}`).join(' AND ');
    const values = Object.values(where);

    const sql = `
      DELETE FROM ${table}
      WHERE ${whereColumns}
    `;

    const result = await this.query(sql, values);
    return result.rowCount;
  }

  // PAYMENT OPERATIONS

  async createPayment(data: any): Promise<any> {
    return this.insert('payments', {
      order_id: data.order_id,
      payment_reference: data.payment_reference,
      amount: data.amount,
      currency: data.currency || 'NGN',
      payment_method: data.payment_method,
      status: data.status || 'pending',
      metadata: JSON.stringify(data.metadata || {}),
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  async getPayment(paymentId: string): Promise<any> {
    return this.getOne(
      'SELECT * FROM payments WHERE id = $1',
      [paymentId]
    );
  }

  async getPaymentByReference(reference: string): Promise<any> {
    return this.getOne(
      'SELECT * FROM payments WHERE payment_reference = $1',
      [reference]
    );
  }

  async updatePayment(paymentId: string, updates: any): Promise<any> {
    return this.update('payments', updates, { id: paymentId });
  }

  async getPaymentsByOrder(orderId: string): Promise<any[]> {
    return this.getMany(
      'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC',
      [orderId]
    );
  }

  // REFUND OPERATIONS

  async createRefund(data: any): Promise<any> {
    return this.insert('payment_refunds', {
      payment_id: data.payment_id,
      refund_reference: data.refund_reference,
      amount: data.amount,
      reason: data.reason,
      status: data.status || 'pending',
      processed_by: data.processed_by,
      created_at: new Date()
    });
  }

  async getRefund(refundId: string): Promise<any> {
    return this.getOne(
      'SELECT * FROM payment_refunds WHERE id = $1',
      [refundId]
    );
  }

  async updateRefund(refundId: string, updates: any): Promise<any> {
    return this.update('payment_refunds', updates, { id: refundId });
  }

  async getRefundsByPayment(paymentId: string): Promise<any[]> {
    return this.getMany(
      'SELECT * FROM payment_refunds WHERE payment_id = $1 ORDER BY created_at DESC',
      [paymentId]
    );
  }

  // CUSTOMER PAYMENT METHODS

  async createCustomerPaymentMethod(data: any): Promise<any> {
    return this.insert('customer_payment_methods', {
      customer_id: data.customer_id,
      paystack_authorization_code: data.paystack_authorization_code,
      paystack_customer_code: data.paystack_customer_code,
      card_last4: data.card_last4,
      card_type: data.card_type,
      card_exp_month: data.card_exp_month,
      card_exp_year: data.card_exp_year,
      card_bank: data.card_bank,
      channel: data.channel,
      is_default: data.is_default || false,
      is_active: true,
      created_at: new Date()
    });
  }

  async getCustomerPaymentMethods(customerId: string): Promise<any[]> {
    return this.getMany(
      'SELECT * FROM customer_payment_methods WHERE customer_id = $1 AND is_active = true ORDER BY is_default DESC, created_at DESC',
      [customerId]
    );
  }

  async setDefaultPaymentMethod(customerId: string, methodId: string): Promise<any> {
    // Unset all other defaults
    await this.query(
      'UPDATE customer_payment_methods SET is_default = false WHERE customer_id = $1',
      [customerId]
    );

    // Set this one as default
    return this.update('customer_payment_methods', { is_default: true }, { id: methodId });
  }

  // ORDER OPERATIONS

  async getOrder(orderId: string): Promise<any> {
    return this.getOne(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );
  }

  async getOrders(filters?: any): Promise<any[]> {
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];

    if (filters?.user_id) {
      sql += ` AND user_id = $${params.length + 1}`;
      params.push(filters.user_id);
    }

    if (filters?.status) {
      sql += ` AND status = $${params.length + 1}`;
      params.push(filters.status);
    }

    if (filters?.payment_status) {
      sql += ` AND payment_status = $${params.length + 1}`;
      params.push(filters.payment_status);
    }

    sql += ' ORDER BY created_at DESC';

    return this.getMany(sql, params);
  }

  async updateOrder(orderId: string, updates: any): Promise<any> {
    return this.update('orders', { ...updates, updated_at: new Date() }, { id: orderId });
  }

  async createOrder(data: any): Promise<any> {
    return this.insert('orders', {
      order_number: data.order_number,
      user_id: data.user_id,
      guest_email: data.guest_email,
      status: data.status || 'pending',
      payment_status: data.payment_status || 'pending',
      subtotal: data.subtotal || 0,
      shipping_amount: data.shipping_amount || 0,
      tax_amount: data.tax_amount || 0,
      discount_amount: data.discount_amount || 0,
      total_amount: data.total_amount || 0,
      currency: data.currency || 'NGN',
      billing_address: JSON.stringify(data.billing_address),
      shipping_address: JSON.stringify(data.shipping_address),
      customer_notes: data.customer_notes,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  // WEBHOOK OPERATIONS

  async createWebhookLog(data: any): Promise<any> {
    return this.insert('payment_webhook_logs', {
      event_type: data.event_type,
      paystack_event_id: data.paystack_event_id,
      payment_id: data.payment_id,
      payload: JSON.stringify(data.payload),
      processed: data.processed || false,
      processing_error: data.processing_error,
      created_at: new Date()
    });
  }

  async getWebhookLog(logId: string): Promise<any> {
    return this.getOne(
      'SELECT * FROM payment_webhook_logs WHERE id = $1',
      [logId]
    );
  }

  async updateWebhookLog(logId: string, updates: any): Promise<any> {
    return this.update('payment_webhook_logs', updates, { id: logId });
  }

  async getUnprocessedWebhooks(): Promise<any[]> {
    return this.getMany(
      'SELECT * FROM payment_webhook_logs WHERE processed = false ORDER BY created_at ASC LIMIT 100'
    );
  }

  // USER OPERATIONS

  async getUser(userId: string): Promise<any> {
    return this.getOne(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
  }

  async getUserByEmail(email: string): Promise<any> {
    return this.getOne(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
  }

  async updateUser(userId: string, updates: any): Promise<any> {
    return this.update('users', { ...updates, updated_at: new Date() }, { id: userId });
  }

  // PRODUCT OPERATIONS

  async getProduct(productId: string): Promise<any> {
    return this.getOne(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );
  }

  async getProducts(filters?: any): Promise<any[]> {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (filters?.category_id) {
      sql += ` AND category_id = $${params.length + 1}`;
      params.push(filters.category_id);
    }

    if (filters?.status) {
      sql += ` AND status = $${params.length + 1}`;
      params.push(filters.status);
    }

    sql += ' ORDER BY created_at DESC';

    return this.getMany(sql, params);
  }

  async createProduct(data: any): Promise<any> {
    return this.insert('products', {
      sku: data.sku,
      name: data.name,
      slug: data.slug,
      description: data.description,
      category_id: data.category_id,
      brand_id: data.brand_id,
      base_price: data.base_price,
      compare_at_price: data.compare_at_price,
      cost_price: data.cost_price,
      status: data.status || 'draft',
      is_featured: data.is_featured || false,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  async updateProduct(productId: string, updates: any): Promise<any> {
    return this.update('products', { ...updates, updated_at: new Date() }, { id: productId });
  }

  // INVENTORY OPERATIONS

  async getVariant(variantId: string): Promise<any> {
    return this.getOne(
      'SELECT * FROM product_variants WHERE id = $1',
      [variantId]
    );
  }

  async getProductVariants(productId: string): Promise<any[]> {
    return this.getMany(
      'SELECT * FROM product_variants WHERE product_id = $1 ORDER BY created_at ASC',
      [productId]
    );
  }

  async updateVariantInventory(variantId: string, quantity: number): Promise<any> {
    return this.update(
      'product_variants',
      { inventory_quantity: quantity, updated_at: new Date() },
      { id: variantId }
    );
  }

  async createInventoryTransaction(data: any): Promise<any> {
    return this.insert('inventory_transactions', {
      warehouse_id: data.warehouse_id,
      variant_id: data.variant_id,
      transaction_type: data.transaction_type,
      quantity_change: data.quantity_change,
      previous_quantity: data.previous_quantity,
      new_quantity: data.new_quantity,
      reference_type: data.reference_type,
      reference_id: data.reference_id,
      notes: data.notes,
      created_by: data.created_by,
      created_at: new Date()
    });
  }

  // ANALYTICS OPERATIONS

  async createDailySalesRecord(date: Date, data: any): Promise<any> {
    return this.insert('analytics.daily_sales', {
      date: date.toISOString().split('T')[0],
      total_orders: data.total_orders || 0,
      total_revenue: data.total_revenue || 0,
      total_customers: data.total_customers || 0,
      average_order_value: data.average_order_value || 0,
      refunds_amount: data.refunds_amount || 0,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  async getDailySales(fromDate: Date, toDate: Date): Promise<any[]> {
    return this.getMany(
      'SELECT * FROM analytics.daily_sales WHERE date >= $1 AND date <= $2 ORDER BY date DESC',
      [
        fromDate.toISOString().split('T')[0],
        toDate.toISOString().split('T')[0]
      ]
    );
  }

  // ADMIN OPERATIONS

  async createAdminUser(data: any): Promise<any> {
    return this.insert('admin_users', {
      user_id: data.user_id,
      role: data.role || 'manager',
      permissions: JSON.stringify(data.permissions || []),
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  async getAdminUser(adminId: string): Promise<any> {
    return this.getOne(
      'SELECT * FROM admin_users WHERE id = $1',
      [adminId]
    );
  }

  async createAuditLog(data: any): Promise<any> {
    return this.insert('audit_logs', {
      admin_user_id: data.admin_user_id,
      action: data.action,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      changes: JSON.stringify(data.changes || {}),
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      created_at: new Date()
    });
  }

  /**
   * Close the connection pool
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

export default DatabaseService;
