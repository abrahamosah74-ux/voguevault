# FIX: Backend Deployment Error on Render

**Error**: `Cannot find module '/opt/render/project/src/backend/services/api-gateway/dist/index.js'`

**Cause**: The start command wasn't compiling TypeScript to dist/ folder.

---

## 🔧 IMMEDIATE FIX (2 minutes)

Go to your Render dashboard:

1. Click **voguevault-api** service
2. Go to **Settings** tab
3. Find **Build Command** - change it to:
   ```
   npm install && npm run build
   ```
4. Find **Start Command** - keep it as:
   ```
   node services/api-gateway/dist/index.js
   ```
5. Click **Save**
6. Go to **Deployments** tab
7. Click **"Deploy latest commit"** button

⏳ Wait 2-3 minutes for rebuild.

---

## ✅ VERIFY IT WORKS

Once deployment shows **"Live"** ✓, test:

```bash
curl https://voguevault-api.onrender.com/health
```

Should respond with:
```json
{"status": "ok"}
```

---

## 📝 WHY THIS HAPPENED

Render's build process:
1. ❌ `npm install` - only installs dependencies (what you had)
2. ✅ `npm install && npm run build` - installs + compiles TypeScript (what you need)

The API Gateway is TypeScript, so it needs to be compiled to JavaScript (`dist/` folder) before it can run.

---

## 🚀 ONCE IT'S RUNNING

Your backend should now:
- ✅ Compile successfully
- ✅ Create dist/ folder
- ✅ Run from dist/index.js
- ✅ Connect to database
- ✅ Accept requests from frontend

Then update frontend with correct backend URL:
- Go to Vercel dashboard
- Set `NEXT_PUBLIC_API_BASE_URL=https://voguevault-api.onrender.com`
- Redeploy

---

**All fixed! Your backend is ready.** 🎉
