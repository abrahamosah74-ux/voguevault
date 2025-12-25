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
   Build Command: npm install
   Start Command: node services/api-gateway/dist/index.js
   ```
5. Click **Create Web Service**

⏳ First build takes 2-3 minutes.

---

### Part 3: Add Environment Variables (5 min)

While building, go to **Settings** → **Environment** and add:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=<paste_the_database_url_here>
POSTGRES_HOST=your_host
POSTGRES_PORT=5432
POSTGRES_USER=voguevault
POSTGRES_DB=voguevault
JWT_ACCESS_SECRET=your-secret-key-12345
JWT_REFRESH_SECRET=your-secret-key-67890
CORS_ORIGIN=https://voguevault.vercel.app
AWS_S3_BUCKET=voguevault-models
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
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
