# 🚀 VogueVault Backend - Complete Setup Guide

## Overview

You now have a **production-ready microservices backend** for the VogueVault fashion e-commerce platform. This guide walks through setup and deployment.

## ✅ What's Included

### 5 Microservices
1. **API Gateway** (3001) - Central routing
2. **User Service** (3002) - Auth & profiles
3. **Product Service** (3003) - Products & inventory
4. **Order Service** (3004) - Orders & payments
5. **Media Service** (3005) - Image handling

### 2 Databases
- **PostgreSQL** - Products, orders, inventory
- **MongoDB** - Users, carts, sessions

### Supporting Services
- **Redis** - Caching & sessions
- **Cloudinary/S3** - Media storage

## 📋 Prerequisites

```bash
# Required
- Node.js 16+ (https://nodejs.org/)
- PostgreSQL 12+ (https://www.postgresql.org/)
- MongoDB 5+ (https://www.mongodb.com/)
- npm or yarn

# Optional (for Docker)
- Docker (https://www.docker.com/)
- Docker Compose
```

## 🔧 Installation Steps

### Step 1: Navigate to Backend Directory

```bash
cd voguevault/backend
```

### Step 2: Install Dependencies

```bash
# Option A: Install everything at once
npm run install-all

# Option B: Manual installation
npm install
cd services/api-gateway && npm install && cd ../..
cd services/user-service && npm install && cd ../..
cd services/product-service && npm install && cd ../..
cd services/order-service && npm install && cd ../..
cd services/media-service && npm install && cd ../..
```

### Step 3: Setup Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit with your credentials
# - Database passwords
# - JWT secrets
# - API keys (Stripe, SendGrid, etc.)
```

### Step 4: Setup Databases

#### PostgreSQL Setup

```bash
# Create database
createdb voguevault_db

# Create user
createuser voguevault -P
# (Enter password: your_password_here)

# Run schema
psql voguevault_db < database/schemas/postgres.sql

# Verify
psql -U voguevault -d voguevault_db -c "SELECT * FROM products LIMIT 1;"
```

#### MongoDB Setup

```bash
# Start MongoDB (if not running as service)
mongod --version  # Check if installed

# MongoDB will create database automatically on first connection
```

### Step 5: Verify Installation

```bash
# Check Node version
node --version  # Should be v16 or higher

# Check npm packages installed
npm list --depth=0

# Check database connections in .env are correct
cat .env | grep -E "POSTGRES|MONGODB"
```

## 🎬 Running the Services

### Development Mode (Recommended)

#### Option A: All services at once
```bash
npm run dev
```

#### Option B: Individual services (in separate terminals)

```bash
# Terminal 1 - API Gateway
npm run start-api-gateway

# Terminal 2 - User Service
npm run start-user-service

# Terminal 3 - Product Service
npm run start-product-service

# Terminal 4 - Order Service
npm run start-order-service

# Terminal 5 - Media Service
npm run start-media-service
```

### Production Mode

```bash
# Build all services
npm run build

# Run with pm2 (install first: npm install -g pm2)
pm2 start ecosystem.config.js

# Check status
pm2 status
```

### Docker Mode

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ✔️ Verify Everything is Running

### Health Checks

```bash
# Test each service
curl http://localhost:3001/health  # API Gateway
curl http://localhost:3002/health  # User Service
curl http://localhost:3003/health  # Product Service
curl http://localhost:3004/health  # Order Service
curl http://localhost:3005/health  # Media Service
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-24T10:00:00.000Z"
}
```

### Test API Calls

```bash
# Get all products
curl http://localhost:3001/api/v1/products

# Get categories
curl http://localhost:3001/api/v1/categories/list

# Register user
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

## 🔐 Security Configuration

### Important: Change Default Secrets

Edit `.env` and change these values:

```bash
# Generate new secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update in .env
JWT_ACCESS_SECRET=<generated_secret>
JWT_REFRESH_SECRET=<generated_secret>

# Change database passwords
POSTGRES_PASSWORD=<strong_password>
MONGODB_PASSWORD=<strong_password>
```

## 📊 Database Management

### PostgreSQL

```bash
# Connect to database
psql -U voguevault -d voguevault_db

# List tables
\dt

# View table structure
\d products

# Run queries
SELECT COUNT(*) FROM products;

# Exit
\q
```

### MongoDB

```bash
# Connect
mongosh mongodb://voguevault:password@localhost:27017/voguevault_users

# List collections
show collections

# View documents
db.users.find().limit(5)

# Exit
exit
```

## 🚢 Deployment

### AWS EC2

```bash
# 1. SSH into EC2 instance
ssh -i key.pem ubuntu@your-instance-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# 4. Clone repository
git clone your-repo-url
cd voguevault/backend

# 5. Setup and run with PM2
npm install -g pm2
npm run install-all
npm run build
pm2 start ecosystem.config.js
```

### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create voguevault-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0 -a voguevault-api

# Set environment variables
heroku config:set JWT_ACCESS_SECRET=your_secret -a voguevault-api

# Deploy
git push heroku main
```

### Docker Hub

```bash
# Build and push to Docker Hub
docker build -t your-username/voguevault-api-gateway services/api-gateway
docker push your-username/voguevault-api-gateway

# Pull and run
docker pull your-username/voguevault-api-gateway
docker run -p 3001:3001 your-username/voguevault-api-gateway
```

## 📝 Common Commands

```bash
# Build all services
npm run build

# Run all services (development)
npm run dev

# Lint code
npm run lint

# Stop all services (Ctrl+C)

# View logs
pm2 logs

# Restart services
pm2 restart all

# Database backup (PostgreSQL)
pg_dump voguevault_db > backup.sql

# Database restore
psql voguevault_db < backup.sql
```

## 🐛 Troubleshooting

### Services won't start

```bash
# Check if ports are already in use
lsof -i :3001  # Check port 3001

# Kill process on port
kill -9 <PID>

# Or change PORT in .env
PORT=4001
```

### Database connection errors

```bash
# Test PostgreSQL connection
psql -U voguevault -d voguevault_db -c "SELECT 1"

# Test MongoDB connection
mongosh mongodb://localhost:27017/voguevault_users

# Verify connection strings in .env
```

### TypeScript compilation errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild TypeScript
npm run build
```

### Port conflicts

```bash
# Change ports in .env
API_GATEWAY_PORT=4001
USER_SERVICE_PORT=4002
PRODUCT_SERVICE_PORT=4003
ORDER_SERVICE_PORT=4004
MEDIA_SERVICE_PORT=4005
```

## 📖 Useful Resources

- **Backend Docs**: [backend/README.md](./backend/README.md)
- **API Docs**: See `backend/services/api-gateway/routes/` for endpoints
- **Database Schema**: `backend/database/schemas/`
- **Configuration**: `backend/.env.example`

## 🎯 Next Steps

1. ✅ Run the backend
2. ✅ Test all services are running
3. Create admin user in database
4. Setup payment gateway (Stripe/PayPal)
5. Configure email service (SendGrid/SMTP)
6. Connect frontend to backend
7. Setup monitoring & logging
8. Deploy to production

## 💡 Tips

- Use `pm2 logs` to debug service issues
- Check logs directory for service-specific logs
- Use Postman to test API endpoints
- Keep `.env` file secure (don't commit to git)
- Use different databases for dev/prod
- Enable query logging during development

## 🆘 Getting Help

If you encounter issues:

1. Check service logs: `pm2 logs`
2. Verify database connections
3. Check ports aren't in use
4. Review `.env` configuration
5. Rebuild with `npm run build`
6. Clear cache: `rm -rf node_modules && npm install`

## ✨ Summary

Your VogueVault backend is now fully set up with:

✅ 5 microservices
✅ PostgreSQL & MongoDB
✅ JWT authentication
✅ API Gateway routing
✅ Type-safe TypeScript
✅ Production-ready code
✅ Docker support
✅ Complete documentation

**Status**: 🟢 Ready for Development/Production

---

**For detailed API documentation**, see [backend/README.md](./backend/README.md)

Happy coding! 🚀
