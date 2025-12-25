# Complete Deployment Guide: VogueVault Frontend + Backend

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Frontend Deployment](#frontend-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Testing & Verification](#testing--verification)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (React + Three.js + WebXR)         │  │
│  │  - Product Pages (3D Viewer)                         │  │
│  │  - Material Customizer                              │  │
│  │  - Aurora AI Interface                              │  │
│  │  - AR Try-On                                        │  │
│  │  - Admin Dashboard                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                   Load Balancer (CDN)                        │
│            Cloudflare / CloudFront / Akamai                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Node.js/Express)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes                                          │  │
│  │  - POST /api/admin/products/:id/3d-models           │  │
│  │  - GET /api/products/:id/3d-models                  │  │
│  │  - POST /api/admin/materials                        │  │
│  │  - POST /api/aurora/chat                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
        ↓                   ↓                   ↓
    ┌────────┐          ┌────────┐        ┌──────────┐
    │  Auth  │          │Database│        │ Storage  │
    │ Service│          │(PostgreSQL)     │ (S3/CDN) │
    └────────┘          └────────┘        └──────────┘
```

---

## Prerequisites

### Required Software
- Node.js 18+ (LTS recommended)
- npm or yarn package manager
- Git for version control
- PostgreSQL 13+ (if self-hosted)
- Docker (optional, for containerization)

### Cloud Accounts (choose one per service)

**Frontend Hosting:**
- ✅ Vercel (recommended for Next.js)
- ✅ Netlify
- ✅ AWS S3 + CloudFront
- ✅ Azure Static Web Apps
- ✅ Self-hosted (VPS/Docker)

**Backend Hosting:**
- ✅ Heroku (easiest for beginners)
- ✅ Railway
- ✅ AWS EC2 + RDS
- ✅ DigitalOcean
- ✅ Render
- ✅ Azure App Service
- ✅ Self-hosted VPS

**Database:**
- ✅ AWS RDS PostgreSQL (managed)
- ✅ DigitalOcean Managed Database
- ✅ Azure Database for PostgreSQL
- ✅ Neon (PostgreSQL serverless)
- ✅ Supabase
- ✅ Self-hosted PostgreSQL

**Cloud Storage (3D Models):**
- ✅ AWS S3 (recommended)
- ✅ Cloudinary
- ✅ Azure Blob Storage
- ✅ Google Cloud Storage

---

## Frontend Deployment

### Option 1: Vercel (Recommended for Next.js)

**Step 1: Prepare Repository**
```bash
# Navigate to project
cd voguevault

# Ensure everything is committed
git status
git add .
git commit -m "Prepare for deployment"
git push origin main
```

**Step 2: Connect to Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (first time)
vercel

# Follow prompts:
# - Link existing project? No
# - Project name: voguevault
# - Framework: Next.js
# - Build command: npm run build
# - Output directory: .next
```

**Step 3: Configure Environment Variables**

In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add for **Preview & Production**:

```
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_3D_MODELS_URL=https://cdn.yourdomain.com/models
NEXT_PUBLIC_AURORA_AI_ENABLED=true
NEXT_PUBLIC_AR_ENABLED=true
```

3. Add for **Production Only**:
```
NODE_ENV=production
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

**Step 4: Deploy**
```bash
# Deploy to production
vercel --prod

# Or push to main branch (auto-deploys)
git push origin main
```

**Step 5: Custom Domain**
1. Dashboard → Settings → Domains
2. Add your domain: `app.voguevault.com`
3. Add DNS records (Vercel provides them)
4. Verify ownership

### Option 2: Netlify

**Step 1: Connect Repository**
1. Login to Netlify
2. Click "New site from Git"
3. Choose GitHub/GitLab/Bitbucket
4. Select voguevault repository

**Step 2: Configure Build**
```
Build command: npm run build
Publish directory: out  (if using export)
```

For Next.js with SSR, use Vercel instead.

**Step 3: Add Environment Variables**
Netlify UI → Site settings → Build & deploy → Environment
```
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_3D_MODELS_URL=https://cdn.yourdomain.com/models
```

**Step 4: Deploy**
```bash
netlify deploy --prod
```

### Option 3: Self-Hosted (VPS)

**Step 1: Prepare Server**
```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2
```

**Step 2: Deploy Application**
```bash
# Clone repository
git clone https://github.com/yourusername/voguevault.git
cd voguevault

# Install dependencies
npm install

# Build Next.js
npm run build

# Start with PM2
pm2 start "npm run start" --name "voguevault-frontend"

# Save PM2 config
pm2 save
pm2 startup
```

**Step 3: Setup Nginx Reverse Proxy**
```bash
# Install Nginx
apt install -y nginx

# Create config file
nano /etc/nginx/sites-available/voguevault.conf
```

```nginx
server {
    listen 80;
    server_name app.voguevault.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/voguevault.conf /etc/nginx/sites-enabled/

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx

# Setup SSL with Let's Encrypt
apt install -y certbot python3-certbot-nginx
certbot --nginx -d app.voguevault.com
```

---

## Backend Deployment

### Option 1: Heroku (Easiest)

**Step 1: Install Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
choco install heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

**Step 2: Prepare Repository**
```bash
# Create Procfile in backend root
echo "web: node src/index.js" > backend/Procfile

# Create .env.example (without secrets)
cat > backend/.env.example << 'EOF'
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://user:pass@host/dbname
JWT_SECRET=your-secret-key
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=voguevault-models
AWS_REGION=us-east-1
CORS_ORIGIN=https://app.voguevault.com
EOF
```

**Step 3: Create Heroku App**
```bash
cd backend

# Login
heroku login

# Create app
heroku create voguevault-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-key-min-32-chars
heroku config:set AWS_ACCESS_KEY_ID=your-aws-key
heroku config:set AWS_SECRET_ACCESS_KEY=your-aws-secret
heroku config:set AWS_S3_BUCKET=voguevault-models
heroku config:set CORS_ORIGIN=https://app.voguevault.com

# Add PostgreSQL add-on
heroku addons:create heroku-postgresql:standard-0
```

**Step 4: Deploy**
```bash
# Deploy to Heroku
git push heroku main

# View logs
heroku logs --tail

# Run migrations
heroku run "node scripts/migrate.js"
```

**Step 5: Verify**
```bash
# Test API
curl https://voguevault-api.herokuapp.com/api/health
```

### Option 2: Railway

**Step 1: Connect Project**
1. Login to Railway
2. Click "New Project"
3. Import from GitHub
4. Select voguevault repository

**Step 2: Add Services**
- Backend service (Node.js)
- PostgreSQL database
- Redis (optional cache)

**Step 3: Configure**
```bash
# In Railway dashboard for backend service:

# Build command:
npm install && npm run build

# Start command:
node src/index.js

# Environment variables (same as above)
```

**Step 4: Deploy**
Railway auto-deploys on git push

### Option 3: AWS (EC2 + RDS)

**Step 1: Create EC2 Instance**
```bash
# In AWS Console:
# 1. Launch EC2 instance
# 2. Choose Ubuntu 22.04 LTS
# 3. Instance type: t3.medium (or larger)
# 4. Configure security groups (allow 80, 443, 5432)

# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git
```

**Step 2: Create RDS Database**
```bash
# In AWS Console:
# 1. RDS → Create database
# 2. PostgreSQL 13+
# 3. db.t3.micro (free tier eligible)
# 4. Multi-AZ: No (for development)
# 5. Storage: 20GB gp2
# 6. Database name: voguevault_db
# 7. Master username: dbadmin
# 8. Auto-generated password (save it!)

# Note RDS endpoint: voguevault-db-instance.xxxxxx.us-east-1.rds.amazonaws.com
```

**Step 3: Deploy Backend**
```bash
# Clone repo
git clone https://github.com/yourusername/voguevault.git
cd voguevault/backend

# Create .env
cat > .env << 'EOF'
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://dbadmin:PASSWORD@voguevault-db-instance.xxxxxx.us-east-1.rds.amazonaws.com:5432/voguevault_db
JWT_SECRET=your-secret-key
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=voguevault-models
AWS_REGION=us-east-1
CORS_ORIGIN=https://app.voguevault.com
EOF

# Install dependencies
npm install

# Build
npm run build

# Run with PM2
npm install -g pm2
pm2 start "npm run start" --name "voguevault-api"
pm2 startup
pm2 save
```

**Step 4: Setup Nginx & SSL**
```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/api.voguevault.conf
```

```nginx
server {
    listen 80;
    server_name api.voguevault.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable and restart
sudo ln -s /etc/nginx/sites-available/api.voguevault.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.voguevault.com
```

---

## Database Setup

### Step 1: Create Database

**If using managed service (AWS RDS, DigitalOcean, Neon):**
```bash
# You already have DATABASE_URL from provider
# Format: postgresql://user:pass@host:5432/dbname
```

**If self-hosted:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE voguevault_db;
CREATE USER voguevault_user WITH PASSWORD 'your-secure-password';
ALTER ROLE voguevault_user SET client_encoding TO 'utf8';
ALTER ROLE voguevault_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE voguevault_user SET default_transaction_deferrable TO on;
ALTER ROLE voguevault_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE voguevault_db TO voguevault_user;
\q
```

### Step 2: Run Migrations

```bash
# From backend directory
cd backend

# Install psql client if needed
npm install pg-cli

# Run migrations
PGPASSWORD='password' psql -U voguevault_user -d voguevault_db -h localhost < ../database/migrations/001_initial_schema.sql
PGPASSWORD='password' psql -U voguevault_user -d voguevault_db -h localhost < ../database/migrations/002_auth_system.sql
PGPASSWORD='password' psql -U voguevault_user -d voguevault_db -h localhost < ../database/migrations/003_add_3d_and_aurora_tables.sql
```

Or create a migration script:

```bash
# Create migration runner
cat > backend/scripts/migrate.js << 'EOF'
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();

  const migrationsDir = path.join(__dirname, '../database/migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (file.endsWith('.sql')) {
      console.log(`Running ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query(sql);
      console.log(`✓ ${file} completed`);
    }
  }

  await client.end();
  console.log('All migrations completed!');
}

runMigrations().catch(console.error);
EOF

# Run migrations
node scripts/migrate.js
```

### Step 3: Seed Initial Data

```sql
-- Seed material library
INSERT INTO material_library (id, name, material_type, base_color_hex, roughness, metallic, price_per_sq_m, sustainability_score)
VALUES
  ('mat-001', 'Premium Silk', 'fabric', '#E8D5C4', 0.3, 0.0, 45.00, 60),
  ('mat-002', 'Genuine Leather', 'leather', '#3E2723', 0.4, 0.1, 85.00, 40),
  ('mat-003', 'Organic Cotton', 'fabric', '#F5F5F5', 0.7, 0.0, 25.00, 95),
  ('mat-004', 'Merino Wool', 'fabric', '#8B7355', 0.6, 0.0, 55.00, 85),
  ('mat-005', 'Linen Blend', 'fabric', '#D4A574', 0.65, 0.0, 30.00, 90);
```

---

## Environment Configuration

### Frontend (.env.local)

```bash
# Create in frontend root
cat > .env.local << 'EOF'
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.voguevault.com
NEXT_PUBLIC_API_TIMEOUT=30000

# 3D & AR
NEXT_PUBLIC_3D_MODELS_URL=https://cdn.voguevault.com/models
NEXT_PUBLIC_DRACO_DECODER_PATH=/wasm/draco_decoder.wasm
NEXT_PUBLIC_AR_ENABLED=true
NEXT_PUBLIC_AR_PERSISTENCE=true

# Aurora AI
NEXT_PUBLIC_AURORA_AI_ENABLED=true
NEXT_PUBLIC_AURORA_AI_MODEL=gpt-4

# Analytics & Monitoring
NEXT_PUBLIC_GA_ID=UA-XXXXXXXXX-X
NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/project-id

# Feature Flags
NEXT_PUBLIC_BETA_FEATURES=false
NEXT_PUBLIC_DEBUG_MODE=false
EOF
```

### Backend (.env)

```bash
cat > backend/.env << 'EOF'
# Environment
NODE_ENV=production
PORT=8080

# Database
DATABASE_URL=postgresql://user:password@host:5432/voguevault_db
DATABASE_SSL=true
DATABASE_POOL_SIZE=20

# Authentication
JWT_SECRET=your-min-32-character-secret-key-here
JWT_EXPIRY=7d
REFRESH_TOKEN_SECRET=another-secret-key-min-32-chars

# AWS S3 (Cloud Storage)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=voguevault-3d-models
AWS_S3_REGION=us-east-1
AWS_CLOUDFRONT_DOMAIN=d123456.cloudfront.net

# Alternatively: Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
CORS_ORIGIN=https://app.voguevault.com,https://admin.voguevault.com
CORS_CREDENTIALS=true

# Email Service (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@voguevault.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=VogueVault <noreply@voguevault.com>

# External APIs
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXX
OPENAI_API_KEY=sk-XXXXXXXXXXXX

# Monitoring
SENTRY_DSN=https://your-key@sentry.io/project-id
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
EOF
```

### Production Checklist

- [ ] All secrets in environment variables (not in code)
- [ ] Different secrets for staging vs production
- [ ] Database SSL enabled
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] HTTPS/SSL certificates valid
- [ ] Backup strategy in place
- [ ] Monitoring & alerting setup

---

## Testing & Verification

### Step 1: Health Checks

```bash
# Frontend
curl https://app.voguevault.com/health

# Backend
curl https://api.voguevault.com/api/health

# Database
curl https://api.voguevault.com/api/db-check
```

### Step 2: API Testing

```bash
# Test 3D models endpoint
curl https://api.voguevault.com/api/products/prod-001/3d-models

# Test materials
curl https://api.voguevault.com/api/materials?limit=10

# Test authentication
curl -X POST https://api.voguevault.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Step 3: Performance Testing

```bash
# Install Apache Bench
apt install apache2-utils

# Load test frontend
ab -n 1000 -c 100 https://app.voguevault.com/

# Load test API
ab -n 1000 -c 100 https://api.voguevault.com/api/health
```

### Step 4: SSL/TLS Verification

```bash
# Check certificate validity
openssl s_client -connect api.voguevault.com:443

# Test SSL/TLS configuration
curl -I https://api.voguevault.com
# Should show: Strict-Transport-Security, X-Content-Type-Options, etc.
```

---

## Monitoring & Maintenance

### Step 1: Setup Monitoring

**Application Monitoring (Sentry)**
```bash
# Install in frontend
npm install @sentry/nextjs

# Install in backend
npm install @sentry/node @sentry/tracing
```

**Configure Sentry:**
```typescript
// frontend/sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === 'production',
});
```

**Infrastructure Monitoring**
- Vercel: Built-in analytics
- Heroku: Dashboard metrics
- AWS: CloudWatch
- DigitalOcean: Monitoring graphs
- Self-hosted: Prometheus + Grafana

### Step 2: Set Up Alerts

```bash
# Example: Heroku alerts
heroku alerts:add "CPU >= 85%" --notify=your-email@example.com
heroku alerts:add "Memory >= 90%" --notify=your-email@example.com
```

### Step 3: Backup Strategy

```bash
# Database backups (automatic with managed services)
# Manual backup:
pg_dump -U voguevault_user voguevault_db > backup.sql

# S3 backups (automatic lifecycle)
# Enable versioning on S3 bucket
# Set lifecycle policy to archive old versions after 30 days
```

### Step 4: Log Aggregation

**Using CloudWatch:**
```bash
# Install CloudWatch agent
npm install winston aws-sdk

# Configure logging in backend
const logger = winston.createLogger({
  transports: [
    new winston.transports.CloudWatch({
      logGroupName: '/voguevault/backend',
      logStreamName: 'production',
      awsRegion: process.env.AWS_REGION
    })
  ]
});
```

### Step 5: Deployment Pipeline

```yaml
# GitHub Actions (CI/CD)
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run test
      - run: npm run lint

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: git push heroku main
```

### Step 6: Maintenance Tasks

**Weekly:**
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review analytics

**Monthly:**
- [ ] Update dependencies
- [ ] Review security patches
- [ ] Backup verification
- [ ] Performance review

**Quarterly:**
- [ ] Database optimization
- [ ] Cost analysis
- [ ] Capacity planning
- [ ] Security audit

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates valid
- [ ] Backups in place
- [ ] Monitoring setup
- [ ] Documentation updated

### Deployment Day
- [ ] Announce maintenance window
- [ ] Take database backup
- [ ] Deploy to staging first
- [ ] Test all major features
- [ ] Deploy to production
- [ ] Run health checks
- [ ] Monitor error logs
- [ ] Test user flows

### Post-Deployment
- [ ] Monitor performance metrics
- [ ] Check error reports
- [ ] Verify analytics
- [ ] User feedback
- [ ] Document any issues
- [ ] Schedule follow-up review

---

## Quick Reference Commands

### Vercel Frontend
```bash
vercel --prod              # Deploy to production
vercel env list            # View environment variables
vercel logs                # View deployment logs
```

### Heroku Backend
```bash
heroku deploy main         # Deploy
heroku logs --tail         # View logs
heroku config              # View environment
heroku pg:backups:capture  # Manual backup
```

### Database Management
```bash
# Connect to database
psql postgresql://user:pass@host/dbname

# List tables
\dt

# Backup
pg_dump postgresql://user:pass@host/dbname > backup.sql

# Restore
psql postgresql://user:pass@host/dbname < backup.sql
```

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Heroku Docs**: https://devcenter.heroku.com
- **PostgreSQL**: https://www.postgresql.org/docs
- **AWS**: https://docs.aws.amazon.com
- **Express**: https://expressjs.com
- **Next.js**: https://nextjs.org/docs

---

## Next Steps After Deployment

1. ✅ **Custom Domain Setup**
   - Frontend: app.voguevault.com
   - Backend: api.voguevault.com
   - Admin: admin.voguevault.com

2. ✅ **Email Configuration**
   - Setup transactional emails (Sendgrid, Mailgun)
   - Configure welcome emails
   - Order notifications

3. ✅ **Payment Integration**
   - Stripe webhook configuration
   - Test payment flow
   - Production keys

4. ✅ **CDN Setup**
   - Configure CloudFront/Cloudflare
   - Set cache policies
   - Enable compression

5. ✅ **Analytics**
   - Google Analytics setup
   - Hotjar heatmaps
   - Custom event tracking

6. ✅ **Security**
   - Configure firewall rules
   - Setup DDoS protection
   - Enable 2FA for admin

---

**Estimated Timeline:**
- Setup: 2-4 hours
- Testing: 2-4 hours
- First deployment: 1-2 hours
- Total: 1-2 days

**Good luck with your deployment! 🚀**
