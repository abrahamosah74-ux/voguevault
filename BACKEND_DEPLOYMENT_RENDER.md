# Deploy VogueVault Backend to Render

**Time: ~45 minutes**
**Cost: Free tier (with limitations) or $7-15/month for production**

---

## 📋 BACKEND DEPLOYMENT STEPS

### Step 1: Prepare Backend Code

Your backend is already in the `/backend` folder of your GitHub repo. Render will:
1. Clone your repo
2. Navigate to `/backend`
3. Install dependencies
4. Run the server

**First, update backend environment file:**

```bash
cd backend
cp .env.example .env
```

Check [backend/.env.example](backend/.env.example) for required variables:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secret-key-change-this
CORS_ORIGIN=https://voguevault.vercel.app
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
```

---

### Step 2: Create Database on Render

1. Go to **https://dashboard.render.com**
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `voguevault-db`
   - **Database**: `voguevault`
   - **User**: `voguevault_user`
   - **Region**: Choose nearest to you
4. Click **Create Database**

⏳ **Wait 5-10 minutes** for database to be ready.

Once ready:
- Copy the **External Database URL**
- It looks like: `postgresql://user:password@host:port/database`

---

### Step 3: Create Web Service on Render

1. Go to **https://dashboard.render.com**
2. Click **"New +"** → **"Web Service"**
3. Select **GitHub** and connect if needed
4. Find and select **abrahamosah74-ux/voguevault** repo
5. Configure service:

| Setting | Value |
|---------|-------|
| **Name** | `voguevault-api` |
| **Environment** | `Node` |
| **Region** | Same as database |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

6. Click **Create Web Service**

⏳ **Wait for build to complete** (first build takes 2-3 minutes)

---

### Step 4: Add Environment Variables to Render

While the service is building:

1. Click the service name: **voguevault-api**
2. Go to **Settings** tab
3. Scroll to **Environment**
4. Click **Add Environment Variable** for each:

**Copy & Paste These:**

```
NODE_ENV=production
PORT=3000
DATABASE_URL=<PASTE_YOUR_POSTGRES_URL_HERE>
JWT_SECRET=super-secret-key-change-this-in-production
CORS_ORIGIN=https://voguevault.vercel.app
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=voguevault-models
AWS_S3_REGION=us-east-1
STRIPE_PUBLIC_KEY=your-stripe-public-key
STRIPE_SECRET_KEY=your-stripe-secret-key
```

**Where to get these values:**

| Variable | Where to Find |
|----------|---------------|
| `DATABASE_URL` | Render PostgreSQL dashboard |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` |
| `CORS_ORIGIN` | Your Vercel frontend URL |
| `AWS_ACCESS_KEY_ID` | AWS Console → IAM → Users |
| `AWS_SECRET_ACCESS_KEY` | AWS Console → IAM → Users |
| `AWS_S3_BUCKET` | AWS S3 bucket name |

---

### Step 5: Test Backend Service

Once the service shows **"Live"** ✓:

Get your service URL from Render dashboard (looks like: `https://voguevault-api.onrender.com`)

Test the health endpoint:

```bash
curl https://voguevault-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-12-24T10:00:00Z"
}
```

---

### Step 6: Run Database Migrations

Once backend is running and database is connected:

In your terminal:

```bash
# Get your DATABASE_URL from Render
# Then run migrations from backend folder

cd backend

# Install dependencies if not already done
npm install

# Run migrations
npm run migrate
```

Or manually in Render Shell:

1. Click **voguevault-api** service
2. Go to **Shell** tab
3. Run:
```bash
psql $DATABASE_URL < database/migrations/001_initial_schema.sql
psql $DATABASE_URL < database/migrations/002_add_auth_tables.sql
psql $DATABASE_URL < database/migrations/003_add_3d_and_aurora_tables.sql
```

---

### Step 7: Update Frontend to Point to Backend

Now update your Vercel frontend:

1. Go to **https://vercel.com/dashboard**
2. Click **voguevault** project
3. Go to **Settings** → **Environment Variables**
4. Update `NEXT_PUBLIC_API_BASE_URL`:

```
NEXT_PUBLIC_API_BASE_URL=https://voguevault-api.onrender.com
```

Save and redeploy by going to **Deployments** → **Redeploy**.

---

## ✅ VERIFICATION CHECKLIST

After deployment, check these on your frontend:

```javascript
// Open browser console and test API connection
fetch('https://voguevault-api.onrender.com/api/health')
  .then(r => r.json())
  .then(d => console.log('✓ Backend connected:', d))
  .catch(e => console.error('✗ Backend error:', e))
```

You should see: ✓ Backend connected

**Then test in your app:**
- [ ] 3D models load
- [ ] Material customizer works
- [ ] Aurora AI responds
- [ ] Admin dashboard accessible
- [ ] No CORS errors in console

---

## 🐛 TROUBLESHOOTING

### ❌ "502 Bad Gateway" or "Service Crashed"

**Check logs in Render:**
1. Service dashboard → **Logs** tab
2. Look for error messages

**Common causes:**
- Missing environment variable
- Database not connected
- Port conflict
- Missing dependencies

**Fix:**
```bash
# Test locally first
cd backend
npm install
npm run dev
```

### ❌ "Cannot GET /api/health"

**Possible issues:**
1. Wrong service URL in requests
2. API route not defined
3. Server not started

**Check:**
```bash
# Verify backend is running
curl https://voguevault-api.onrender.com/health

# Check Render logs for startup errors
```

### ❌ CORS Errors in Frontend

**In browser console:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Fix in Render environment variables:**
```
CORS_ORIGIN=https://voguevault.vercel.app
```

Then restart the service.

### ❌ Database Connection Failed

**Error in logs:**
```
Error: connect ECONNREFUSED
```

**Check:**
1. Database status in Render (should be "Available")
2. `DATABASE_URL` format is correct
3. External IP is whitelisted (Render does this automatically)

**Fix:**
```
DATABASE_URL=postgresql://user:password@hostname:5432/dbname
```

### ❌ Migrations Failed

**Check database exists:**
```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# Check if tables exist
```

**If tables missing, run migrations:**
```bash
# Run each migration in order
psql $DATABASE_URL -f database/migrations/001_initial_schema.sql
psql $DATABASE_URL -f database/migrations/002_add_auth_tables.sql
psql $DATABASE_URL -f database/migrations/003_add_3d_and_aurora_tables.sql
```

---

## 📊 BACKEND FILE STRUCTURE

```
backend/
├── config/               # Configuration
├── database/            
│   ├── migrations/      # SQL migration files
│   └── schemas/         # Database schemas
├── services/            # Microservices
│   ├── api-gateway/     # Main API entry point
│   ├── user-service/    # User management
│   ├── product-service/ # Product catalog
│   ├── order-service/   # Orders & 3D models
│   └── media-service/   # File uploads
├── shared/              # Shared utilities
│   ├── services/        # AI, payment, database
│   ├── types/           # TypeScript types
│   └── utils/           # Helper functions
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript config
```

---

## 🚀 START COMMAND EXPLANATION

The backend uses `npm start` which runs:

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "build": "tsc"
  }
}
```

This:
1. Compiles TypeScript to `dist/`
2. Runs the compiled JavaScript
3. Listens on `$PORT` (default 3000)

---

## 📡 API ENDPOINTS

Once deployed, your backend provides:

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

### Products
```
GET /api/products
GET /api/products/:id
POST /api/products (admin only)
PUT /api/products/:id (admin only)
```

### 3D Models
```
GET /api/products/:productId/3d-models
POST /api/admin/products/:productId/3d-models
DELETE /api/admin/3d-models/:modelId
GET /api/materials
POST /api/admin/materials
```

### Orders
```
GET /api/orders
POST /api/orders
GET /api/orders/:id
PUT /api/orders/:id/status
```

### Aurora AI
```
POST /api/aurora/chat
POST /api/aurora/recommendations
GET /api/aurora/outfit/:id
```

---

## 🔄 DEPLOYMENT SUMMARY

| Component | Platform | Status |
|-----------|----------|--------|
| **Frontend** | Vercel | ✅ Live |
| **Backend API** | Render | In Progress |
| **Database** | Render PostgreSQL | In Progress |
| **Storage** | AWS S3 | Ready |

---

## 💾 BACKUP DATABASE

**Before any changes, backup your data:**

```bash
# Dump database
pg_dump $DATABASE_URL > backup.sql

# Later restore with:
psql $DATABASE_URL < backup.sql
```

---

## 📝 NEXT STEPS

After backend deployment:

1. ✅ Test all API endpoints
2. ✅ Verify database operations
3. ✅ Check file uploads to S3
4. ✅ Test authentication flow
5. ✅ Setup monitoring with Sentry
6. ✅ Configure email notifications
7. ✅ Setup payment processing

---

## 🆘 NEED HELP?

**Quick fixes:**

1. **Check logs**: Render dashboard → Service → Logs
2. **Verify env vars**: Settings → Environment
3. **Test locally**: `npm run dev` in backend folder
4. **Check database**: `psql $DATABASE_URL`

**Common URLs:**
- Render Dashboard: https://dashboard.render.com
- Your API: https://voguevault-api.onrender.com
- Your Frontend: https://voguevault.vercel.app

---

**Ready to deploy? Start with Step 1! 🚀**
