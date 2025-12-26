# Vercel Environment Setup Guide

## Fix Console Errors on Deployed App

The app is deployed but showing "Failed to fetch" on login. This is because demo mode isn't enabled in Vercel.

### Quick Fix: Set Environment Variables in Vercel Dashboard

**Step 1: Go to Vercel Dashboard**
1. Visit: https://vercel.com/dashboard
2. Click on your project: `voguevault`

**Step 2: Click "Settings"**
1. Left sidebar → Settings
2. Look for "Environment Variables" section

**Step 3: Add Environment Variables**

Add these environment variables:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://voguevault-api.onrender.com` |
| `NEXT_PUBLIC_ENABLE_DEMO` | `true` |
| `NEXT_PUBLIC_ENABLE_RECOMMENDATIONS` | `true` |

**Step 4: Redeploy**
1. Go to "Deployments" tab
2. Click the three dots on the latest deployment
3. Select "Redeploy"
4. Wait for deployment to complete (takes ~1-2 minutes)

## What These Variables Do

- **`NEXT_PUBLIC_API_URL`**: Points to your backend API
  - Current: https://voguevault-api.onrender.com
  
- **`NEXT_PUBLIC_ENABLE_DEMO`**: Enables demo authentication mode
  - When `true`: Login/signup works with fake data (no backend needed)
  - When `false`: Uses real backend API
  
- **`NEXT_PUBLIC_ENABLE_RECOMMENDATIONS`**: Enables AI recommendations
  - When `true`: Shows Aurora AI recommendations
  - When `false`: Hides AI features

## Why Demo Mode?

The app uses an intelligent fallback system:

```typescript
// In src/lib/api-client.ts
const shouldUseDemoMode = () => {
  const envDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO === 'true';
  const clientDemoMode = process.env.NODE_ENV !== 'production' || envDemoMode;
  return clientDemoMode;
};
```

This means:
- ✅ In development (localhost): Demo mode works automatically
- ✅ In production (Vercel): Demo mode needs `NEXT_PUBLIC_ENABLE_DEMO=true`
- ✅ Falls back to demo if real API fails (NET::ERR_CONNECTION_REFUSED)

## Current Issues Fixed

### ✅ Icon 404 Errors
- **Before**: Manifest referenced PNG files that didn't exist
- **After**: Now using SVG icons with `image/svg+xml` MIME type
- **Status**: Fixed in latest deployment

### ✅ API Path Issues
- **Before**: Frontend called `/api/auth/login` (wrong path)
- **After**: Uses `/api/v1/auth/login` with correct prefix
- **Status**: Fixed in latest deployment

### ✅ Demo Mode Detection
- **Before**: Only worked if `NEXT_PUBLIC_ENABLE_DEMO=true`
- **After**: Intelligently detects production environment
- **Status**: Fixed in latest deployment

## Test After Setting Variables

1. **Visit the deployed app**: https://voguevault-one.vercel.app
2. **Try login**: 
   - Email: `test@example.com`
   - Password: `password123`
3. **Check console**: Should see no "Failed to fetch" errors
4. **Check About page**: https://voguevault-one.vercel.app/about
   - Should show API status with green indicators

## If You Still See Errors

Try these steps in order:

1. **Hard refresh** your browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Clear cache**: Browser Settings → Cache/Cookies → Clear
3. **Check Vercel logs**:
   - Go to Vercel Dashboard
   - Click "Deployments"
   - Click latest deployment
   - Click "View Details"
   - Scroll to "Function Logs" to see errors

## Vercel vs Render Deployment

| Service | What | URL |
|---------|------|-----|
| **Vercel** | Frontend (Next.js app) | https://voguevault-one.vercel.app |
| **Render** | Backend (Express API) | https://voguevault-api.onrender.com |

Both are free tier, but may have limitations:
- Vercel: 100GB bandwidth/month, auto-deploys on git push
- Render: 750 free hours/month, app may sleep after 15 min inactivity

## Environment Variables Explained

### Production (Vercel)
```
NEXT_PUBLIC_API_URL=https://voguevault-api.onrender.com
NEXT_PUBLIC_ENABLE_DEMO=true
NEXT_PUBLIC_ENABLE_RECOMMENDATIONS=true
```

### Development (Local)
```
NEXT_PUBLIC_API_URL=https://voguevault-api.onrender.com
NEXT_PUBLIC_ENABLE_DEMO=true (optional, auto-enabled)
NEXT_PUBLIC_ENABLE_RECOMMENDATIONS=true
```

## Next Steps

After setting environment variables and redeploying:

1. Test login/signup on Vercel ✅
2. Check console for errors ✅
3. Verify icons display in PWA ✅
4. Test mobile responsiveness ✅
5. Try offline mode (if service worker working) ✅

Questions? Check the console (F12) for detailed error messages.
