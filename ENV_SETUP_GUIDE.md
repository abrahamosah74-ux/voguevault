# VogueVault - Environment Variables Setup Guide

## Overview
VogueVault consists of two main deployments:
- **Frontend**: Next.js on Vercel (https://voguevault-cyan.vercel.app)
- **Backend**: Express.js on Render (https://voguevault-api.onrender.com)

## Frontend Environment Variables (Vercel)

### Public Environment Variables (NEXT_PUBLIC_*)
These are visible in client-side code and must be prefixed with `NEXT_PUBLIC_`

**Required:**
- `NEXT_PUBLIC_API_URL`: Backend API endpoint
  - Production: `https://voguevault-api.onrender.com`
  - Development: `http://localhost:3001`

**Optional Feature Flags:**
- `NEXT_PUBLIC_ENABLE_DEMO`: Enable demo mode (`true`/`false`)
- `NEXT_PUBLIC_ENABLE_RECOMMENDATIONS`: Enable Aurora AI features (`true`/`false`)

### Setting Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your `voguevault` project
3. Navigate to **Settings → Environment Variables**
4. Add each variable:
   - Variable name: `NEXT_PUBLIC_API_URL`
   - Value: `https://voguevault-api.onrender.com`
   - Environments: Production, Preview, Development (select all)
5. Click "Save"
6. Go to **Deployments** and trigger a **Redeploy** of the latest commit

### Environment Variables in Development

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=https://voguevault-api.onrender.com
NEXT_PUBLIC_ENABLE_DEMO=true
NEXT_PUBLIC_ENABLE_RECOMMENDATIONS=true
```

Then restart your development server:
```bash
npm run dev
```

## Backend Environment Variables (Render)

### Required Environment Variables

**Database Configuration:**
- `DB_HOST`: PostgreSQL database hostname (e.g., from your provider)
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password (use strong password)
- `DB_NAME`: Database name
- `DB_PORT`: Database port (usually `5432`)

**Authentication:**
- `JWT_SECRET`: Secret key for signing JWT tokens (use strong random string)
  - Recommendation: `openssl rand -hex 32`

**External Services:**
- `CLOUDINARY_API_KEY`: Cloudinary API key for image processing
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `RESEND_API_KEY`: Resend API key for email notifications

**CORS Configuration:**
- `CORS_ORIGIN`: Frontend URL
  - Production: `https://voguevault-cyan.vercel.app`
  - Development: `http://localhost:3000`

### Setting Environment Variables in Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your `voguevault-api` service
3. Navigate to **Settings → Environment**
4. Click **Add Environment Variable** for each:
   - `DB_HOST`: [Your database host]
   - `DB_USER`: [Your database user]
   - `DB_PASSWORD`: [Your database password]
   - `DB_NAME`: [Your database name]
   - `JWT_SECRET`: [Generate with `openssl rand -hex 32`]
   - `CLOUDINARY_API_KEY`: [Your Cloudinary key]
   - `CLOUDINARY_API_SECRET`: [Your Cloudinary secret]
   - `RESEND_API_KEY`: [Your Resend API key]
   - `CORS_ORIGIN`: `https://voguevault-cyan.vercel.app`
5. Click **Save Changes**
6. Service will automatically redeploy with new environment variables

### Testing Backend with curl

After setting environment variables, test the health endpoint:

```bash
curl -X GET https://voguevault-api.onrender.com/health

# Expected response:
# {"status":"ok","timestamp":"2025-01-15T10:30:00Z","uptime":123.45}
```

## Local Development Setup

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENABLE_DEMO=true
NEXT_PUBLIC_ENABLE_RECOMMENDATIONS=true
```

### Backend (.env in backend directory)
```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=voguevault_dev
DB_PORT=5432
JWT_SECRET=your_secret_key_here
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
RESEND_API_KEY=your_key
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

## Testing API Integration

### 1. Check Backend Health
```bash
curl https://voguevault-api.onrender.com/health
```

### 2. Test Authentication Flow
Visit the Frontend and:
1. Click "Sign In" button (or navigate to `/auth`)
2. Sign up with a new account or use demo credentials
3. Check browser console for API calls
4. Dashboard page should display user info and API health status

### 3. Test Product Listing
1. After authentication, go to `/products`
2. Products should load from backend
3. Check Network tab to verify API calls to `/products`

### 4. Test Aurora AI Recommendations
1. Navigate to `/recommendations`
2. Select occasion and mood
3. Click "Generate Outfit"
4. Backend should return outfit recommendations

## Troubleshooting

### Frontend Returns 404
- Verify Vercel deployment completed successfully
- Check Vercel deployments tab for latest build status
- Ensure domain `voguevault-cyan.vercel.app` is assigned to latest deployment

### API Calls Fail (CORS Error)
- Check `CORS_ORIGIN` environment variable on Render backend
- Ensure it matches your frontend URL exactly
- Render backend may need redeploy after env var changes

### Auth Token Not Persisting
- Check browser localStorage (DevTools → Application → Local Storage)
- Verify `useAuth` hook is reading/writing `authToken` key
- Check browser console for any auth-related errors

### Database Connection Issues
- Verify all DB_* environment variables are set correctly
- Test database connection from your machine:
  ```bash
  psql -h [DB_HOST] -U [DB_USER] -d [DB_NAME] -c "SELECT 1;"
  ```
- Check Render logs for connection errors

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong secrets** - Generate with `openssl rand -hex 32`
3. **Rotate secrets regularly** - Update JWT_SECRET periodically
4. **Restrict CORS** - Only allow frontend domain
5. **Use HTTPS** - Both Render and Vercel provide HTTPS by default
6. **Monitor logs** - Check Render/Vercel dashboards for errors

## Next Steps

After environment setup:
1. ✅ Verify backend health: `https://voguevault-api.onrender.com/health`
2. ✅ Test frontend loading: `https://voguevault-cyan.vercel.app`
3. ✅ Sign up and test auth flow
4. ✅ Test API integration (products, recommendations)
5. ✅ Monitor error logs in Vercel/Render dashboards
