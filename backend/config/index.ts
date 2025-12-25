// Environment configuration for VogueVault Backend

export const config = {
  // Server
  server: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost',
  },

  // Database
  database: {
    // PostgreSQL
    postgresql: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      username: process.env.POSTGRES_USER || 'voguevault',
      password: process.env.POSTGRES_PASSWORD || 'password',
      database: process.env.POSTGRES_DB || 'voguevault_db',
      ssl: process.env.POSTGRES_SSL === 'true',
      logging: process.env.DATABASE_LOGGING === 'true',
    },

    // MongoDB
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/voguevault_users',
      options: {
        retryWrites: true,
        w: 'majority',
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      },
    },
  },

  // JWT & Auth
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // Email Service
  email: {
    provider: process.env.EMAIL_PROVIDER || 'sendgrid', // sendgrid, smtp, aws-ses
    from: process.env.EMAIL_FROM || 'noreply@voguevault.com',
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
    },
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      username: process.env.SMTP_USERNAME,
      password: process.env.SMTP_PASSWORD,
      secure: process.env.SMTP_SECURE === 'true',
    },
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  },

  // AWS S3 / Cloudinary
  storage: {
    type: process.env.STORAGE_TYPE || 'cloudinary', // cloudinary, s3
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    s3: {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucket: process.env.AWS_S3_BUCKET,
    },
  },

  // Payment Gateway
  payment: {
    provider: process.env.PAYMENT_PROVIDER || 'stripe', // stripe, paypal
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      mode: process.env.PAYPAL_MODE || 'sandbox',
    },
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    directory: process.env.LOG_DIR || './logs',
  },

  // CORS
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  },

  // Services
  services: {
    userService: {
      url: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    },
    productService: {
      url: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003',
    },
    orderService: {
      url: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
    },
    mediaService: {
      url: process.env.MEDIA_SERVICE_URL || 'http://localhost:3005',
    },
  },

  // Feature Flags
  features: {
    enableAR: process.env.FEATURE_AR === 'true',
    enableAI: process.env.FEATURE_AI === 'true',
    enableNotifications: process.env.FEATURE_NOTIFICATIONS === 'true',
  },
};

export default config;
