-- ============================================
-- VOGUEVAULT COMPLETE POSTGRESQL SCHEMA
-- With Paystack Payment Integration
-- ============================================

-- 1. USERS & AUTHENTICATION
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  phone VARCHAR(20),
  phone_verified BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255),
  
  -- Personal info
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  date_of_birth DATE,
  gender VARCHAR(20),
  avatar_url VARCHAR(500),
  
  -- Preferences
  preferences JSONB DEFAULT '{
    "newsletter": true,
    "sms_notifications": false,
    "email_marketing": true,
    "currency": "NGN",
    "language": "en"
  }',
  
  -- Security
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(100),
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  
  -- Account status
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_is_admin ON users(is_admin);

-- 2. ADDRESS BOOK
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) DEFAULT 'shipping', -- shipping, billing, both
  label VARCHAR(50), -- Home, Office, etc.
  
  -- Address fields
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company VARCHAR(200),
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  country CHAR(2) NOT NULL,
  phone VARCHAR(20),
  
  -- Metadata
  is_default BOOLEAN DEFAULT FALSE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  validated BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_is_default ON addresses(is_default);

-- 3. BRANDS
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  country_of_origin CHAR(2),
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_is_active ON brands(is_active);

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  image_url VARCHAR(500),
  icon VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  
  -- Nested Set for hierarchical queries
  lft INTEGER,
  rgt INTEGER,
  depth INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_lft_rgt ON categories(lft, rgt);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  short_description VARCHAR(500),
  description TEXT,
  brand_id UUID REFERENCES brands(id),
  category_id UUID REFERENCES categories(id),
  
  -- Pricing
  base_price DECIMAL(12,2) NOT NULL,
  compare_at_price DECIMAL(12,2),
  cost_price DECIMAL(12,2),
  
  -- Inventory
  track_inventory BOOLEAN DEFAULT TRUE,
  inventory_policy VARCHAR(20) DEFAULT 'deny',
  allow_backorder BOOLEAN DEFAULT FALSE,
  
  -- Product attributes
  status VARCHAR(20) DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT TRUE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_gift_card BOOLEAN DEFAULT FALSE,
  is_virtual BOOLEAN DEFAULT FALSE,
  
  -- Physical properties
  weight_grams INTEGER,
  length_cm INTEGER,
  width_cm INTEGER,
  height_cm INTEGER,
  
  -- SEO
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords TEXT[],
  
  -- Metadata
  tags TEXT[],
  materials TEXT[],
  care_instructions TEXT,
  country_of_origin CHAR(2),
  sustainability_score INTEGER,
  
  -- Timestamps
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_is_featured ON products(is_featured);

-- 6. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100) UNIQUE NOT NULL,
  barcode VARCHAR(100),
  
  -- Pricing overrides
  price DECIMAL(12,2),
  compare_at_price DECIMAL(12,2),
  
  -- Inventory
  inventory_quantity INTEGER DEFAULT 0,
  inventory_reserved INTEGER DEFAULT 0,
  inventory_status VARCHAR(20) DEFAULT 'in_stock',
  
  -- Physical properties
  weight_grams INTEGER,
  length_cm INTEGER,
  width_cm INTEGER,
  height_cm INTEGER,
  
  -- Attributes
  attributes JSONB DEFAULT '{}', -- {size: 'M', color: 'Red', material: 'Cotton'}
  
  -- Media
  image_urls TEXT[],
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_variants_inventory_status ON product_variants(inventory_status);

-- 7. WAREHOUSES
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address JSONB NOT NULL,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_warehouses_code ON warehouses(code);

-- 8. WAREHOUSE INVENTORY
CREATE TABLE IF NOT EXISTS warehouse_inventory (
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
  reorder_point INTEGER DEFAULT 10,
  last_restocked_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (warehouse_id, variant_id)
);

CREATE INDEX idx_warehouse_inventory_variant_id ON warehouse_inventory(variant_id);

-- 9. INVENTORY TRANSACTIONS
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID REFERENCES warehouses(id),
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  
  -- Transaction details
  transaction_type VARCHAR(30) NOT NULL,
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  
  -- References
  reference_type VARCHAR(50),
  reference_id UUID,
  
  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inventory_transactions_variant_id ON inventory_transactions(variant_id);
CREATE INDEX idx_inventory_transactions_reference ON inventory_transactions(reference_type, reference_id);

-- 10. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  user_id UUID REFERENCES users(id),
  guest_email VARCHAR(255),
  
  -- Status
  status VARCHAR(30) DEFAULT 'pending',
  payment_status VARCHAR(30) DEFAULT 'pending',
  
  -- Pricing
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency CHAR(3) DEFAULT 'NGN',
  
  -- Shipping
  shipping_method VARCHAR(100),
  shipping_tracking_number VARCHAR(100),
  shipping_carrier VARCHAR(50),
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  
  -- Addresses (denormalized)
  billing_address JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  
  -- Customer info
  customer_notes TEXT,
  internal_notes TEXT,
  
  -- Timestamps
  confirmed_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- 11. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  
  -- Product info at time of order
  product_name VARCHAR(255) NOT NULL,
  variant_attributes JSONB,
  sku VARCHAR(100) NOT NULL,
  image_url VARCHAR(500),
  
  -- Pricing
  unit_price DECIMAL(12,2) NOT NULL,
  compare_at_price DECIMAL(12,2),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price DECIMAL(12,2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
  
  -- Inventory tracking
  inventory_reserved BOOLEAN DEFAULT FALSE,
  inventory_released BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- 12. PAYMENTS TABLE (PAYSTACK INTEGRATION)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_reference VARCHAR(100) UNIQUE NOT NULL,
  paystack_transaction_id VARCHAR(100),
  
  amount DECIMAL(12,2) NOT NULL,
  currency CHAR(3) DEFAULT 'NGN',
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  
  -- Paystack specific fields
  paystack_authorization_code VARCHAR(100),
  paystack_customer_code VARCHAR(100),
  paystack_channel VARCHAR(50),
  paystack_bank VARCHAR(100),
  paystack_ip_address INET,
  
  -- Card details (if applicable, encrypted)
  card_last4 VARCHAR(4),
  card_type VARCHAR(20),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  card_bank VARCHAR(100),
  
  -- Refund information
  refunded_amount DECIMAL(12,2) DEFAULT 0,
  refund_reason TEXT,
  
  -- Audit fields
  metadata JSONB DEFAULT '{}',
  raw_response JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_reference ON payments(payment_reference);

-- 13. PAYMENT WEBHOOK LOGS
CREATE TABLE IF NOT EXISTS payment_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  paystack_event_id VARCHAR(100) UNIQUE,
  payment_id UUID REFERENCES payments(id),
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_event_type ON payment_webhook_logs(event_type);
CREATE INDEX idx_webhook_processed ON payment_webhook_logs(processed);

-- 14. PAYMENT REFUNDS
CREATE TABLE IF NOT EXISTS payment_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id),
  refund_reference VARCHAR(100) UNIQUE NOT NULL,
  paystack_refund_id VARCHAR(100),
  amount DECIMAL(12,2) NOT NULL,
  reason VARCHAR(200),
  status VARCHAR(30) DEFAULT 'pending',
  notes TEXT,
  processed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_refunds_payment_id ON payment_refunds(payment_id);
CREATE INDEX idx_refunds_status ON payment_refunds(status);

-- 15. CUSTOMER SAVED PAYMENT METHODS
CREATE TABLE IF NOT EXISTS customer_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paystack_authorization_code VARCHAR(100) NOT NULL,
  paystack_customer_code VARCHAR(100),
  
  -- Masked card details
  card_last4 VARCHAR(4),
  card_type VARCHAR(20),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  card_bank VARCHAR(100),
  
  -- Paystack details
  channel VARCHAR(50),
  bank_code VARCHAR(10),
  bank_name VARCHAR(100),
  
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(customer_id, paystack_authorization_code)
);

CREATE INDEX idx_customer_payment_methods_customer_id ON customer_payment_methods(customer_id);

-- 16. PROMOTIONS
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(100) UNIQUE,
  description TEXT,
  
  -- Type
  promotion_type VARCHAR(30) NOT NULL,
  discount_type VARCHAR(20),
  discount_value DECIMAL(10,2),
  
  -- Rules
  minimum_order_amount DECIMAL(12,2),
  maximum_discount_amount DECIMAL(12,2),
  usage_limit INTEGER,
  usage_limit_per_customer INTEGER,
  
  -- Eligibility
  customer_eligibility VARCHAR(20) DEFAULT 'all',
  product_eligibility VARCHAR(20) DEFAULT 'all',
  
  -- Schedule
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Tracking
  total_usage_count INTEGER DEFAULT 0,
  total_discount_amount DECIMAL(12,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_is_active ON promotions(is_active);

-- 17. PROMOTION USAGE
CREATE TABLE IF NOT EXISTS promotion_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES promotions(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  customer_id UUID REFERENCES users(id),
  discount_amount DECIMAL(12,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_promotion_usage_promotion_id ON promotion_usage(promotion_id);
CREATE INDEX idx_promotion_usage_customer_id ON promotion_usage(customer_id);

-- 18. SHOPPING CART
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(100),
  guest_email VARCHAR(255),
  
  -- Shipping
  shipping_address_id UUID REFERENCES addresses(id),
  shipping_method VARCHAR(100),
  shipping_amount DECIMAL(12,2) DEFAULT 0,
  
  -- Coupons
  coupon_code VARCHAR(100),
  
  -- Metadata
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
  abandoned_at TIMESTAMP WITH TIME ZONE,
  converted_to_order BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_carts_expires_at ON carts(expires_at);

-- 19. CART ITEMS
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(cart_id, product_id, variant_id)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);

-- 20. WISHLISTS
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);

-- 21. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  user_id UUID NOT NULL REFERENCES users(id),
  order_item_id UUID REFERENCES order_items(id),
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  description TEXT,
  
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_is_approved ON reviews(is_approved);

-- 22. PAYMENT FEES
CREATE TABLE IF NOT EXISTS payment_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id),
  paystack_fee DECIMAL(10,2) NOT NULL,
  app_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_fee DECIMAL(10,2) GENERATED ALWAYS AS (paystack_fee + app_fee + tax_amount) STORED,
  net_amount DECIMAL(12,2) GENERATED ALWAYS AS (amount - total_fee) STORED,
  settlement_date DATE,
  settled_amount DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_fees_payment_id ON payment_fees(payment_id);
CREATE INDEX idx_payment_fees_settlement_date ON payment_fees(settlement_date);

-- ANALYTICS SCHEMA
-- 23. DAILY SALES
CREATE TABLE IF NOT EXISTS analytics.daily_sales (
  date DATE PRIMARY KEY,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  refunds_amount DECIMAL(12,2) DEFAULT 0,
  net_revenue DECIMAL(12,2) GENERATED ALWAYS AS (total_revenue - refunds_amount) STORED,
  revenue_by_method JSONB DEFAULT '{}',
  new_customers INTEGER DEFAULT 0,
  returning_customers INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 24. PRODUCT PERFORMANCE
CREATE TABLE IF NOT EXISTS analytics.product_performance (
  product_id UUID NOT NULL,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  add_to_carts INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  refunds INTEGER DEFAULT 0,
  PRIMARY KEY (product_id, date)
);

CREATE INDEX idx_product_performance_date ON analytics.product_performance(date);

-- 25. CUSTOMER LIFETIME VALUE
CREATE TABLE IF NOT EXISTS analytics.customer_lifetime_value (
  customer_id UUID PRIMARY KEY REFERENCES users(id),
  first_order_date DATE NOT NULL,
  last_order_date DATE,
  total_orders INTEGER DEFAULT 1,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  days_since_first_order INTEGER,
  days_since_last_order INTEGER,
  customer_segment VARCHAR(50),
  predicted_clv DECIMAL(12,2),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_clv_segment ON analytics.customer_lifetime_value(customer_segment);
CREATE INDEX idx_clv_last_order_date ON analytics.customer_lifetime_value(last_order_date);

-- ADMIN USERS & PERMISSIONS
-- 26. ADMIN USERS
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_admin_users_role ON admin_users(role);

-- 27. AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_admin_user_id ON audit_logs(admin_user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
