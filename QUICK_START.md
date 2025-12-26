# VogueVault Quick Start Guide

## 🚀 What You Have

A full-stack fashion AI application with:
- **Frontend**: Modern Next.js 16 React app deployed to Vercel
- **Backend**: Express.js REST API deployed to Render
- **Features**: Authentication, Product Catalog, Aurora AI Recommendations

## 🎯 Quick Setup (5 minutes)

### Step 1: Configure Frontend Environment (Vercel)

1. Go to https://vercel.com and log in
2. Select the `voguevault` project
3. Go to **Settings → Environment Variables**
4. Add these variables (all environments):
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://voguevault-api.onrender.com`
5. Scroll down and click **Redeploy** for the latest deployment

### Step 2: Configure Backend Environment (Render)

1. Go to https://dashboard.render.com and log in
2. Select the `voguevault-api` service
3. Go to **Settings → Environment**
4. Add these required variables:

```
DB_HOST=your_database_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=voguevault_prod
DB_PORT=5432
JWT_SECRET=generate_with_openssl_rand_-hex_32
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RESEND_API_KEY=your_resend_key
CORS_ORIGIN=https://voguevault-cyan.vercel.app
```

5. Click **Save Changes**

### Step 3: Test Everything

1. **Backend Health Check**: https://voguevault-api.onrender.com/health
   - Should return `{"status":"ok",...}`

2. **Frontend Loading**: https://voguevault-cyan.vercel.app
   - Should show VogueVault landing page

3. **Sign Up**: Click "Get Started Free"
   - Create an account at `/auth`

4. **Dashboard**: After login
   - Should show user info and API health status
   - Click "Check API Health" button to verify connection

5. **Products**: Click "Products" in navbar
   - Should load items from backend

6. **Aurora AI**: Click "Aurora AI" in navbar
   - Try generating an outfit for testing

## 📁 Project Structure

```
voguevault/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── layout.tsx         # Root layout (has Navbar)
│   │   ├── page.tsx           # Landing page
│   │   ├── auth/page.tsx      # Login/signup
│   │   ├── dashboard/page.tsx # User dashboard
│   │   ├── products/page.tsx  # Product listing
│   │   └── recommendations/   # Aurora AI
│   ├── components/
│   │   └── navbar.tsx         # Navigation bar
│   ├── hooks/
│   │   └── useAuth.ts         # Auth state management
│   ├── lib/
│   │   └── api-client.ts      # Backend API wrapper
│   └── globals.css            # Global styles
├── backend/                    # Render deployed Express API
│   ├── services/
│   │   └── api-gateway/       # Main API service
│   └── shared/                # Shared code (services, types)
├── package.json               # Frontend dependencies
├── tsconfig.json              # TypeScript config
├── next.config.ts             # Next.js config
└── ENV_SETUP_GUIDE.md         # Detailed env var setup
```

## 🔑 Key Features

### Authentication
- Login/signup at `/auth`
- Auth tokens saved to localStorage
- `useAuth()` hook for managing auth state
- Dashboard at `/dashboard` (protected route)

### API Integration
- Centralized API client: `src/lib/api-client.ts`
- Methods for: auth, products, recommendations, orders
- Automatic auth token injection in requests
- Error handling and TypeScript types

### Frontend Pages
| Route | Purpose |
|-------|---------|
| `/` | Landing page with features |
| `/auth` | Sign up / login |
| `/dashboard` | User profile & API health |
| `/products` | Browse and search products |
| `/recommendations` | Aurora AI outfit generator |

### Backend Endpoints (Examples)
```
GET  /health                    # Health check
POST /api/auth/register         # User signup
POST /api/auth/login            # User login
GET  /api/products              # List products
POST /api/aurora/generate       # Generate outfit
```

## 🛠️ Development

### Run Frontend Locally
```bash
npm install
npm run dev
# Visit http://localhost:3000
```

### Environment Variables (Local)
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENABLE_DEMO=true
```

### Run Backend Locally
```bash
cd backend/services/api-gateway
npm install
npm run dev
# Runs on http://localhost:3001
```

## 📊 Deployment Status

| Service | Platform | Status | URL |
|---------|----------|--------|-----|
| Frontend | Vercel | ✅ Deployed | https://voguevault-cyan.vercel.app |
| Backend | Render | ✅ Deployed | https://voguevault-api.onrender.com |

## 🐛 Common Issues

### "Cannot find module" errors
- Make sure `.env.local` has `NEXT_PUBLIC_API_URL`
- Restart dev server after changing env vars

### 404 on Frontend
- Wait for Vercel deployment to complete
- Check Deployments tab for latest build status
- Try clicking "Redeploy" on latest successful deployment

### API calls return 401/403
- Check that `JWT_SECRET` is set on Render backend
- Verify auth token in browser localStorage
- Check CORS_ORIGIN matches your frontend URL

### Products/Recommendations don't load
- Verify backend at `https://voguevault-api.onrender.com/health`
- Check browser Network tab for failed requests
- Review error in browser console

## 📞 Next Steps

1. **Set up environment variables** (see ENV_SETUP_GUIDE.md)
2. **Test all routes** (landing, auth, dashboard, products, recommendations)
3. **Monitor logs** in Vercel and Render dashboards
4. **Add your branding** (update colors, logos, text)
5. **Integrate real data** (connect actual product database)
6. **Set up payment** (Stripe/Paystack integration)
7. **Go live!** 🎉

## 💡 Pro Tips

- Use browser DevTools Console to monitor API calls
- Check Vercel/Render deployment logs when builds fail
- Use `curl` to test backend endpoints directly
- Keep env vars secure - never commit `.env` files
- Always test locally before pushing to production

---

**Ready to go live?** Start with Step 1 above and you'll be up and running in minutes! 🚀
