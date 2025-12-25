# Quick Backend Deployment to Render - 30 Minutes

**For your GitHub + Vercel + Render stack**

---

## ⚡ FASTEST PATH

### Part 1: Create Database (5 min)

1. Go to **https://dashboard.render.com**
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in:
   - **Name**: voguevault-db
   - **Database**: voguevault
   - **User**: voguevault
4. Click **Create**

⏳ Wait 5 min for database. Then **copy the External Database URL** (starts with `postgresql://`)

---

### Part 2: Deploy Backend Service (10 min)

1. Go to **https://dashboard.render.com**
2. Click **"New +"** → **"Web Service"**
3. Select **GitHub** repo: **voguevault**
4. Fill in:
   ```
   Name: voguevault-api
   Environment: Node
   Region: (choose one)
   Branch: main
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: node services/api-gateway/dist/index.js
   ```
5. Click **Create Web Service**

⏳ First build takes 2-3 minutes.

---

### Part 3: Add Environment Variables (5 min)

While building, go to **Settings** → **Environment** and add:

**Server Configuration:**
```
NODE_ENV=production
PORT=3000
```

**Database:**
```
DATABASE_URL=<paste_the_database_url_here>
POSTGRES_HOST=<your_host_from_database>
POSTGRES_PORT=5432
POSTGRES_USER=voguevault
POSTGRES_DB=voguevault
```

**Authentication:**
```
JWT_ACCESS_SECRET=Y2Y0ZWQ0NDYtMzk1MC00NWQ1LTlmYTktMjJiZTIxN2RlNWRlYTNkZDExOTMtMzgwNS00YTZjLWJlZmItZWY2MTIxODJiNzQ2
JWT_REFRESH_SECRET=OThjM2Y0ZTEtZjc2My00YWVmLWIzNjEtMjgzNmEzMTZjNGI0YjgxODUzOGUtYzU4OC00YjE4LWEzZGItZTAyN2MzZjcyYTk3
CORS_ORIGIN=https://voguevault.vercel.app
```

**File Storage (Cloudinary):**
```
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

Save and wait for auto-redeploy.

---

### Part 4: Test (3 min)

Once service shows **"Live"** ✓:

```bash
# Test API is working
curl https://voguevault-api.onrender.com/health

# Expected: 
# {"status": "ok"}
```

---

### Part 5: Update Frontend (2 min)

1. Go to **https://vercel.com/dashboard**
2. Click **voguevault**
3. **Settings** → **Environment Variables**
4. Update: 
   ```
   NEXT_PUBLIC_API_BASE_URL=https://voguevault-api.onrender.com
   ```
5. Go to **Deployments** and **Redeploy**

---

## ✅ YOU'RE DONE!

Your full stack is now deployed:
- ✅ Frontend: https://voguevault.vercel.app
- ✅ Backend: https://voguevault-api.onrender.com  
- ✅ Database: Render PostgreSQL

---

## 🧪 TEST IT

Visit your frontend and check:
- [ ] 3D models load
- [ ] Materials update
- [ ] Aurora AI responds
- [ ] No errors in Console (F12)

---

## 🆘 IF SOMETHING BREAKS

**Backend won't start?**
- Check Render logs: Service → Logs
- Look for error messages

**Database connection error?**
- Verify DATABASE_URL is correct
- Database should show "Available" in Render

**Frontend can't reach backend?**
- Check `NEXT_PUBLIC_API_BASE_URL` is correct
- Verify CORS_ORIGIN matches your frontend

---

## 📚 DETAILED GUIDE

For troubleshooting, see: **BACKEND_DEPLOYMENT_RENDER.md**

---

**Done! 🎉**
