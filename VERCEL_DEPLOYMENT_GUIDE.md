# 🚀 Deploy VogueVault to Vercel - Quick Guide

**The app is working locally!** Now let's deploy to Vercel.

## 🔗 Quick Deploy (Easiest)

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel:** https://vercel.com
2. **Sign in** with your GitHub account
3. **Click "New Project"**
4. **Import Repository:**
   - Search for: `voguevault`
   - Click "Import"
5. **Configure Project:**
   - Framework: Next.js (auto-detected)
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)
6. **Add Environment Variables:**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://voguevault-api.onrender.com`
   - Click "Add"
7. **Deploy!**
   - Click "Deploy" button
   - Wait 2-3 minutes
   - You'll get a URL like: `https://voguevault-cyan.vercel.app`

### Option 2: Deploy via CLI (Advanced)

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from your project directory
cd voguevault
vercel

# 4. Answer prompts:
# - Link to existing project? → No
# - Project name? → voguevault
# - Which directory? → ./ (current)
# - Environment variables? → Add NEXT_PUBLIC_API_URL

# 5. Visit your deployed app!
# https://voguevault-[random].vercel.app
```

### Option 3: GitHub Auto-Deploy (Automatic)

1. **Connect Vercel to GitHub:**
   - Go to vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Select repository
   - Vercel will auto-deploy on every push!

---

## ✅ Environment Variables in Vercel

**Critical:** Set these in Vercel Dashboard:

```
NEXT_PUBLIC_API_URL = https://voguevault-api.onrender.com
NEXT_PUBLIC_ENABLE_DEMO = true
NEXT_PUBLIC_ENABLE_RECOMMENDATIONS = true
```

**Steps:**
1. Vercel Dashboard → Settings
2. Scroll to "Environment Variables"
3. Add each variable from above
4. Click "Save"
5. **Redeploy** your project

---

## 🔍 Verify Deployment

After deployment, check:

1. **App Loads:**
   ```
   Visit your Vercel URL: https://voguevault-[name].vercel.app
   ```

2. **Landing Page Shows:**
   - Purple gradient "Your Personal AI Fashion Consultant" heading
   - "Get Started Free" button
   - "Try Aurora AI" button

3. **Check Console for Errors:**
   - F12 → Console
   - Look for red errors
   - Check Network tab for failed requests

4. **Verify API Connection:**
   - Open DevTools → Network
   - Click "Get Started Free"
   - Should see request to `NEXT_PUBLIC_API_URL`

---

## 🐛 Troubleshooting Deployment

### Build Failed on Vercel
**Error:** "Build failed" in Vercel logs

**Solutions:**
1. Check build logs in Vercel Dashboard
2. Run locally first: `npm run build`
3. Verify all dependencies are installed: `npm install`
4. Check for TypeScript errors: `npx tsc --noEmit`

### App Shows Blank Page
**Error:** Page loads but nothing displays

**Solutions:**
1. Check browser console (F12)
2. Check Vercel logs: Dashboard → Deployments → [latest] → Logs
3. Ensure `NEXT_PUBLIC_API_URL` is set in Vercel (Settings → Environment Variables)
4. Verify backend is running and accessible

### API Calls Failing (Network Errors)
**Error:** 404 or CORS errors in Network tab

**Solutions:**
1. Verify `NEXT_PUBLIC_API_URL` matches your Render backend URL
2. Verify Render backend is running: Visit the URL in your browser
3. Check Render backend logs for errors
4. Add CORS headers in backend (should allow Vercel domain)

### Service Worker Errors
**Error:** Offline mode not working

**Solutions:**
1. Clear browser cache
2. Uninstall PWA app from home screen
3. Check browser console for SW errors
4. Verify `service-worker.js` is in `/public`

---

## 📋 Pre-Deployment Checklist

- [ ] Run locally: `npm run dev`
- [ ] Check app loads on `http://localhost:3000`
- [ ] Verify `.env.local` has `NEXT_PUBLIC_API_URL`
- [ ] Run build: `npm run build` (check for errors)
- [ ] GitHub repository is up to date
- [ ] All changes committed: `git status` (should be clean)
- [ ] Backend on Render is running

---

## 🎯 Final Steps

### 1. Deploy
```bash
# Option A: Via CLI
vercel

# Option B: Via Dashboard
# Go to vercel.com and import your GitHub repo
```

### 2. Set Environment Variables in Vercel
```
NEXT_PUBLIC_API_URL=https://voguevault-api.onrender.com
```

### 3. Verify
```
Visit: https://voguevault-[name].vercel.app
```

### 4. Share
```
Share your Vercel URL with users!
```

---

## 📊 Current Status

✅ **Frontend Code:** Ready  
✅ **Local Testing:** Works on `http://localhost:3000`  
✅ **Environment:** Configured in `.env.local`  
⏳ **Vercel Deployment:** Pending (you need to do this!)  
✅ **Backend API:** Ready on `voguevault-api.onrender.com`  

---

## 🚀 Next Steps

1. **Go to Vercel:** https://vercel.com
2. **Sign in** with GitHub
3. **Import this repository**
4. **Add environment variables** (NEXT_PUBLIC_API_URL)
5. **Click Deploy**
6. **Share your URL!**

---

**Everything is ready. Just deploy it now!**

Questions? Check the logs in Vercel Dashboard → Deployments → [your deployment]
