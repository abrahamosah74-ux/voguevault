// User Types
export interface User {
  id: string;
  email: string;
  email_verified: boolean;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  avatar_url?: string;
  bio?: string;
  style_preferences?: string[];
  size_profile?: SizeProfile;
  addresses?: Address[];
  payment_methods?: PaymentMethod[];
  loyalty_points: number;
  loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  preferences: UserPreferences;
  stats: UserStats;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}

export interface SizeProfile {
  tops?: string;
  bottoms?: string;
  dresses?: string;
  shoes?: number;
  bra?: string;
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing' | 'both';
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
}

export interface PaymentMethod {
  id: string;
  stripe_payment_method_id: string;
  card_brand: string;
  card_last4: string;
  card_exp_month: number;
  card_exp_year: number;
  is_default: boolean;
}

export interface UserPreferences {
  newsletter: boolean;
  sms_notifications: boolean;
  email_marketing: boolean;
  currency: string;
  language: string;
}

export interface UserStats {
  total_orders: number;
  total_spent: number;
  last_order_date?: Date;
  average_order_value?: number;
}

// Product Types
export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  brand_id?: string;
  category_id?: string;
  base_price: number;
  compare_at_price?: number;
  cost_price?: number;
  status: 'draft' | 'active' | 'archived';
  is_featured: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  tags?: string[];
  materials?: string[];
  care_instructions?: string;
  weight_grams?: number;
  country_of_origin?: string;
  sustainability_score?: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  size?: string;
  color_name?: string;
  color_hex?: string;
  material?: string;
  barcode?: string;
  price_adjustment?: number;
  weight_adjustment_grams?: number;
  inventory_count: number;
  inventory_reserved: number;
  inventory_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  is_active: boolean;
  created_at: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  lft: number;
  rgt: number;
  depth: number;
  image_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: Date;
}

// Order Types
export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  email: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  total_amount: number;
  subtotal: number;
  tax_amount?: number;
  shipping_amount?: number;
  discount_amount?: number;
  currency: string;
  payment_method?: string;
  payment_status: 'pending' | 'authorized' | 'paid' | 'refunded' | 'failed';
  shipping_method?: string;
  shipping_tracking_number?: string;
  shipping_carrier?: string;
  estimated_delivery_date?: Date;
  actual_delivery_date?: Date;
  billing_address: Address;
  shipping_address: Address;
  customer_notes?: string;
  internal_notes?: string;
  items: OrderItem[];
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  price_at_purchase: number;
  discount_at_purchase?: number;
}

// Cart Types
export interface CartItem {
  product_id: string;
  variant_id: string;
  quantity: number;
  added_at: Date;
  price_at_add: number;
  metadata?: Record<string, any>;
}

export interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  items: CartItem[];
  coupon_codes?: string[];
  shipping_method?: string;
  shipping_address?: Address;
  billing_address?: Address;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

// Wishlist Types
export interface Wishlist {
  id: string;
  user_id: string;
  items: WishlistItem[];
  created_at: Date;
  updated_at: Date;
}

export interface WishlistItem {
  product_id: string;
  variant_id?: string;
  added_at: Date;
}

// Inventory Types
export interface InventoryLog {
  id: string;
  variant_id: string;
  warehouse_id: string;
  change_type: 'restock' | 'sale' | 'return' | 'damage' | 'adjustment';
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  reference_id?: string;
  notes?: string;
  created_by: string;
  created_at: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Auth Types
export interface AuthToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface JwtPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}
