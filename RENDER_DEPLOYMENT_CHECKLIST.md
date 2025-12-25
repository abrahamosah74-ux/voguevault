# 📋 RENDER DEPLOYMENT - COMPLETE CHECKLIST

**Everything you need to deploy your backend in one place**

---

## ✅ BEFORE YOU START

- [ ] GitHub account with code pushed
- [ ] Render account created (https://render.com)
- [ ] AWS account with S3 (free tier available)
- [ ] Vercel frontend URL (https://voguevault.vercel.app)

---

## 📦 PART 1: DATABASE SETUP

### Create PostgreSQL Database on Render

**URL**: https://dashboard.render.com

**Steps:**
1. Click **"New +"** → **"PostgreSQL"**
2. Fill in:
   - Name: `voguevault-db`
   - Database: `voguevault`
   - User: `voguevault`
3. Click **"Create Database"**

**⏳ Wait 5 minutes for database to be ready**

**Then COPY this value:**
```
DATABASE_URL=postgresql://voguevault:PASSWORD@HOST:5432/voguevault
```

---

## 🔑 PART 2: GET ALL ENVIRONMENT VARIABLES

### A) JWT Secrets (Use these)
```
JWT_ACCESS_SECRET=Y2Y0ZWQ0NDYtMzk1MC00NWQ1LTlmYTktMjJiZTIxN2RlNWRlYTNkZDExOTMtMzgwNS00YTZjLWJlZmItZWY2MTIxODJiNzQ2
JWT_REFRESH_SECRET=OThjM2Y0ZTEtZjc2My00YWVmLWIzNjEtMjgzNmEzMTZjNGI0YjgxODUzOGUtYzU4OC00YjE4LWEzZGItZTAyN2MzZjcyYTk3
```

### B) CORS Origin (Your Vercel URL)
```
CORS_ORIGIN=https://voguevault.vercel.app
```

### C) AWS Keys

**See: AWS_KEYS_QUICK.md or GET_AWS_KEYS.md**

Steps:
1. Create S3 bucket: `voguevault-models`
2. Create IAM user: `voguevault-app`
3. Get Access Key ID and Secret Access Key
4. Copy both values

```
AWS_S3_BUCKET=voguevault-models
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

---

## 🚀 PART 3: DEPLOY BACKEND SERVICE

**URL**: https://dashboard.render.com

**Steps:**
1. Click **"New +"** → **"Web Service"**
2. Select GitHub repo: **voguevault**
3. Fill in:
   ```
   Name: voguevault-api
   Environment: Node
   Region: (choose one)
   Branch: main
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: node services/api-gateway/dist/index.js
   ```
4. Click **"Create Web Service"**

**⏳ First build takes 2-3 minutes**

---

## 🔌 PART 4: ADD ENVIRONMENT VARIABLES

**While building, go to:**
1. Click **voguevault-api** service
2. Go to **Settings** tab
3. Scroll to **Environment**
4. Click **"Add Environment Variable"** for each:

**Add these variables:**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://voguevault:PASSWORD@HOST:5432/voguevault
POSTGRES_HOST=HOST (from database URL)
POSTGRES_PORT=5432
POSTGRES_USER=voguevault
POSTGRES_DB=voguevault

JWT_ACCESS_SECRET=Y2Y0ZWQ0NDYtMzk1MC00NWQ1LTlmYTktMjJiZTIxN2RlNWRlYTNkZDExOTMtMzgwNS00YTZjLWJlZmItZWY2MTIxODJiNzQ2
JWT_REFRESH_SECRET=OThjM2Y0ZTEtZjc2My00YWVmLWIzNjEtMjgzNmEzMTZjNGI0YjgxODUzOGUtYzU4OC00YjE4LWEzZGItZTAyN2MzZjcyYTk3

CORS_ORIGIN=https://voguevault.vercel.app

AWS_S3_BUCKET=voguevault-models
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET
```

**Click Save** and wait for auto-redeploy (1-2 minutes)

---

## 🧪 PART 5: TEST BACKEND

Once service shows **"Live"** ✓:

**Test the API:**
```bash
curl https://voguevault-api.onrender.com/health
```

**Expected response:**
```
{"status": "ok"}
```

---

## 🔗 PART 6: UPDATE FRONTEND

**URL**: https://vercel.com/dashboard

**Steps:**
1. Click **voguevault** project
2. Go to **Settings** → **Environment Variables**
3. Find: `NEXT_PUBLIC_API_BASE_URL`
4. Update to:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://voguevault-api.onrender.com
   ```
5. Save
6. Go to **Deployments** tab
7. Click **"Redeploy"** on latest deployment

**⏳ Wait for deployment to complete**

---

## ✅ FINAL VERIFICATION

**Visit your frontend: https://voguevault.vercel.app**

Check if everything works:
- [ ] Page loads without errors
- [ ] 3D models load
- [ ] Materials update
- [ ] Aurora AI responds
- [ ] No CORS errors in Console (F12)
- [ ] Admin dashboard accessible

---

## 📊 YOUR DEPLOYMENT STATUS

| Component | Platform | URL | Status |
|-----------|----------|-----|--------|
| Frontend | Vercel | https://voguevault.vercel.app | ✅ Live |
| Backend API | Render | https://voguevault-api.onrender.com | 🚀 Deploying |
| Database | Render PostgreSQL | Internal | 🚀 Deploying |
| Storage | AWS S3 | voguevault-models | 🚀 Ready |

---

## 🆘 IF SOMETHING BREAKS

**Backend won't start?**
- Go to **voguevault-api** → **Logs** tab
- Look for error messages
- Check Build Command is: `npm install && npm run build`

**Database connection error?**
- Verify DATABASE_URL is correct
- Database should show "Available"

**Frontend can't reach backend?**
- Check `NEXT_PUBLIC_API_BASE_URL` is correct
- Verify CORS_ORIGIN matches frontend

---

## 📚 RELATED GUIDES

- **AWS_KEYS_QUICK.md** - Get AWS keys in 6 minutes
- **GET_AWS_KEYS.md** - Detailed AWS setup
- **GET_ENVIRONMENT_VARIABLES.md** - All variables explained
- **QUICK_BACKEND_DEPLOYMENT.md** - 30-minute deployment
- **BACKEND_DEPLOYMENT_RENDER.md** - Detailed troubleshooting
- **BACKEND_FIX_RENDER.md** - Fix deployment errors

---

## 🎉 YOU'RE ALL SET!

You have everything needed to deploy:
- ✅ Backend code on GitHub
- ✅ Database ready on Render
- ✅ Environment variables documented
- ✅ Deployment steps clear
- ✅ Testing instructions

**Start with PART 1 and follow through PART 6!**

**Questions? Check the related guides above.** 📚

---

**Happy deploying! 🚀**
