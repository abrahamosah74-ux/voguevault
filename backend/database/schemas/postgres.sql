-- PostgreSQL Schemas for VogueVault

-- Brands Table
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  country_of_origin CHAR(2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products Database
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  brand_id UUID REFERENCES brands(id),
  category_id UUID REFERENCES categories(id),
  base_price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, archived
  is_featured BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT true,
  is_bestseller BOOLEAN DEFAULT false,
  tags TEXT[],
  materials TEXT[],
  care_instructions TEXT,
  weight_grams INT,
  country_of_origin CHAR(2),
  sustainability_score INT CHECK (sustainability_score BETWEEN 0 AND 100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories with Nested Sets for performance
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  lft INT NOT NULL,
  rgt INT NOT NULL,
  depth INT NOT NULL,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Product Variants (Size, Color, Material)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(50) UNIQUE NOT NULL,
  size VARCHAR(20), -- 'S', 'M', 'L', '38', '40', etc.
  color_name VARCHAR(50),
  color_hex CHAR(7),
  material VARCHAR(100),
  barcode VARCHAR(100),
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  weight_adjustment_grams INT DEFAULT 0,
  inventory_count INT DEFAULT 0,
  inventory_reserved INT DEFAULT 0,
  inventory_status VARCHAR(20) DEFAULT 'in_stock', -- in_stock, low_stock, out_of_stock
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country CHAR(2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inventory Management
CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  warehouse_id UUID REFERENCES warehouses(id),
  change_type VARCHAR(20), -- restock, sale, return, damage, adjustment
  quantity_change INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  reference_id UUID, -- order_id, restock_id, etc.
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders Database
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled, returned
  total_amount DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  shipping_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  currency CHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50), -- stripe, paypal, apple_pay
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, authorized, paid, refunded, failed
  shipping_method VARCHAR(100),
  shipping_tracking_number VARCHAR(100),
  shipping_carrier VARCHAR(50),
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  billing_address JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  customer_notes TEXT,
  internal_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  variant_id UUID NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price_at_purchase DECIMAL(10,2) NOT NULL,
  discount_at_purchase DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20), -- percentage, fixed_amount
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(12,2),
  max_uses INT,
  times_used INT DEFAULT 0,
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_variant_id ON inventory_logs(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_warehouse_id ON inventory_logs(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_lft_rgt ON categories(lft, rgt);
