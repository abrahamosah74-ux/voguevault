# VogueVault Payment System & Database Architecture

## 📋 Overview

This document provides comprehensive details on the VogueVault payment system with Paystack integration, complete PostgreSQL database schema, and admin dashboard architecture.

## 💰 Payment System Architecture

### Paystack Integration

The payment system is built around Paystack as the primary payment gateway with support for multiple payment channels:

- **Card Payments** - Visa, Mastercard, Verve
- **Bank Transfers** - Direct bank account transfers
- **USSD** - Mobile banking
- **QR Code** - Mobile wallet scanning
- **Mobile Money** - Airtel Money, MTN Money, etc.

### Payment Flow

```
1. User initiates checkout
   ↓
2. Order created with status 'pending'
   ↓
3. Payment record created in database
   ↓
4. Paystack transaction initialized
   ↓
5. User redirected to Paystack payment page
   ↓
6. Payment processing
   ↓
7. Paystack callback to webhook
   ↓
8. Payment verified and confirmed
   ↓
9. Order marked as 'paid' and 'confirmed'
   ↓
10. Confirmation emails sent
```

## 🗄️ Database Schema

### Core Tables

#### 1. **users** - Customer accounts
```sql
- id (UUID): Primary key
- email (VARCHAR): Unique email address
- password_hash (VARCHAR): Hashed password
- first_name, last_name, phone
- email_verified, phone_verified
- preferences (JSONB): User preferences
- is_admin, is_active
- two_factor_enabled, locked_until
- Indexes: email, phone, created_at, is_admin
```

#### 2. **payments** - Payment records (Paystack integration)
```sql
- id (UUID): Primary key
- order_id (UUID): Foreign key to orders
- payment_reference (VARCHAR): Unique reference
- paystack_transaction_id (VARCHAR): Paystack transaction ID
- amount (DECIMAL): Payment amount
- currency (CHAR): Currency code (default: NGN)
- payment_method (VARCHAR): Card, transfer, USSD, etc.
- status (VARCHAR): pending, captured, failed, refunded
- paystack_authorization_code: Saved card code
- paystack_customer_code: Paystack customer code
- card_last4, card_type, card_bank: Masked card data
- refunded_amount: Total refunded
- metadata (JSONB): Additional data
- raw_response (JSONB): Full Paystack response
- Indexes: order_id, status, payment_reference, created_at
```

#### 3. **payment_refunds** - Refund tracking
```sql
- id (UUID): Primary key
- payment_id (UUID): Foreign key to payments
- refund_reference (VARCHAR): Unique refund reference
- paystack_refund_id (VARCHAR): Paystack refund ID
- amount (DECIMAL): Refund amount
- reason (VARCHAR): Refund reason
- status (VARCHAR): pending, processed, failed
- processed_by (UUID): Admin user who processed
- Indexes: payment_id, status
```

#### 4. **payment_webhook_logs** - Webhook event history
```sql
- id (UUID): Primary key
- event_type (VARCHAR): Event name (e.g., 'charge.success')
- paystack_event_id (VARCHAR): Paystack event ID
- payment_id (UUID): Related payment
- payload (JSONB): Full webhook payload
- processed (BOOLEAN): Whether processed
- processing_error (TEXT): Error message if failed
- Indexes: event_type, processed, created_at
```

#### 5. **customer_payment_methods** - Saved cards
```sql
- id (UUID): Primary key
- customer_id (UUID): Customer reference
- paystack_authorization_code (VARCHAR): Card token
- paystack_customer_code (VARCHAR): Customer token
- card_last4, card_type, card_exp_month, card_exp_year, card_bank
- channel (VARCHAR): card, bank_transfer, ussd, etc.
- is_default (BOOLEAN): Default payment method
- is_active (BOOLEAN): Active/inactive
- last_used_at (TIMESTAMP): Last usage
- Indexes: customer_id, is_default
```

#### 6. **orders** - Customer orders
```sql
- id (UUID): Primary key
- order_number (VARCHAR): Human-readable order number
- user_id (UUID): Customer reference
- guest_email (VARCHAR): For guest checkouts
- status (VARCHAR): pending, confirmed, processing, shipped, delivered, cancelled
- payment_status (VARCHAR): pending, authorized, paid, refunded, failed
- subtotal, shipping_amount, tax_amount, discount_amount, total_amount (DECIMAL)
- currency (CHAR): NGN, USD, etc.
- shipping_method, shipping_tracking_number, shipping_carrier
- shipping_address, billing_address (JSONB): Full addresses
- customer_notes, internal_notes (TEXT)
- confirmed_at, paid_at, shipped_at, delivered_at (TIMESTAMP)
- Indexes: user_id, status, payment_status, created_at, order_number
```

#### 7. **order_items** - Line items in orders
```sql
- id (UUID): Primary key
- order_id (UUID): Related order
- product_id (UUID): Product reference
- variant_id (UUID): Product variant
- product_name, sku, image_url
- unit_price, quantity, total_price
- variant_attributes (JSONB): Size, color, etc.
- inventory_reserved, inventory_released (BOOLEAN)
- Indexes: order_id, product_id, variant_id
```

#### 8. **products** - Product catalog
```sql
- id (UUID): Primary key
- sku, name, slug (unique)
- description, short_description
- category_id, brand_id
- base_price, compare_at_price, cost_price
- status: draft, active, archived
- is_featured, is_new_arrival, is_bestseller
- tags, materials, care_instructions
- sustainability_score (0-100)
- seo_title, seo_description, seo_keywords
- weight_grams, dimensions
- Indexes: sku, slug, category_id, status, is_featured
```

#### 9. **product_variants** - Size/color/material options
```sql
- id (UUID): Primary key
- product_id (UUID): Parent product
- sku, barcode (unique)
- price (optional override)
- inventory_quantity, inventory_reserved, inventory_status
- attributes (JSONB): {size: 'M', color: 'Red'}
- image_urls (TEXT[])
- is_active, is_default
- Indexes: product_id, sku, inventory_status
```

#### 10. **categories** - Product categories
```sql
- id (UUID): Primary key
- name, slug (unique)
- parent_id (recursive)
- description, image_url, icon
- lft, rgt, depth: Nested set model for hierarchy
- is_active, sort_order
- Indexes: parent_id, slug, lft/rgt
```

#### 11. **payments_fees** - Fee tracking
```sql
- id (UUID): Primary key
- payment_id (UUID): Related payment
- paystack_fee (DECIMAL): Paystack's commission
- app_fee (DECIMAL): Our commission
- tax_amount (DECIMAL): Tax on fees
- total_fee (GENERATED): Calculated total
- net_amount (GENERATED): Amount after fees
- settlement_date: When settled
- Indexes: payment_id, settlement_date
```

### Analytics Tables

#### 12. **analytics.daily_sales**
```sql
- date (DATE): Primary key
- total_orders, total_revenue
- average_order_value, refunds_amount
- net_revenue (generated)
- revenue_by_method (JSONB)
- new_customers, returning_customers
```

#### 13. **analytics.product_performance**
```sql
- product_id, date (composite key)
- views, add_to_carts, purchases
- revenue, refunds
- conversion_rate (generated)
```

#### 14. **analytics.customer_lifetime_value**
```sql
- customer_id (PRIMARY KEY)
- first_order_date, last_order_date
- total_orders, total_revenue, average_order_value
- customer_segment: new, active, at_risk, churned
- predicted_clv (Predictive value)
```

### Admin Tables

#### 15. **admin_users**
```sql
- id (UUID): Primary key
- user_id (UUID): Reference to users
- role: super_admin, manager, content_manager, customer_support
- permissions (TEXT[]): Array of permissions
- last_activity_at
```

#### 16. **audit_logs**
```sql
- id (UUID): Primary key
- admin_user_id (UUID): Who made the change
- action: Create, Update, Delete, Refund, etc.
- entity_type, entity_id: What was changed
- changes (JSONB): Before/after values
- ip_address, user_agent
- created_at
- Indexes: admin_user_id, created_at, entity
```

## 🔐 Security Features

### Payment Security

1. **PCI DSS Compliance**
   - No storage of raw card data
   - All cards tokenized with Paystack
   - Only last 4 digits stored (masked)

2. **Webhook Signature Verification**
   ```typescript
   // HMAC-SHA512 verification
   hash = HMAC-SHA512(payload, webhook_secret)
   verified = hash === provided_signature
   ```

3. **SSL/TLS Encryption**
   - All payment endpoints over HTTPS
   - Secure communication with Paystack

4. **Rate Limiting**
   - Payment endpoints: 10 requests per minute per user
   - Webhook endpoints: IP-based rate limiting

5. **Audit Logging**
   - All payment operations logged
   - Who, what, when, where recorded
   - Changes tracked in audit_logs

### Admin Security

1. **Role-Based Access Control (RBAC)**
   ```typescript
   enum AdminPermission {
     // Dashboard
     VIEW_DASHBOARD = 'dashboard:view',
     
     // Orders
     VIEW_ORDERS = 'orders:view',
     EDIT_ORDERS = 'orders:edit',
     DELETE_ORDERS = 'orders:delete',
     
     // Payments
     VIEW_PAYMENTS = 'payments:view',
     PROCESS_REFUNDS = 'payments:refund',
     
     // Products
     MANAGE_PRODUCTS = 'products:manage',
     MANAGE_INVENTORY = 'inventory:manage',
     
     // Settings
     EDIT_SETTINGS = 'settings:edit',
     MANAGE_ADMINS = 'admins:manage'
   }
   ```

2. **Admin Roles**
   - **Super Admin**: All permissions
   - **Manager**: Most operations
   - **Content Manager**: Products only
   - **Customer Support**: Orders & customers only

3. **Two-Factor Authentication** (Optional)
   - TOTP-based 2FA for admins
   - Secure login verification

## 🚀 API Endpoints

### Payment Endpoints

```
POST   /api/v1/payments/initialize        - Start payment
GET    /api/v1/payments/verify/:reference - Verify payment
POST   /api/v1/payments/webhook           - Paystack webhook handler
POST   /api/v1/payments/:id/refund        - Request refund
GET    /api/v1/payments/:id               - Get payment details
GET    /api/v1/payments/orders/:orderId   - Get order payments
POST   /api/v1/payments/charge-saved-card - Charge saved card
GET    /api/v1/payments/customer/payment-methods - List saved cards
```

### Admin Endpoints

```
# Dashboard
GET    /api/v1/admin/dashboard/stats

# Orders
GET    /api/v1/admin/orders
GET    /api/v1/admin/orders/:id
PUT    /api/v1/admin/orders/:id/status
POST   /api/v1/admin/orders/:id/refund

# Products
GET    /api/v1/admin/products
POST   /api/v1/admin/products
PUT    /api/v1/admin/products/:id
DELETE /api/v1/admin/products/:id
PUT    /api/v1/admin/inventory/:variantId

# Payments
GET    /api/v1/admin/payments
POST   /api/v1/admin/payments/:id/refund

# Customers
GET    /api/v1/admin/customers
GET    /api/v1/admin/customers/:id

# Analytics
GET    /api/v1/admin/analytics/sales
GET    /api/v1/admin/analytics/products/:id
GET    /api/v1/admin/analytics/customers/:id

# Promotions
GET    /api/v1/admin/promotions
POST   /api/v1/admin/promotions
```

## 📧 Webhook Events

### Charge Events
- `charge.success` - Payment successful
- `charge.failed` - Payment declined
- `charge.refunded` - Charge refunded

### Transfer Events
- `transfer.success` - Settlement completed
- `transfer.failed` - Settlement failed

### Refund Events
- `refund.created` - Refund initiated
- `refund.processed` - Refund completed
- `refund.failed` - Refund failed

### Subscription Events
- `subscription.create` - Subscription created
- `subscription.disable` - Subscription cancelled

## 🔧 Configuration

### Environment Variables

```bash
# Paystack Keys
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxxxx

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=voguevault
DB_USER=postgres
DB_PASSWORD=password

# Server
PORT=3004
NODE_ENV=production
APP_URL=https://api.yourdomain.com
```

## 📊 Database Initialization

### 1. Create Database
```bash
createdb voguevault
```

### 2. Create Analytics Schema
```sql
CREATE SCHEMA analytics;
```

### 3. Run SQL Schema
```bash
psql voguevault < backend/database/schemas/postgres-complete.sql
```

### 4. Create Indexes
All indexes are created automatically with the schema.

## 🧪 Testing Paystack Integration

### Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3DS:     5078 5078 5078 5078
OTP:     123456
```

### Local Webhook Testing

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3004

# Update webhook URL in Paystack dashboard
# https://your-ngrok-url.ngrok.io/api/v1/payments/webhook
```

## 📈 Performance Considerations

1. **Database Indexing**
   - All frequently queried columns are indexed
   - Composite indexes on multi-column filters
   - Nested set indexes for category hierarchy

2. **Query Optimization**
   - Pagination on list endpoints (default: 20 items)
   - Lazy loading of related data
   - Analytics tables for reporting

3. **Caching**
   - Redis for session storage
   - Product catalog caching (5 minutes)
   - Payment method caching (1 hour)

4. **Connection Pooling**
   - PostgreSQL connection pool (20 connections)
   - MongoDB connection pooling
   - Redis connection pooling

## 🚨 Error Handling

### Common Payment Errors

```typescript
// Insufficient funds
{
  "code": "insufficient_balance",
  "message": "Customer does not have sufficient balance for this transaction"
}

// Card declined
{
  "code": "card_declined",
  "message": "Card was declined by issuer"
}

// Invalid CVV
{
  "code": "invalid_cvv",
  "message": "The CVV provided is invalid"
}

// Expired card
{
  "code": "card_expired",
  "message": "The card has expired"
}
```

## 📞 Support & Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL in Paystack dashboard
   - Verify webhook secret matches
   - Check IP whitelisting if applicable

2. **Payment verification failing**
   - Ensure payment reference is correct
   - Verify Paystack API keys
   - Check network connectivity

3. **Refund failures**
   - Only captured payments can be refunded
   - Check refund amount doesn't exceed available
   - Verify admin permissions

## 📚 Related Documentation

- [Paystack API Reference](https://paystack.com/docs/api/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
