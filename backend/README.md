# VogueVault Backend - Fashion E-Commerce Platform

A scalable, microservices-based backend for a modern fashion e-commerce platform supporting 100K+ products and 1M+ monthly visitors.

## 🏗️ Architecture Overview

### Microservices Structure

```
backend/
├── services/
│   ├── api-gateway/          # Express.js API Gateway
│   ├── user-service/         # User auth & profile management
│   ├── product-service/      # Products, categories, inventory
│   ├── order-service/        # Orders, payments, shipping
│   └── media-service/        # Image uploads, CDN management
├── database/
│   ├── schemas/
│   │   ├── postgres.sql      # PostgreSQL schemas
│   │   └── mongodb.ts        # MongoDB schemas
├── shared/
│   ├── types/                # TypeScript interfaces
│   └── utils/                # Shared utilities
├── config/                   # Configuration management
└── .env.example              # Environment variables template
```

### Technology Stack

#### Core
- **API Gateway**: Express.js + TypeScript
- **Runtime**: Node.js
- **Languages**: TypeScript, JavaScript

#### Databases
- **PostgreSQL**: Products, Orders, Inventory (relational data)
- **MongoDB**: Users, Sessions, Carts, Wishlists (document storage)
- **Redis**: Caching, Session management, Rate limiting

#### Infrastructure
- **Message Queue**: RabbitMQ/Kafka (async communication)
- **Search**: ElasticSearch (product search, recommendations)
- **Media**: Cloudinary/AWS S3 (image and video storage)
- **CDN**: Cloudflare/AWS CloudFront
- **Payment**: Stripe/PayPal

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- PostgreSQL (v12+)
- MongoDB (v5+)
- Redis (optional, for caching)

### Installation

1. **Clone and setup**
```bash
cd voguevault/backend
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Setup Databases**

PostgreSQL:
```bash
# Create database
createdb voguevault_db

# Run migrations
psql voguevault_db < database/schemas/postgres.sql
```

MongoDB:
```bash
# MongoDB is typically running as a service
# Import schemas using MongoDB client or Mongoose in application
```

### Running Services

#### Development Mode

**API Gateway** (Port 3001)
```bash
cd services/api-gateway
npm run dev
```

**User Service** (Port 3002)
```bash
cd services/user-service
npm run dev
```

**Product Service** (Port 3003)
```bash
cd services/product-service
npm run dev
```

**Order Service** (Port 3004)
```bash
cd services/order-service
npm run dev
```

**Media Service** (Port 3005)
```bash
cd services/media-service
npm run dev
```

#### Production Mode

Build all services:
```bash
npm run build
```

Run all services with pm2:
```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

## 📋 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### Users
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users/:userId` - Get user profile
- `PUT /api/v1/users/:userId` - Update user profile
- `GET /api/v1/users/:userId/addresses` - Get user addresses
- `POST /api/v1/users/:userId/addresses` - Add address
- `PUT /api/v1/users/:userId/addresses/:addressId` - Update address
- `DELETE /api/v1/users/:userId/addresses/:addressId` - Delete address
- `GET /api/v1/users/:userId/cart` - Get shopping cart
- `GET /api/v1/users/:userId/wishlist` - Get wishlist

### Products
- `GET /api/v1/products` - List all products (paginated, filterable)
- `GET /api/v1/products/:productId` - Get product details
- `POST /api/v1/products` - Create product (admin)
- `PUT /api/v1/products/:productId` - Update product (admin)
- `DELETE /api/v1/products/:productId` - Delete product (admin)
- `GET /api/v1/products/:productId/variants` - Get product variants
- `GET /api/v1/products/featured` - Get featured products
- `GET /api/v1/products/new-arrivals` - Get new arrivals
- `GET /api/v1/products/bestsellers` - Get bestselling products
- `GET /api/v1/search?q=query` - Search products

### Categories
- `GET /api/v1/categories` - List all categories
- `GET /api/v1/categories/:categoryId` - Get category details
- `POST /api/v1/categories` - Create category (admin)
- `PUT /api/v1/categories/:categoryId` - Update category (admin)
- `DELETE /api/v1/categories/:categoryId` - Delete category (admin)

### Orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders` - List orders (paginated)
- `GET /api/v1/orders/:orderId` - Get order details
- `GET /api/v1/orders/user/:userId` - Get user orders
- `PUT /api/v1/orders/:orderId` - Update order (admin)
- `POST /api/v1/orders/:orderId/cancel` - Cancel order
- `GET /api/v1/orders/:orderId/tracking` - Get shipping tracking
- `POST /api/v1/orders/:orderId/coupon` - Apply coupon code

### Payments
- `POST /api/v1/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/v1/payments/confirm` - Confirm payment
- `POST /api/v1/payments/webhook` - Handle payment webhooks

### Media
- `POST /api/v1/upload` - Upload single file
- `POST /api/v1/upload-multiple` - Upload multiple files
- `GET /api/v1/media/:mediaId` - Get media details
- `DELETE /api/v1/media/:mediaId` - Delete media
- `POST /api/v1/resize` - Resize image
- `POST /api/v1/optimize` - Optimize image

## 📊 Database Schema

### PostgreSQL Tables

#### Products
- `products` - Product information
- `product_variants` - Size, color, material variants
- `categories` - Product categories (nested set model)
- `brands` - Brand information
- `inventory_logs` - Inventory change tracking
- `warehouses` - Warehouse locations
- `coupons` - Discount codes

#### Orders
- `orders` - Order information
- `order_items` - Items in each order

### MongoDB Collections

- `users` - User accounts and profiles
- `carts` - Shopping carts
- `wishlists` - User wishlists
- `sessions` - Authentication sessions
- `reviews` - Product reviews
- `notifications` - User notifications
- `activity_logs` - User activity tracking

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting (configurable)
- Input validation
- Helmet.js security headers
- Environment variable protection
- SQL injection prevention
- CSRF protection ready

## 📈 Scalability Considerations

### Load Balancing
- Multiple service instances behind load balancer
- Stateless services for horizontal scaling
- Redis for session management across instances

### Caching
- Redis for product cache
- HTTP caching headers
- CDN for static assets

### Database Optimization
- Indexed queries
- Connection pooling
- Read replicas for PostgreSQL
- Sharding strategy for MongoDB

### Async Processing
- RabbitMQ/Kafka for async tasks
- Email notifications (queue-based)
- Inventory updates
- Order processing

## 🧪 Testing

```bash
# Run tests for all services
npm test

# Run tests for specific service
cd services/api-gateway
npm test

# Run with coverage
npm run test:coverage
```

## 📚 Documentation

### API Documentation
- OpenAPI/Swagger specs (add `/api/docs` endpoint)
- Postman collection in `docs/postman/`

### Development Guides
- See `docs/DEVELOPMENT.md` for setup details
- See `docs/DEPLOYMENT.md` for production deployment
- See `docs/DATABASE.md` for database migration guides

## 🔧 Configuration

All configuration is managed through environment variables. See `.env.example` for all available options.

### Important Settings
- `NODE_ENV`: Development or production mode
- `PORT`: Service port (3001-3005 for different services)
- `JWT_ACCESS_EXPIRY`: Token expiration (default 15m)
- `RATE_LIMIT_MAX`: Requests per window (default 100)

## 🚢 Deployment

### Docker
```bash
docker-compose up -d
```

### Docker Swarm / Kubernetes
- Add Dockerfile and K8s manifests to each service
- Use environment variables for configuration

### Cloud Platforms
- **AWS**: ECS, RDS, ElastiCache, S3
- **Google Cloud**: Cloud Run, Cloud SQL, Firestore
- **Azure**: App Service, Database for PostgreSQL, CosmosDB

## 📊 Monitoring & Logging

- Centralized logging with ELK Stack or CloudWatch
- Application performance monitoring (APM)
- Error tracking with Sentry
- Health check endpoints on all services
- Prometheus metrics for Kubernetes

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use consistent naming conventions
3. Add tests for new features
4. Update API documentation
5. Use commit message format: `feat/fix/docs: description`

## 📝 License

MIT License - See LICENSE file for details

## 🆘 Support

For issues and questions:
- GitHub Issues: [Project Issues](https://github.com/voguevault/backend/issues)
- Documentation: [Docs Site](https://docs.voguevault.com)
- Email: support@voguevault.com

---

**Last Updated**: December 2025
**Version**: 1.0.0
**Status**: ✅ Fully Functional Microservices Architecture
