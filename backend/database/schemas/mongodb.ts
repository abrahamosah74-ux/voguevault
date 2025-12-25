// MongoDB Schemas for VogueVault
// These are Mongoose schema definitions

import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
  },
  email_verified: {
    type: Boolean,
    default: false,
  },
  password_hash: {
    type: String,
    required: true,
  },
  first_name: String,
  last_name: String,
  phone: String,
  date_of_birth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
  },

  // Profile
  avatar_url: String,
  bio: String,
  style_preferences: [String], // ['minimalist', 'bohemian', 'streetwear', etc.]
  size_profile: {
    tops: String,
    bottoms: String,
    dresses: String,
    shoes: Number,
    bra: String,
  },

  // Address Book
  addresses: [
    {
      type: {
        type: String,
        enum: ['shipping', 'billing', 'both'],
      },
      first_name: String,
      last_name: String,
      company: String,
      address_line1: String,
      address_line2: String,
      city: String,
      state: String,
      postal_code: String,
      country: String,
      phone: String,
      is_default: Boolean,
    },
  ],

  // Payment Methods
  payment_methods: [
    {
      stripe_payment_method_id: String,
      card_brand: String,
      card_last4: String,
      card_exp_month: Number,
      card_exp_year: Number,
      is_default: Boolean,
    },
  ],

  // Loyalty
  loyalty_points: {
    type: Number,
    default: 0,
  },
  loyalty_tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze',
  },

  // Preferences
  preferences: {
    newsletter: {
      type: Boolean,
      default: true,
    },
    sms_notifications: {
      type: Boolean,
      default: false,
    },
    email_marketing: {
      type: Boolean,
      default: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    language: {
      type: String,
      default: 'en',
    },
  },

  // Statistics
  stats: {
    total_orders: {
      type: Number,
      default: 0,
    },
    total_spent: {
      type: Number,
      default: 0,
    },
    last_order_date: Date,
    average_order_value: Number,
  },

  // Timestamps
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  last_login_at: Date,
});

// Shopping Cart Schema
const cartSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  session_id: String, // For guest carts
  items: [
    {
      product_id: mongoose.Schema.Types.ObjectId,
      variant_id: mongoose.Schema.Types.ObjectId,
      quantity: {
        type: Number,
        min: 1,
        required: true,
      },
      added_at: {
        type: Date,
        default: Date.now,
      },
      price_at_add: Number,
      metadata: mongoose.Schema.Types.Mixed,
    },
  ],
  coupon_codes: [String],
  shipping_method: String,
  shipping_address: mongoose.Schema.Types.Mixed,
  billing_address: mongoose.Schema.Types.Mixed,
  expires_at: {
    type: Date,
    default: () => Date.now() + 30 * 24 * 60 * 60 * 1000,
  }, // 30 days
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Wishlist Schema
const wishlistSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  items: [
    {
      product_id: mongoose.Schema.Types.ObjectId,
      variant_id: mongoose.Schema.Types.ObjectId,
      added_at: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Session Schema (for auth)
const sessionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  refresh_token: String,
  ip_address: String,
  user_agent: String,
  expires_at: {
    type: Date,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  title: String,
  comment: String,
  images: [String],
  helpful_count: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  type: {
    type: String,
    enum: [
      'order_confirmation',
      'order_shipped',
      'order_delivered',
      'product_review_request',
      'new_arrival',
      'price_drop',
      'back_in_stock',
      'promotional',
    ],
    required: true,
  },
  subject: String,
  message: String,
  data: mongoose.Schema.Types.Mixed,
  is_read: {
    type: Boolean,
    default: false,
  },
  channels: {
    email: {
      type: Boolean,
      default: true,
    },
    sms: {
      type: Boolean,
      default: false,
    },
    web: {
      type: Boolean,
      default: true,
    },
  },
  read_at: Date,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Activity Log Schema
const activityLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  action: String,
  resource_type: String,
  resource_id: String,
  changes: mongoose.Schema.Types.Mixed,
  ip_address: String,
  user_agent: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Export Models
export const User = mongoose.model('User', userSchema);
export const Cart = mongoose.model('Cart', cartSchema);
export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export const Session = mongoose.model('Session', sessionSchema);
export const Review = mongoose.model('Review', reviewSchema);
export const Notification = mongoose.model('Notification', notificationSchema);
export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
