# Deploy VogueVault: GitHub + Vercel + Render Stack

**Total Time: ~2 hours**
**Cost: $7-20/month (Vercel free + Render free tier with paid database)**

---

## ✅ CHECKLIST BEFORE STARTING

- [ ] GitHub account (ready with code)
- [ ] Vercel account (connected to GitHub)
- [ ] Render account (render.com)
- [ ] npm/Node.js installed locally
- [ ] Git configured
- [ ] All `.env.example` files prepared

---

## PART 1: FRONTEND DEPLOYMENT (Vercel) - 20 minutes

### Step 1.1: Push Code to GitHub

```bash
# Navigate to your project
cd c:\Users\Teest\OneDrive\Desktop\voguevault

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - VogueVault 3D system"

# Add GitHub remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/voguevault.git

# Push to main branch
git branch -M main
git push -u origin main
```

✅ **Result**: Code is now on GitHub at `https://github.com/YOUR_USERNAME/voguevault`

---

### Step 1.2: Connect Vercel to GitHub

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Connect your GitHub account if prompted
4. Find and select **voguevault** repository
5. Click **Import**

✅ **Result**: Vercel created a project

---

### Step 1.3: Configure Vercel Environment Variables

On the Vercel import page, you'll see an **Environment Variables** section.

Add these variables (you'll get the API URL from Render in Part 2):

```
NEXT_PUBLIC_API_BASE_URL=https://voguevault-api.onrender.com
NEXT_PUBLIC_3D_MODELS_URL=https://voguevault-api.onrender.com/api/models
NEXT_PUBLIC_AURORA_AI_ENABLED=true
NEXT_PUBLIC_AR_ENABLED=true
```

**Note**: Leave the backend URL as placeholder for now, we'll update it after Render deployment.

For now, use a temporary value:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

Then click **Deploy** button.

✅ **Result**: Frontend is now live at `https://voguevault.vercel.app` (or your custom domain)

---

### Step 1.4: Verify Frontend Deployment

Visit: **https://voguevault.vercel.app**

Check:
- [ ] Page loads without errors
- [ ] No console errors (F12 → Console)
- [ ] Navigation works

---

## PART 2: BACKEND DEPLOYMENT (Render) - 40 minutes

### Step 2.1: Create Render Web Service

1. Go to **https://dashboard.render.com**
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if prompted
4. Select **voguevault** repository
5. Configure:
   - **Name**: `voguevault-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start` (or `node dist/index.js`)
   - **Region**: Choose closest to your users

Click **Create Web Service**

✅ **Result**: Render is building your backend service

---

### Step 2.2: Set Up Render Environment Variables

While Render is building, go to your service settings:

1. Click your service name: **voguevault-api**
2. Go to **Environment** tab
3. Add these variables:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://user:password@host/dbname
JWT_SECRET=your-secret-key-here-change-this
CORS_ORIGIN=https://voguevault.vercel.app
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
```

**Important Variables Guide:**

| Variable | Value | Where to Get |
|----------|-------|--------------|
| `DATABASE_URL` | PostgreSQL connection | Step 2.3 below |
| `JWT_SECRET` | Random long string | Generate: `openssl rand -base64 32` |
| `CORS_ORIGIN` | Your Vercel URL | `https://voguevault.vercel.app` |
| `AWS_S3_BUCKET` | Your S3 bucket name | AWS Console |

---

### Step 2.3: Create PostgreSQL Database on Render

1. Go back to **https://dashboard.render.com**
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `voguevault-db`
   - **Region**: Same as web service
   - **Database Name**: `voguevault`
   - **User**: `voguevault_user`
4. Click **Create Database**

✅ **Wait**: This takes ~5-10 minutes

Once ready:
- Copy the **External Database URL**
- In your web service, add to Environment:
  ```
  DATABASE_URL=<paste-the-url-here>
  ```

---

### Step 2.4: Run Database Migrations

Once database is running:

1. In Render web service, click **"Shell"** tab
2. Run migrations:

```bash
# Login to database
psql $DATABASE_URL

# Paste SQL from migration files (see below)
# Copy content from backend/services/order-service/src/database/migrations/

# Or run via Node:
npm run migrate
```

**Migration Files to Run** (in order):

1. `001_initial_schema.sql` - Base tables
2. `002_add_auth_tables.sql` - Authentication
3. `003_add_3d_and_aurora_tables.sql` - 3D models & Aurora AI

See DEPLOYMENT_GUIDE.md for full migration SQL.

✅ **Result**: Database tables created

---

### Step 2.5: Test Backend Service

Once built and running, Render will give you a URL like:
```
https://voguevault-api.onrender.com
```

Test the health endpoint:

```bash
curl https://voguevault-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-24T10:00:00Z"
}
```

✅ **Result**: Backend is running

---

## PART 3: CONNECT FRONTEND TO BACKEND - 10 minutes

### Step 3.1: Update Vercel Environment Variable

Now that you have your Render backend URL:

1. Go to **https://vercel.com/dashboard**
2. Click **voguevault** project
3. Go to **Settings** → **Environment Variables**
4. Update `NEXT_PUBLIC_API_BASE_URL`:

```
NEXT_PUBLIC_API_BASE_URL=https://voguevault-api.onrender.com
```

Save it.

---

### Step 3.2: Redeploy Frontend

Vercel will automatically redeploy when you save. Check:

1. Go to **Deployments** tab
2. Wait for new deployment to complete (should see a new deployment)
3. Once "Ready", visit your site

✅ **Result**: Frontend now connected to backend

---

### Step 3.3: Test API Connection

On your frontend, open console (F12):

```javascript
// Test API connection
fetch('https://voguevault-api.onrender.com/api/health')
  .then(r => r.json())
  .then(d => console.log('API Response:', d))
  .catch(e => console.error('API Error:', e))
```

Should see: `API Response: {status: "healthy", ...}`

✅ **Result**: Frontend talking to backend

---

## PART 4: CONFIGURE STORAGE (AWS S3) - 10 minutes

### Step 4.1: Create AWS S3 Bucket (if not already done)

1. Go to **https://console.aws.amazon.com/s3**
2. Click **Create bucket**
3. Name: `voguevault-models`
4. Region: Same as Render
5. **Block all public access**: OFF (or configure CORS)
6. Create bucket

---

### Step 4.2: Get AWS Credentials

1. Go to **IAM → Users** in AWS Console
2. Create new user: `voguevault-app`
3. Attach policy: **AmazonS3FullAccess**
4. Create access key
5. Copy **Access Key ID** and **Secret Access Key**

---

### Step 4.3: Add AWS Credentials to Render

In Render web service Environment Variables, add:

```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=voguevault-models
AWS_S3_REGION=us-east-1
```

Save and Render will auto-redeploy.

✅ **Result**: Backend can upload to S3

---

### Step 4.4: Configure CORS on S3 (Optional)

If you want models to load from S3 directly:

1. In S3 bucket, go to **Permissions** → **CORS**
2. Add:

```json
[
  {
    "AllowedOrigins": [
      "https://voguevault.vercel.app",
      "https://voguevault-api.onrender.com"
    ],
    "AllowedMethods": ["GET", "HEAD", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

Save.

---

## PART 5: FINAL TESTING - 15 minutes

### Test Checklist

Visit **https://voguevault.vercel.app** and check:

#### 🎯 Frontend Tests
- [ ] Homepage loads
- [ ] No console errors (F12)
- [ ] Page is responsive (try mobile view)

#### 🔗 API Tests
- [ ] API health endpoint responds
- [ ] Can see API requests in Network tab (F12)
- [ ] No CORS errors

#### 3️⃣ 3D Viewer Tests
- [ ] 3D models load
- [ ] Can rotate/zoom models
- [ ] Materials update correctly
- [ ] No 404 errors for models

#### 🤖 Aurora AI Tests
- [ ] Chat interface loads
- [ ] Can send messages
- [ ] Responses come back
- [ ] No API errors

#### 📱 AR Tests (if on mobile)
- [ ] AR try-on button shows
- [ ] Can launch AR view
- [ ] Models appear in AR

#### ⚙️ Admin Tests
- [ ] Admin dashboard accessible
- [ ] Can upload files
- [ ] Can create materials
- [ ] Database operations work

---

## TROUBLESHOOTING

### ❌ Frontend build fails

**Check**:
```bash
# Run build locally
npm run build

# Check for errors
npm run lint
```

**Common issues**:
- Missing environment variables
- TypeScript errors
- Missing dependencies

**Fix**:
```bash
npm install
npm run build
```

Then push to GitHub - Vercel will auto-redeploy.

---

### ❌ Backend build fails

In Render dashboard, check **Logs** tab for errors.

**Common issues**:
- Missing dependencies: `npm install`
- Port not available: Change `PORT` in env
- Database connection failed: Check `DATABASE_URL`

**Fix locally first**:
```bash
npm install
npm run build
npm start
```

---

### ❌ CORS errors

**In browser console**, you see:
```
Access to XMLHttpRequest from origin has been blocked by CORS policy
```

**Fix**: Update Render environment variable:
```
CORS_ORIGIN=https://voguevault.vercel.app
```

Then redeploy backend.

---

### ❌ Database connection fails

**Check connection string format**:
```
postgresql://user:password@host:5432/database
```

**From Render**:
- Database Dashboard → Your database → Connection string
- Copy entire **External Database URL**
- Paste as `DATABASE_URL`

---

### ❌ Models won't load from S3

**Check**:
1. S3 bucket name correct in env
2. AWS credentials valid
3. Bucket is public (or CORS configured)
4. Files actually uploaded to S3

**Debug**:
```bash
# Test S3 upload locally
npm install aws-sdk
node scripts/test-s3-upload.js
```

---

### ❌ Render keeps restarting

**Check logs** in Render dashboard.

**Common causes**:
- Database connection failing
- Memory limit hit
- Unhandled errors

**Upgrade Render plan** if memory is issue (free tier is 512MB).

---

## MONITORING AFTER DEPLOYMENT

### Daily Tasks
```bash
# Check both are up
curl https://voguevault-api.onrender.com/api/health
curl https://voguevault.vercel.app

# Check Vercel logs
vercel logs

# Check Render logs
# Go to Render dashboard → voguevault-api → Logs tab
```

### Weekly Tasks
- Check Render resource usage (Metrics tab)
- Monitor error logs for patterns
- Check S3 costs
- Verify backups working

### Monthly Tasks
- Update dependencies
- Security patches
- Database optimization
- Cost review

---

## USEFUL LINKS

| Service | Link | What To Do |
|---------|------|-----------|
| **GitHub** | https://github.com/YOUR_USERNAME/voguevault | Manage code |
| **Vercel** | https://vercel.com/dashboard | Frontend deployment |
| **Render** | https://dashboard.render.com | Backend + Database |
| **AWS S3** | https://console.aws.amazon.com/s3 | File storage |
| **Your App** | https://voguevault.vercel.app | Live site |

---

## QUICK REFERENCE: ALL COMMANDS

```bash
# LOCAL DEVELOPMENT
npm install
npm run dev
# Visit http://localhost:3000

# BUILD & TEST LOCALLY
npm run build
npm run lint
npm start

# PUSH TO GITHUB
git add .
git commit -m "Your message"
git push origin main

# GENERATE JWT SECRET
openssl rand -base64 32

# TEST BACKEND
curl https://voguevault-api.onrender.com/api/health

# TEST FRONTEND
curl https://voguevault.vercel.app
```

---

## COST BREAKDOWN

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel | ✅ 100GB bandwidth | $0 |
| Render | ✅ Web service (512MB RAM, spinning down after 15 min inactivity) | $0-7 |
| PostgreSQL (Render) | ❌ 256MB storage only | $7-15/month |
| AWS S3 | ✅ 5GB free for 12 months | $1+ after |
| **Total** | | **$7-20/month** |

**Recommendations**:
- Use Render free tier for testing
- Upgrade PostgreSQL to paid plan ($7/month) for production
- Use AWS S3 for model storage

---

## SUCCESS CHECKLIST

After deployment, you should have:

- [ ] Frontend live at https://voguevault.vercel.app
- [ ] Backend live at https://voguevault-api.onrender.com
- [ ] Database running and accessible
- [ ] S3 bucket configured
- [ ] Environment variables set on both platforms
- [ ] API responding to requests
- [ ] 3D models loading
- [ ] Aurora AI working
- [ ] AR try-on launching
- [ ] Admin dashboard accessible
- [ ] All tests passing
- [ ] Zero CORS errors
- [ ] Monitoring logs visible

---

## NEXT STEPS

1. **Monitor closely** - Watch logs for first 24 hours
2. **Set up monitoring** - Add Sentry for error tracking
3. **Configure domain** - Add custom domain in Vercel
4. **Setup emails** - Add SendGrid for notifications
5. **Add analytics** - Google Analytics for user tracking
6. **Plan upgrades** - Upgrade databases as usage grows

---

## SUPPORT & HELP

If stuck:

1. Check **Render logs** (Render Dashboard → Logs tab)
2. Check **Vercel logs** (Vercel Dashboard → Deployments tab)
3. Check **browser console** (F12 → Console)
4. See **DEPLOYMENT_GUIDE.md** for detailed options
5. Check **TROUBLESHOOTING** section above

---

**🎉 You're deploying on Vercel + Render!**

**Time estimate: 2 hours**

**Let's go! Start with Step 1.1 →**
